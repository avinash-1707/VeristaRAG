import json
import logging
from typing import NamedTuple

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

_INTENT_PROMPT = (
    'Classify the question and return a JSON object with three fields.\n\n'
    'FIELD 1 — "intent": one of:\n'
    '  "summary"      — overview, broad understanding, or general description of the document\n'
    '                   Examples: "What is this doc about?", "Summarize this", "What does this document cover?",\n'
    '                             "Give me an overview", "What is the main topic?"\n'
    '  "extraction"   — list every instance of something (dates, names, clauses, amounts, parties)\n'
    '                   Examples: "List all dates", "Extract all party names", "What obligations are mentioned?"\n'
    '  "comparison"   — compare or contrast two or more items from the document\n'
    '                   Examples: "Compare section A and B", "Differences between X and Y"\n'
    '  "boolean"      — yes/no question about whether something exists or is true in the document\n'
    '                   Examples: "Is X mentioned?", "Does the document contain Y?", "Was Z discussed?"\n'
    '  "definition"   — explain a term or concept as used in the document\n'
    '                   Examples: "What does X mean here?", "Define Y as used in the document"\n'
    '  "factual"      — specific fact, name, date, clause, value, or detail from the document\n'
    '                   Examples: "What is the deadline?", "Who signed?", "What does clause 3.2 say?"\n'
    '  "chitchat"     — greeting, thanks, or small talk with no document question\n'
    '                   Examples: "Hello", "Thanks!", "Great job", "How are you?"\n'
    '  "out_of_scope" — completely unrelated to any document (general knowledge, weather, etc.)\n'
    '                   Examples: "What is the capital of France?", "Tell me a joke"\n\n'
    'FIELD 2 — "hypothetical": ONLY if intent is "factual", write a 2-4 sentence formal document-style\n'
    'passage that would directly answer the question (HyDE technique for better retrieval).\n'
    'Empty string for all other intents.\n\n'
    'FIELD 3 — "standalone_query": if the question uses pronouns or references that require conversation\n'
    'history to understand (e.g., "tell me more about that", "what about section 3?",\n'
    '"expand on the previous point", "and what about X?"), rewrite it as a fully self-contained question.\n'
    'Empty string if the question is already standalone.\n\n'
    'Return JSON only.'
)

_RESPONSE_SCHEMA = {
    'type': 'OBJECT',
    'properties': {
        'intent': {
            'type': 'STRING',
            'enum': [
                'summary', 'extraction', 'comparison', 'boolean',
                'definition', 'factual', 'chitchat', 'out_of_scope',
            ],
        },
        'hypothetical': {'type': 'STRING'},
        'standalone_query': {'type': 'STRING'},
    },
    'required': ['intent', 'hypothetical', 'standalone_query'],
}

_VALID_INTENTS = {
    'summary', 'extraction', 'comparison', 'boolean',
    'definition', 'factual', 'chitchat', 'out_of_scope',
}


class IntentResult(NamedTuple):
    intent: str
    hypothetical: str
    standalone_query: str


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.google_api_key)
    return _client


def _get_models() -> list[str]:
    return [m.strip() for m in settings.gemini_chat_models.split(',') if m.strip()]


def _build_history_snippet(history: list[dict]) -> str:
    if not history:
        return ''
    recent = history[-4:]
    lines = []
    for msg in recent:
        role = 'User' if msg['role'] == 'user' else 'Assistant'
        lines.append(f'{role}: {msg["content"][:200]}')
    return '\n\nRecent conversation:\n' + '\n'.join(lines)


async def classify_intent(question: str, history: list[dict] | None = None) -> IntentResult:
    """Classify intent; for factual queries also generates a HyDE passage in one call.

    Saves one round-trip vs calling classify + generate_hypothetical separately.
    Falls back to (factual, '', '') if all models fail.
    """
    client = _get_client()
    history_snippet = _build_history_snippet(history or [])
    contents = f'{_INTENT_PROMPT}{history_snippet}\n\nQuestion: {question}'

    config = types.GenerateContentConfig(
        response_mime_type='application/json',
        response_schema=_RESPONSE_SCHEMA,
        max_output_tokens=300,
        temperature=0.0,
    )

    for model in _get_models():
        try:
            response = await client.aio.models.generate_content(
                model=model,
                contents=contents,
                config=config,
            )
            data = json.loads(response.text or '{}')
            intent = data.get('intent', '')
            if intent in _VALID_INTENTS:
                return IntentResult(
                    intent=intent,
                    hypothetical=data.get('hypothetical', '') or '',
                    standalone_query=data.get('standalone_query', '') or '',
                )
            logger.warning('Intent classifier: unexpected value "%s" from %s', intent, model)
        except genai_errors.ClientError as exc:
            if exc.code == 429:
                logger.warning('Intent classifier: %s quota exhausted, trying next', model)
                continue
            logger.warning('Intent classifier: %s client error, trying next: %s', model, exc)
            continue
        except Exception as exc:
            logger.warning('Intent classifier: %s failed, trying next: %s', model, exc)
            continue

    logger.warning('Intent classifier: all models exhausted, defaulting to factual')
    return IntentResult(intent='factual', hypothetical='', standalone_query='')

import { notFound } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'
import type { ChatSession, Message } from '@/lib/types'
import ChatWindow from '@/components/chat/ChatWindow'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params
  const token = await getAccessToken()
  if (!token) notFound()

  const res = await fetch(`${DJANGO_URL}/api/chat/sessions/${sessionId}/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) notFound()

  const data = (await res.json()) as { session: ChatSession; messages: Message[] }

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <ChatWindow
        sessionId={sessionId}
        sessionTitle={data.session.title}
        documentIds={data.session.document_ids}
        initialMessages={data.messages}
      />
    </div>
  )
}

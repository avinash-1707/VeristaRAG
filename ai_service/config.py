from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    internal_api_key: str
    google_api_key: str
    cohere_api_key: str = ''
    cloudinary_url: str = ''
    gemini_chat_models: str = 'gemini-2.5-flash-lite,gemini-2.0-flash-lite'

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')


settings = Settings()

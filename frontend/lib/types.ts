export type DocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed'

export type MessageRole = 'user' | 'assistant'

export interface User {
  id: string
  email: string
  name: string
}

export interface Document {
  id: string
  filename: string
  file_type: string
  status: DocumentStatus
  chunk_count: number
  file_size_bytes: number
  uploaded_at: string
}

export interface ChatSession {
  id: string
  title: string
  document_ids: string[]
  created_at: string
}

export interface Citation {
  chunk_id: string
  document_name: string
  page_number: number
  similarity_score: number
  content?: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  created_at: string
  citations?: Citation[]
  grounding_score?: number
  top_similarity_score?: number
}

export interface DashboardStats {
  document_count: number
  query_count: number
  avg_grounding_score: number
  cache_hit_rate: number
}

export interface QueryLog {
  id: string
  question: string
  grounding_score: number
  top_similarity_score: number
  cache_hit: boolean
  created_at: string
}

export interface CloudinarySignature {
  signature: string
  timestamp: number
  folder: string
  cloud_name: string
  api_key: string
  upload_preset?: string
}

export interface StreamEvent {
  token?: string
  done?: boolean
  answer?: string
  citations?: Citation[]
  grounding_score?: number
  top_similarity_score?: number
}

export interface ApiError {
  error: string
}

import type {
  ChatSession,
  CloudinarySignature,
  DashboardStats,
  Document,
  Message,
  QueryLog,
  User,
} from './types'

type ApiResult<T> = { data: T } | { error: string }

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  retry = true,
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const body = await res.json().catch(() => ({}))

  if (res.status === 401 && retry) {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
    if (refreshRes.ok) {
      return apiFetch<T>(path, init, false)
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return { error: 'Session expired' }
  }

  if (!res.ok) {
    return { error: (body as { error?: string }).error ?? 'Request failed' }
  }
  return { data: body as T }
}

export async function loginApi(email: string, password: string): Promise<ApiResult<User>> {
  return apiFetch<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signupApi(
  email: string,
  password: string,
  full_name: string,
): Promise<ApiResult<User>> {
  return apiFetch<User>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  })
}

export async function logoutApi(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function getMeApi(): Promise<ApiResult<User>> {
  return apiFetch<User>('/api/auth/me')
}

export async function getDocumentsApi(): Promise<ApiResult<Document[]>> {
  return apiFetch<Document[]>('/api/documents')
}

export async function deleteDocumentApi(id: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/documents/${id}`, { method: 'DELETE' })
}

export async function retryDocumentApi(id: string): Promise<ApiResult<Document>> {
  return apiFetch<Document>(`/api/documents/${id}/retry`, { method: 'POST' })
}

export async function createDocumentApi(payload: {
  filename: string
  storage_key: string
  file_type: string
  file_size_bytes: number
}): Promise<ApiResult<Document>> {
  return apiFetch<Document>('/api/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getSignatureApi(
  filename: string,
): Promise<ApiResult<CloudinarySignature>> {
  return apiFetch<CloudinarySignature>(
    `/api/documents/signature?filename=${encodeURIComponent(filename)}`,
  )
}

export async function getSessionsApi(): Promise<ApiResult<ChatSession[]>> {
  return apiFetch<ChatSession[]>('/api/chat/sessions')
}

export async function createSessionApi(payload: {
  title: string
  document_ids: string[]
}): Promise<ApiResult<ChatSession>> {
  return apiFetch<ChatSession>('/api/chat/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getSessionApi(
  sessionId: string,
): Promise<ApiResult<{ session: ChatSession; messages: Message[] }>> {
  return apiFetch<{ session: ChatSession; messages: Message[] }>(
    `/api/chat/sessions/${sessionId}`,
  )
}

export async function getDashboardStatsApi(): Promise<ApiResult<DashboardStats>> {
  return apiFetch<DashboardStats>('/api/stats')
}

export async function getQueryLogsApi(): Promise<ApiResult<QueryLog[]>> {
  return apiFetch<QueryLog[]>('/api/stats/logs')
}

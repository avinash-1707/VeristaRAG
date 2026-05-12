'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { loginApi } from '@/lib/api'

const schema = z.object({
  email: z.string().email({ error: 'Valid email required' }),
  password: z.string().min(1, { error: 'Password required' }),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues): Promise<void> {
    setServerError(null)
    const result = await loginApi(values.email, values.password)
    if ('error' in result) {
      setServerError(result.error)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="rounded-2xl border p-8"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
        Sign in
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
            style={{
              background: 'var(--bg-card-inner)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
            }}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs mt-1" style={{ color: 'var(--state-error)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
            style={{
              background: 'var(--bg-card-inner)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
            }}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs mt-1" style={{ color: 'var(--state-error)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <div
            className="rounded-lg px-3 py-2.5 text-sm"
            style={{
              background: 'var(--state-error-subtle)',
              color: 'var(--state-error)',
            }}
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(to bottom, #d4580a, #b84208)',
            color: 'var(--text-on-accent)',
            boxShadow: '0 0 20px 4px #d4580a60, inset 0 1px 0 #ffffff20',
          }}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
        No account?{' '}
        <Link
          href="/signup"
          className="font-medium transition-colors"
          style={{ color: 'var(--accent-bright)' }}
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

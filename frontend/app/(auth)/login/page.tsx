'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { loginApi } from '@/lib/api'

const schema = z.object({
  email: z.string().email({ error: 'Valid email required' }),
  password: z.string().min(1, { error: 'Password required' }),
})

type FormValues = z.infer<typeof schema>

function InputField({
  children,
  label,
  error,
}: {
  children: React.ReactNode
  label: string
  error?: string
}) {
  return (
    <div>
      <label
        className="text-sm font-medium block mb-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--state-error)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

const inputBase =
  'w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all duration-150'

const inputStyle = {
  background: 'var(--bg-card-inner)',
  border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)',
}

function onInputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'var(--accent-primary)'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,88,10,0.15)'
}

function onInputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'var(--border-strong)'
  e.currentTarget.style.boxShadow = 'none'
}

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { onBlur: emailOnBlur, ...emailRegister } = register('email')
  const { onBlur: passwordOnBlur, ...passwordRegister } = register('password')

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
        boxShadow: '0 0 40px 8px var(--glow-soft)',
      }}
    >
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
        Sign in
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className={inputBase}
            style={{ ...inputStyle }}
            onFocus={onInputFocus}
            onBlur={(e) => { onInputBlur(e); emailOnBlur(e); }}
            {...emailRegister}
          />
        </InputField>

        <InputField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${inputBase} pr-10`}
              style={{ ...inputStyle }}
              onFocus={onInputFocus}
              onBlur={(e) => { onInputBlur(e); passwordOnBlur(e); }}
              {...passwordRegister}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-bright)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </InputField>

        {serverError && (
          <div
            className="rounded-lg px-3 py-2.5 text-sm"
            style={{
              background: 'var(--state-error-subtle)',
              color: 'var(--state-error)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          style={{
            background: 'linear-gradient(to bottom, #d4580a, #b84208)',
            color: 'var(--text-on-accent)',
            boxShadow: '0 0 20px 4px #d4580a60, inset 0 1px 0 #ffffff20',
          }}
          onMouseEnter={e => {
            if (!isSubmitting) {
              e.currentTarget.style.background = 'linear-gradient(to bottom, #e8751a, #c4520a)'
              e.currentTarget.style.boxShadow = '0 0 28px 6px #d4580a80, inset 0 1px 0 #ffffff20'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(to bottom, #d4580a, #b84208)'
            e.currentTarget.style.boxShadow = '0 0 20px 4px #d4580a60, inset 0 1px 0 #ffffff20'
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

import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      login(data.token, {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      })
      if (data.role === 'CUSTOMER') navigate('/my-applications')
      else navigate('/partner')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '로그인에 실패했습니다.')
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="이메일"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="비밀번호"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-medium">
          로그인
        </button>
      </form>
    </div>
  )
}

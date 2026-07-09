import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', termsAgreed: false })
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.termsAgreed) {
      setError('이용약관 및 개인정보 수집·이용에 동의해야 합니다.')
      return
    }
    try {
      const { data } = await api.post('/api/auth/register', form)
      login(data.token, { userId: data.userId, name: data.name, email: data.email, role: data.role })
      navigate('/apply')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '회원가입에 실패했습니다.')
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="이름"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="이메일"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="비밀번호 (8자 이상)"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          placeholder="연락처 (010-0000-0000)"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.termsAgreed}
            onChange={(e) => setForm({ ...form, termsAgreed: e.target.checked })}
          />
          이용약관 및 개인정보 수집·이용에 동의합니다.
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-medium">
          가입하기
        </button>
      </form>
    </div>
  )
}

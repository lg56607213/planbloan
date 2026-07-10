import { FormEvent, useEffect, useState } from 'react'
import { UserCog } from 'lucide-react'
import { api } from '../api/client'

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', birthDate: '', gender: '', address: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/me/profile').then((res) => {
      const d = res.data
      setForm({
        name: d.name ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        birthDate: d.birthDate ?? '',
        gender: d.gender ?? '',
        address: d.address ?? '',
      })
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    try {
      await api.put('/api/me/profile', {
        name: form.name,
        phone: form.phone,
        birthDate: form.birthDate || null,
        gender: form.gender || null,
        address: form.address || null,
      })
      setSaved(true)
    } catch (err: any) {
      setError(err.response?.data?.message ?? '저장에 실패했습니다.')
    }
  }

  if (loading) return <p className="text-gray-500">불러오는 중...</p>

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserCog size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">개인정보</h2>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          아래 정보는 전자계약서 작성 시 채무자란에 자동으로 반영됩니다.
        </p>

        <label className="text-sm block">
          이메일 (로그인 아이디)
          <input disabled value={form.email} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 mt-1" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            이름
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
          <label className="text-sm">
            연락처
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
          <label className="text-sm">
            생년월일
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
          <label className="text-sm">
            성별
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1">
              <option value="">선택 안 함</option>
              <option value="MALE">남</option>
              <option value="FEMALE">여</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            주소
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">저장되었습니다.</p>}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl py-3 font-semibold">
          저장
        </button>
      </form>
    </div>
  )
}

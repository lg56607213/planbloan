import { FormEvent, useEffect, useState } from 'react'
import { Users, UserPlus, Link2 } from 'lucide-react'
import { api } from '../api/client'

interface ErpCustomer {
  id: number
  name: string
  phone: string | null
  birthDate: string | null
  gender: string | null
  address: string | null
  source: string
  memo: string | null
  createdAt: string
}

const EMPTY_FORM = { name: '', phone: '', birthDate: '', gender: '', address: '', memo: '' }

export default function PartnerCustomersPage() {
  const [customers, setCustomers] = useState<ErpCustomer[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api.get('/api/partner/erp/customers').then((res) => setCustomers(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/api/partner/erp/customers', {
        ...form,
        birthDate: form.birthDate || null,
        gender: form.gender || null,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message ?? '등록에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">PlanB를 통해 대출이 성사된 고객은 자동으로 등록되며, 직접 진행한 건은 여기서 추가할 수 있습니다.</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-4 py-2 text-sm font-medium shrink-0">
          <UserPlus size={15} /> 고객 등록
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="이름" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input placeholder="연락처" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="date" placeholder="생년월일" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm">
              <option value="">성별 선택 안 함</option>
              <option value="MALE">남</option>
              <option value="FEMALE">여</option>
            </select>
            <input placeholder="주소" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm sm:col-span-2" />
            <input placeholder="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm sm:col-span-2" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2 text-sm font-medium">
            저장
          </button>
        </form>
      )}

      <div className="space-y-2">
        {customers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
            <Users className="mx-auto mb-2" size={28} />
            등록된 고객이 없습니다.
          </div>
        )}
        {customers.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                {c.name}
                {c.source === 'PLATFORM' && (
                  <span className="flex items-center gap-0.5 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                    <Link2 size={10} /> PlanB
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">{c.phone ?? '-'} {c.address ? `· ${c.address}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

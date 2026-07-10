import { FormEvent, useEffect, useState } from 'react'
import { Calculator, PlusCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '../api/client'

interface Voucher {
  id: number
  voucherDate: string
  type: string
  category: string
  amount: number
  description: string | null
}

const EMPTY_FORM = { voucherDate: '', type: 'INCOME', category: '', amount: '', description: '' }

export default function PartnerAccountingPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api.get('/api/partner/erp/vouchers').then((res) => setVouchers(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/api/partner/erp/vouchers', {
        voucherDate: form.voucherDate,
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        description: form.description || null,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message ?? '등록에 실패했습니다.')
    }
  }

  const totalIncome = vouchers.filter((v) => v.type === 'INCOME').reduce((sum, v) => sum + v.amount, 0)
  const totalExpense = vouchers.filter((v) => v.type === 'EXPENSE').reduce((sum, v) => sum + v.amount, 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-600 shrink-0">
            <TrendingUp size={18} />
          </span>
          <div>
            <p className="text-xs text-gray-500">총 수입</p>
            <p className="font-bold text-gray-900">{totalIncome.toLocaleString()}원</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 shrink-0">
            <TrendingDown size={18} />
          </span>
          <div>
            <p className="text-xs text-gray-500">총 지출</p>
            <p className="font-bold text-gray-900">{totalExpense.toLocaleString()}원</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">수입/지출 내역을 기록해 간단한 자금 현황을 관리합니다.</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-4 py-2 text-sm font-medium shrink-0">
          <PlusCircle size={15} /> 전표 등록
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.voucherDate} onChange={(e) => setForm({ ...form, voucherDate: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm">
              <option value="INCOME">수입</option>
              <option value="EXPENSE">지출</option>
            </select>
            <input placeholder="분류 (예: 이자수익)" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="number" placeholder="금액" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <input placeholder="설명 (선택)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2 text-sm font-medium">
            저장
          </button>
        </form>
      )}

      <div className="space-y-2">
        {vouchers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
            <Calculator className="mx-auto mb-2" size={28} />
            등록된 전표가 없습니다.
          </div>
        )}
        {vouchers.map((v) => (
          <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{v.category}</p>
              <p className="text-xs text-gray-400">{v.voucherDate} {v.description ? `· ${v.description}` : ''}</p>
            </div>
            <p className={`font-semibold ${v.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
              {v.type === 'INCOME' ? '+' : '-'}{v.amount.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

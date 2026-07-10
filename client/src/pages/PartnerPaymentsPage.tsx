import { FormEvent, useEffect, useState } from 'react'
import { Wallet, PlusCircle, CheckCircle2 } from 'lucide-react'
import { api } from '../api/client'

interface PaymentRecord {
  id: number
  contractId: number
  contractNumber: string
  customerName: string
  dueDate: string
  dueAmount: number
  paidDate: string | null
  paidAmount: number | null
  status: string
  memo: string | null
}

interface ErpContract {
  id: number
  contractNumber: string
  customerName: string
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: '예정', className: 'bg-gray-100 text-gray-600' },
  PAID: { label: '납부완료', className: 'bg-green-100 text-green-700' },
  OVERDUE: { label: '연체', className: 'bg-red-100 text-red-700' },
}

export default function PartnerPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [contracts, setContracts] = useState<ErpContract[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ contractId: '', dueDate: '', dueAmount: '', memo: '' })
  const [payForm, setPayForm] = useState<Record<number, { paidDate: string; paidAmount: string }>>({})
  const [error, setError] = useState<string | null>(null)

  function load() {
    api.get('/api/partner/erp/payments').then((res) => setPayments(res.data))
    api.get('/api/partner/erp/contracts').then((res) => setContracts(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.contractId) {
      setError('계약을 선택해 주세요.')
      return
    }
    try {
      await api.post(`/api/partner/erp/contracts/${form.contractId}/payments`, {
        dueDate: form.dueDate,
        dueAmount: Number(form.dueAmount),
        memo: form.memo || null,
      })
      setForm({ contractId: '', dueDate: '', dueAmount: '', memo: '' })
      setShowForm(false)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message ?? '등록에 실패했습니다.')
    }
  }

  async function markPaid(id: number) {
    const p = payForm[id] ?? { paidDate: new Date().toISOString().slice(0, 10), paidAmount: '' }
    await api.patch(`/api/partner/erp/payments/${id}/mark-paid`, {
      paidDate: p.paidDate,
      paidAmount: Number(p.paidAmount),
    })
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">계약별 납부 예정일을 등록하고, 입금이 확인되면 납부완료로 처리합니다.</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-4 py-2 text-sm font-medium shrink-0">
          <PlusCircle size={15} /> 납부일정 등록
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <select value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm">
            <option value="">계약 선택</option>
            {contracts.map((c) => <option key={c.id} value={c.id}>{c.customerName} ({c.contractNumber})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="number" placeholder="납부예정금액" required value={form.dueAmount}
              onChange={(e) => setForm({ ...form, dueAmount: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <input placeholder="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2 text-sm font-medium">
            저장
          </button>
        </form>
      )}

      <div className="space-y-2">
        {payments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
            <Wallet className="mx-auto mb-2" size={28} />
            등록된 납부 일정이 없습니다.
          </div>
        )}
        {payments.map((p) => {
          const statusStyle = STATUS_STYLE[p.status] ?? { label: p.status, className: 'bg-gray-100 text-gray-600' }
          const pf = payForm[p.id] ?? { paidDate: new Date().toISOString().slice(0, 10), paidAmount: String(p.dueAmount) }
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{p.customerName}</p>
                  <p className="text-xs text-gray-400">{p.contractNumber}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    납부예정일 {p.dueDate} · {p.dueAmount.toLocaleString()}원
                    {p.paidDate && ` · 납부일 ${p.paidDate} (${p.paidAmount?.toLocaleString()}원)`}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusStyle.className}`}>
                  {statusStyle.label}
                </span>
              </div>
              {p.status === 'SCHEDULED' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <input type="date" value={pf.paidDate}
                    onChange={(e) => setPayForm({ ...payForm, [p.id]: { ...pf, paidDate: e.target.value } })}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm" />
                  <input type="number" value={pf.paidAmount}
                    onChange={(e) => setPayForm({ ...payForm, [p.id]: { ...pf, paidAmount: e.target.value } })}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm w-32" />
                  <button onClick={() => markPaid(p.id)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 transition text-white rounded-lg px-3 py-1.5 text-sm font-medium">
                    <CheckCircle2 size={14} /> 납부확인
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

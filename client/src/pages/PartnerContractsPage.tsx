import { FormEvent, useEffect, useState } from 'react'
import { FileSignature, PlusCircle, Home, Car, CreditCard, Link2 } from 'lucide-react'
import { api } from '../api/client'

interface ErpContract {
  id: number
  contractNumber: string
  customerId: number
  customerName: string
  loanType: string
  financedAmount: number
  interestRateAnnual: number | null
  periodMonths: number | null
  contractDate: string | null
  expiryDate: string | null
  status: string
  source: string
  memo: string | null
}

interface ErpCustomer {
  id: number
  name: string
}

const LOAN_TYPE_META: Record<string, { label: string; Icon: typeof Home }> = {
  REAL_ESTATE_COLLATERAL: { label: '부동산 담보대출', Icon: Home },
  CAR_COLLATERAL: { label: '자동차 담보대출', Icon: Car },
  CREDIT: { label: '신용대출', Icon: CreditCard },
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: '진행중', className: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: '완료', className: 'bg-green-100 text-green-700' },
  OVERDUE: { label: '연체', className: 'bg-red-100 text-red-700' },
  TERMINATED: { label: '중도해지', className: 'bg-gray-200 text-gray-600' },
}

const EMPTY_FORM = {
  customerId: '', newCustomerName: '', newCustomerPhone: '', contractNumber: '',
  loanType: 'CREDIT', financedAmount: '', interestRateAnnual: '', periodMonths: '',
  contractDate: '', expiryDate: '', memo: '',
}

export default function PartnerContractsPage() {
  const [contracts, setContracts] = useState<ErpContract[]>([])
  const [customers, setCustomers] = useState<ErpCustomer[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [useExisting, setUseExisting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api.get('/api/partner/erp/contracts').then((res) => setContracts(res.data))
    api.get('/api/partner/erp/customers').then((res) => setCustomers(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/api/partner/erp/contracts', {
        customerId: useExisting && form.customerId ? Number(form.customerId) : null,
        newCustomerName: !useExisting ? form.newCustomerName : null,
        newCustomerPhone: !useExisting ? form.newCustomerPhone : null,
        contractNumber: form.contractNumber || null,
        loanType: form.loanType,
        financedAmount: Number(form.financedAmount),
        interestRateAnnual: form.interestRateAnnual ? Number(form.interestRateAnnual) : null,
        periodMonths: form.periodMonths ? Number(form.periodMonths) : null,
        contractDate: form.contractDate || null,
        expiryDate: form.expiryDate || null,
        memo: form.memo || null,
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
        <p className="text-sm text-gray-500">PlanB 전자계약이 완료되면 자동으로 등록되며, 직접 진행한 계약은 여기서 추가할 수 있습니다.</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-4 py-2 text-sm font-medium shrink-0">
          <PlusCircle size={15} /> 계약 등록
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={useExisting} onChange={() => setUseExisting(true)} /> 기존 고객
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={!useExisting} onChange={() => setUseExisting(false)} /> 신규 고객
            </label>
          </div>
          {useExisting ? (
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm">
              <option value="">고객 선택</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="고객명" value={form.newCustomerName} onChange={(e) => setForm({ ...form, newCustomerName: e.target.value })}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
              <input placeholder="연락처" value={form.newCustomerPhone} onChange={(e) => setForm({ ...form, newCustomerPhone: e.target.value })}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <select value={form.loanType} onChange={(e) => setForm({ ...form, loanType: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm">
              <option value="CREDIT">신용대출</option>
              <option value="REAL_ESTATE_COLLATERAL">부동산 담보대출</option>
              <option value="CAR_COLLATERAL">자동차 담보대출</option>
            </select>
            <input placeholder="계약번호 (선택)" value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="number" placeholder="대출금액" required value={form.financedAmount}
              onChange={(e) => setForm({ ...form, financedAmount: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="number" step="0.1" placeholder="연 금리(%)" value={form.interestRateAnnual}
              onChange={(e) => setForm({ ...form, interestRateAnnual: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="number" placeholder="상환기간(개월)" value={form.periodMonths}
              onChange={(e) => setForm({ ...form, periodMonths: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="date" value={form.contractDate} onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input type="date" placeholder="만기일" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
            <input placeholder="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2 text-sm font-medium">
            저장
          </button>
        </form>
      )}

      <div className="space-y-2">
        {contracts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
            <FileSignature className="mx-auto mb-2" size={28} />
            등록된 계약이 없습니다.
          </div>
        )}
        {contracts.map((c) => {
          const typeMeta = LOAN_TYPE_META[c.loanType]
          const TypeIcon = typeMeta?.Icon ?? CreditCard
          const statusStyle = STATUS_STYLE[c.status] ?? { label: c.status, className: 'bg-gray-100 text-gray-600' }
          return (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <TypeIcon size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      {c.customerName}
                      {c.source === 'PLATFORM' && (
                        <span className="flex items-center gap-0.5 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                          <Link2 size={10} /> PlanB
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{c.contractNumber}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusStyle.className}`}>
                  {statusStyle.label}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-600">
                {typeMeta?.label ?? c.loanType} · {c.financedAmount.toLocaleString()}원
                {c.interestRateAnnual != null && ` · 연 ${c.interestRateAnnual}%`}
                {c.periodMonths != null && ` · ${c.periodMonths}개월`}
                {c.contractDate && ` · ${c.contractDate} ~ ${c.expiryDate ?? ''}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

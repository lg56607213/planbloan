import { useEffect, useState } from 'react'
import { Home, Car, CreditCard } from 'lucide-react'
import { api } from '../api/client'

const LOAN_TYPES = [
  { value: 'CREDIT', label: '신용대출', Icon: CreditCard, isCredit: true },
  { value: 'REAL_ESTATE_COLLATERAL', label: '부동산 담보대출', Icon: Home, isCredit: false },
  { value: 'CAR_COLLATERAL', label: '자동차 담보대출', Icon: Car, isCredit: false },
]

interface CriteriaForm {
  maxAmount: string
  interestRateAnnual: string
  minCreditScoreKcb: string
  minCreditScoreNice: string
  minMonthlyIncome: string
  maxLtvPercent: string
  active: boolean
}

const EMPTY: CriteriaForm = {
  maxAmount: '', interestRateAnnual: '', minCreditScoreKcb: '', minCreditScoreNice: '',
  minMonthlyIncome: '', maxLtvPercent: '', active: true,
}

export default function PartnerCriteriaPage() {
  const [forms, setForms] = useState<Record<string, CriteriaForm>>({
    CREDIT: { ...EMPTY }, REAL_ESTATE_COLLATERAL: { ...EMPTY }, CAR_COLLATERAL: { ...EMPTY },
  })
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/partner/criteria').then((res) => {
      const next = { ...forms }
      for (const c of res.data) {
        next[c.loanType] = {
          maxAmount: String(c.maxAmount ?? ''),
          interestRateAnnual: String(c.interestRateAnnual ?? ''),
          minCreditScoreKcb: c.minCreditScoreKcb != null ? String(c.minCreditScoreKcb) : '',
          minCreditScoreNice: c.minCreditScoreNice != null ? String(c.minCreditScoreNice) : '',
          minMonthlyIncome: c.minMonthlyIncome != null ? String(c.minMonthlyIncome) : '',
          maxLtvPercent: c.maxLtvPercent != null ? String(c.maxLtvPercent) : '',
          active: c.active,
        }
      }
      setForms(next)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update(loanType: string, field: keyof CriteriaForm, value: string | boolean) {
    setForms((prev) => ({ ...prev, [loanType]: { ...prev[loanType], [field]: value } }))
  }

  async function save(loanType: string) {
    const f = forms[loanType]
    setSavedMessage(null)
    await api.put(`/api/partner/criteria/${loanType}`, {
      maxAmount: Number(f.maxAmount),
      interestRateAnnual: Number(f.interestRateAnnual),
      minCreditScoreKcb: f.minCreditScoreKcb ? Number(f.minCreditScoreKcb) : null,
      minCreditScoreNice: f.minCreditScoreNice ? Number(f.minCreditScoreNice) : null,
      minMonthlyIncome: f.minMonthlyIncome ? Number(f.minMonthlyIncome) : null,
      maxLtvPercent: f.maxLtvPercent ? Number(f.maxLtvPercent) : null,
      active: f.active,
    })
    setSavedMessage(`${loanType} 조건이 저장되었습니다.`)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대출조건 설정</h1>
        <p className="text-sm text-gray-500 mt-1">대출종류별로 취급 한도, 금리, 자격 조건을 설정하면 조건에 맞는 고객에게 자동으로 노출됩니다.</p>
      </div>

      {savedMessage && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">{savedMessage}</p>}

      {LOAN_TYPES.map(({ value, label, Icon, isCredit }) => {
        const f = forms[value]
        return (
          <div key={value} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Icon size={18} />
              </span>
              <h2 className="font-semibold text-gray-900">{label}</h2>
              <label className="ml-auto flex items-center gap-1.5 text-sm text-gray-600">
                <input type="checkbox" checked={f.active} onChange={(e) => update(value, 'active', e.target.checked)} />
                취급중
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                최대 한도(원)
                <input type="number" value={f.maxAmount} onChange={(e) => update(value, 'maxAmount', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1" />
              </label>
              <label className="text-sm">
                연 금리(%)
                <input type="number" step="0.1" value={f.interestRateAnnual} onChange={(e) => update(value, 'interestRateAnnual', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1" />
              </label>

              {isCredit ? (
                <>
                  <label className="text-sm">
                    최소 신용점수 KCB
                    <input type="number" value={f.minCreditScoreKcb} onChange={(e) => update(value, 'minCreditScoreKcb', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1" />
                  </label>
                  <label className="text-sm">
                    최소 신용점수 NICE
                    <input type="number" value={f.minCreditScoreNice} onChange={(e) => update(value, 'minCreditScoreNice', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1" />
                  </label>
                  <label className="text-sm col-span-2">
                    최소 월소득(원)
                    <input type="number" value={f.minMonthlyIncome} onChange={(e) => update(value, 'minMonthlyIncome', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1" />
                  </label>
                </>
              ) : (
                <label className="text-sm col-span-2">
                  최대 LTV(%)
                  <input type="number" value={f.maxLtvPercent} onChange={(e) => update(value, 'maxLtvPercent', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1" />
                </label>
              )}
            </div>

            <button onClick={() => save(value)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2 text-sm font-medium">
              저장
            </button>
          </div>
        )
      })}
    </div>
  )
}

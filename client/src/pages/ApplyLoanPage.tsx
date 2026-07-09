import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Car, CreditCard, ShieldCheck, Wallet, Banknote, CheckCircle2, Search, Percent } from 'lucide-react'
import { api } from '../api/client'

const LOAN_TYPES = [
  { value: 'REAL_ESTATE_COLLATERAL', label: '부동산 담보대출', desc: '주택·상가 등 부동산을 담보로', Icon: Home },
  { value: 'CAR_COLLATERAL', label: '자동차 담보대출', desc: '보유 차량을 담보로', Icon: Car },
  { value: 'CREDIT', label: '신용대출', desc: '담보 없이 신용으로', Icon: CreditCard },
]

const EMPLOYMENT_TYPES = [
  { value: 'EMPLOYEE', label: '직장인' },
  { value: 'SELF_EMPLOYED', label: '자영업자' },
  { value: 'FREELANCER', label: '프리랜서' },
  { value: 'UNEMPLOYED', label: '무직' },
  { value: 'OTHER', label: '기타' },
]

const DOCUMENT_TYPES = [
  { value: 'ID_CARD', label: '신분증' },
  { value: 'INCOME_PROOF', label: '소득증빙 서류' },
  { value: 'BANK_STATEMENT', label: '통장 사본' },
  { value: 'EMPLOYMENT_PROOF', label: '재직/사업자 증빙' },
  { value: 'OTHER', label: '기타 서류' },
]

interface Offer {
  loanCompanyId: number
  loanCompanyName: string
  offeredAmount: number
  interestRateAnnual: number
  maxLtvPercent: number | null
}

function SectionCard({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold shrink-0">
          {step}
        </span>
        <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function AmountField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          required
          min={0}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-xl pl-4 pr-12 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
      </div>
    </label>
  )
}

export default function ApplyLoanPage() {
  const [phase, setPhase] = useState<'form' | 'offers' | 'submitted'>('form')
  const [form, setForm] = useState({
    loanType: '',
    collateralAddress: '',
    desiredAmount: '',
    monthlyIncome: '',
    employmentType: 'EMPLOYEE',
    creditScoreKcb: '',
    creditScoreNice: '',
    memo: '',
  })
  const [offers, setOffers] = useState<Offer[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [uploadType, setUploadType] = useState('ID_CARD')
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleFindOffers(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.loanType === 'REAL_ESTATE_COLLATERAL' && !form.collateralAddress.trim()) {
      setError('담보로 제공할 부동산 주소지를 입력해 주세요.')
      return
    }
    try {
      const { data } = await api.post('/api/loan-offers', {
        loanType: form.loanType,
        desiredAmount: Number(form.desiredAmount),
        monthlyIncome: Number(form.monthlyIncome),
        creditScoreKcb: Number(form.creditScoreKcb),
        creditScoreNice: Number(form.creditScoreNice),
      })
      setOffers(data)
      setSearched(true)
      setPhase('offers')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '조건 조회에 실패했습니다.')
    }
  }

  async function handleApply(offer: Offer) {
    setError(null)
    try {
      const { data } = await api.post('/api/loan-applications', {
        loanCompanyId: offer.loanCompanyId,
        loanType: form.loanType,
        collateralAddress: form.loanType === 'REAL_ESTATE_COLLATERAL' ? form.collateralAddress : null,
        desiredAmount: Number(form.desiredAmount),
        monthlyIncome: Number(form.monthlyIncome),
        employmentType: form.employmentType,
        creditScoreKcb: Number(form.creditScoreKcb),
        creditScoreNice: Number(form.creditScoreNice),
        memo: form.memo,
      })
      setApplicationId(data.id)
      setPhase('submitted')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '신청에 실패했습니다.')
    }
  }

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!applicationId) return
    const fileInput = (e.currentTarget.elements.namedItem('file') as HTMLInputElement)
    const file = fileInput.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/api/loan-applications/${applicationId}/documents?type=${uploadType}`, formData)
      setUploadMessage('업로드되었습니다.')
      fileInput.value = ''
    } catch (err: any) {
      setUploadMessage(err.response?.data?.message ?? '업로드에 실패했습니다.')
    }
  }

  if (phase === 'submitted' && applicationId) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">대출 신청이 접수되었습니다 (신청번호 #{applicationId})</p>
            <p className="text-sm text-gray-600 mt-1">
              아래에서 신분증, 소득증빙 등 서류를 업로드해 주시면 대부업체 심사가 더 빨리 진행됩니다.
            </p>
          </div>
        </div>
        <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">서류 업로드</h2>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-3 text-base"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input type="file" name="file" required className="w-full text-sm" />
          {uploadMessage && <p className="text-sm text-gray-600">{uploadMessage}</p>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-4 py-3 font-medium w-full sm:w-auto">
            업로드
          </button>
        </form>
        <button
          onClick={() => navigate('/my-applications')}
          className="w-full border border-gray-300 rounded-xl py-3 font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          내 신청 내역으로 이동
        </button>
      </div>
    )
  }

  if (phase === 'offers') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이용 가능한 대출 조건</h1>
          <p className="text-sm text-gray-500 mt-1">입력하신 정보로 조회한 결과입니다. 원하는 조건을 선택해 신청해 주세요.</p>
        </div>

        {searched && offers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            현재 조건에 맞는 대부업체가 없습니다. 신용점수나 희망금액을 조정해 다시 조회해 보세요.
          </div>
        )}

        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer.loanCompanyId} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{offer.loanCompanyName}</p>
                  <p className="text-lg font-bold text-blue-700 mt-1">{offer.offeredAmount.toLocaleString()}원까지</p>
                  <p className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Percent size={14} className="text-gray-400" /> 연 {offer.interestRateAnnual}%
                    {offer.maxLtvPercent != null && <span className="ml-2 text-gray-400">· LTV {offer.maxLtvPercent}%까지</span>}
                  </p>
                </div>
                <button onClick={() => handleApply(offer)}
                  className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-4 py-2.5 text-sm font-semibold shrink-0">
                  이 조건으로 신청
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

        <button
          onClick={() => setPhase('form')}
          className="w-full border border-gray-300 rounded-xl py-3 font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          정보 다시 입력하기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대출 신청</h1>
        <p className="text-sm text-gray-500 mt-1">정보를 입력하시면 조건에 맞는 대부업체와 대출 조건을 바로 보여드립니다.</p>
      </div>

      <form onSubmit={handleFindOffers} className="space-y-4">
        <SectionCard step={1} title="대출종류">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LOAN_TYPES.map(({ value, label, desc, Icon }) => {
              const selected = form.loanType === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, loanType: value })}
                  className={`flex flex-col items-center text-center gap-1.5 rounded-xl border-2 p-4 transition ${
                    selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={selected ? 'text-blue-600' : 'text-gray-500'} size={26} />
                  <span className={`text-sm font-semibold ${selected ? 'text-blue-700' : 'text-gray-800'}`}>{label}</span>
                  <span className="text-xs text-gray-500">{desc}</span>
                </button>
              )
            })}
          </div>
          {form.loanType === 'REAL_ESTATE_COLLATERAL' && (
            <div className="mt-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1.5">담보 제공 부동산 주소지</span>
                <input
                  required
                  placeholder="예: 서울특별시 강남구 테헤란로 100"
                  value={form.collateralAddress}
                  onChange={(e) => setForm({ ...form, collateralAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>
            </div>
          )}
        </SectionCard>

        <SectionCard step={2} title="대출 정보">
          <div className="space-y-4">
            <AmountField label="희망 대출금액" placeholder="5,000,000" value={form.desiredAmount}
              onChange={(v) => setForm({ ...form, desiredAmount: v })} />
            <AmountField label="월 소득" placeholder="3,000,000" value={form.monthlyIncome}
              onChange={(v) => setForm({ ...form, monthlyIncome: v })} />
          </div>
        </SectionCard>

        <SectionCard step={3} title="직업 형태">
          <div className="flex flex-wrap gap-2">
            {EMPLOYMENT_TYPES.map((t) => {
              const selected = form.employmentType === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, employmentType: t.value })}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition ${
                    selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard step={4} title="신용점수">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <ShieldCheck size={15} className="text-gray-400" /> KCB
              </span>
              <input
                type="number" inputMode="numeric" required min={0} max={1000}
                placeholder="예: 750"
                value={form.creditScoreKcb}
                onChange={(e) => setForm({ ...form, creditScoreKcb: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
            <label className="block">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <ShieldCheck size={15} className="text-gray-400" /> NICE
              </span>
              <input
                type="number" inputMode="numeric" required min={0} max={1000}
                placeholder="예: 780"
                value={form.creditScoreNice}
                onChange={(e) => setForm({ ...form, creditScoreNice: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">본인의 신용점수 조회 앱(KCB/NICE)에서 확인한 점수를 입력해 주세요.</p>
        </SectionCard>

        <SectionCard step={5} title="추가 전달사항 (선택)">
          <div className="flex items-start gap-2">
            <Wallet size={16} className="text-gray-300 mt-2 shrink-0" />
            <textarea
              placeholder="대부업체에 전달하고 싶은 내용이 있다면 적어주세요."
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </SectionCard>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={!form.loanType}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-white rounded-xl py-3.5 font-semibold text-base shadow-sm"
        >
          <Search size={18} />
          이용 가능한 조건 조회하기
        </button>
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Banknote size={12} /> 조회 후 원하는 조건을 선택하면 실제 신청이 접수됩니다.
        </p>
      </form>
    </div>
  )
}

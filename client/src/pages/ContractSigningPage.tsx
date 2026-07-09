import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import SignaturePad from '../components/SignaturePad'

interface Preview {
  lender: { name: string; phone: string; businessRegistrationNumber: string; lenderRegistrationNumber: string; address: string }
  debtor: { name: string; phone: string; birthDate: string | null; gender: string | null; address: string | null }
  guarantor: {
    name: string; phone: string; birthDate: string | null; gender: string | null; address: string | null
    guaranteeContractDate: string | null; guaranteePeriod: string | null; guaranteeMaxAmount: number | null; jointGuarantee: boolean
  } | null
  standardTerms: {
    bankName: string; bankAccountNumber: string; interestRateDetail: string; installmentRepaymentSchedule: string
    earlyRepaymentTerms: string; incidentalCosts: string; debtCertificateFee: string; debtCertificateIssueDeadline: string
    statutoryMaxAnnualRate: number | null
  }
  suggestedFinancedAmount: number | null
  suggestedInterestRateAnnual: number | null
  approvedPeriodMonths: number | null
  alreadySigned: boolean
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function ContractSigningPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    financedAmount: '',
    interestRateMonthly: '',
    interestRateAnnual: '',
    defaultInterestRateMonthly: '',
    defaultInterestRateAnnual: '',
    contractDate: todayIso(),
    loanExpiryDate: '',
    receiptAnswer: '수령함',
    explanationAnswer: '들었음',
    brokerageFeeAnswer: '들었음',
  })

  useEffect(() => {
    api.get(`/api/loan-applications/${id}/contract/preview`).then((res) => {
      const data: Preview = res.data
      setPreview(data)
      const annual = data.suggestedInterestRateAnnual ?? 0
      const expiry = new Date()
      if (data.approvedPeriodMonths) expiry.setMonth(expiry.getMonth() + data.approvedPeriodMonths)
      setForm((f) => ({
        ...f,
        financedAmount: data.suggestedFinancedAmount ? String(data.suggestedFinancedAmount) : '',
        interestRateAnnual: annual ? String(annual) : '',
        interestRateMonthly: annual ? String(Math.round((annual / 12) * 100) / 100) : '',
        defaultInterestRateAnnual: data.standardTerms.statutoryMaxAnnualRate
          ? String(data.standardTerms.statutoryMaxAnnualRate)
          : '',
        defaultInterestRateMonthly: data.standardTerms.statutoryMaxAnnualRate
          ? String(Math.round((data.standardTerms.statutoryMaxAnnualRate / 12) * 100) / 100)
          : '',
        loanExpiryDate: data.approvedPeriodMonths ? expiry.toISOString().slice(0, 10) : '',
      }))
    }).catch((err) => setError(err.response?.data?.message ?? '계약서 정보를 불러오지 못했습니다.'))
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!signature) {
      setError('서명을 입력해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/api/loan-applications/${id}/contract/sign`, {
        financedAmount: Number(form.financedAmount),
        interestRateMonthly: Number(form.interestRateMonthly),
        interestRateAnnual: Number(form.interestRateAnnual),
        defaultInterestRateMonthly: Number(form.defaultInterestRateMonthly),
        defaultInterestRateAnnual: Number(form.defaultInterestRateAnnual),
        contractDate: form.contractDate,
        loanExpiryDate: form.loanExpiryDate,
        receiptAnswer: form.receiptAnswer,
        explanationAnswer: form.explanationAnswer,
        brokerageFeeAnswer: form.brokerageFeeAnswer,
        signatureImageBase64: signature,
      })
      navigate('/my-applications')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '계약서 서명에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !preview) return <p className="text-red-600">{error}</p>
  if (!preview) return <p className="text-gray-500">불러오는 중...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">대부거래 표준계약서 작성</h1>

      <section className="border rounded p-4 space-y-1 text-sm">
        <h2 className="font-medium mb-2">대부업자</h2>
        <p>{preview.lender.name} · {preview.lender.phone}</p>
        <p className="text-gray-500">{preview.lender.address}</p>
      </section>

      <section className="border rounded p-4 space-y-1 text-sm">
        <h2 className="font-medium mb-2">채무자(본인)</h2>
        <p>{preview.debtor.name} · {preview.debtor.phone}</p>
        <p className="text-gray-500">{preview.debtor.birthDate ?? '생년월일 미입력'} · {preview.debtor.address ?? '주소 미입력'}</p>
      </section>

      {preview.guarantor && (
        <section className="border rounded p-4 space-y-1 text-sm">
          <h2 className="font-medium mb-2">보증인</h2>
          <p>{preview.guarantor.name} · {preview.guarantor.phone}</p>
        </section>
      )}

      <section className="border rounded p-4 space-y-1 text-sm">
        <h2 className="font-medium mb-2">거래조건 (대부업체 제공)</h2>
        <p>은행계좌: {preview.standardTerms.bankName} {preview.standardTerms.bankAccountNumber}</p>
        <p>분할상환일: {preview.standardTerms.installmentRepaymentSchedule}</p>
        <p>조기상환조건: {preview.standardTerms.earlyRepaymentTerms}</p>
        <p>부대비용: {preview.standardTerms.incidentalCosts}</p>
      </section>

      <form onSubmit={handleSubmit} className="border rounded p-4 space-y-4">
        <h2 className="font-medium">아래 항목은 본인이 직접 확인 후 기재합니다</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            대부금액(원)
            <input type="number" required value={form.financedAmount}
              onChange={(e) => setForm({ ...form, financedAmount: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm">
            계약일자
            <input type="date" required value={form.contractDate}
              onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm">
            이자율 - 월이율(%)
            <input type="number" step="0.01" required value={form.interestRateMonthly}
              onChange={(e) => setForm({ ...form, interestRateMonthly: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm">
            이자율 - 연이율(%)
            <input type="number" step="0.01" required value={form.interestRateAnnual}
              onChange={(e) => setForm({ ...form, interestRateAnnual: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm">
            연체이율 - 월이율(%)
            <input type="number" step="0.01" required value={form.defaultInterestRateMonthly}
              onChange={(e) => setForm({ ...form, defaultInterestRateMonthly: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm">
            연체이율 - 연이율(%)
            <input type="number" step="0.01" required value={form.defaultInterestRateAnnual}
              onChange={(e) => setForm({ ...form, defaultInterestRateAnnual: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm col-span-2">
            대부기간 만료일
            <input type="date" required value={form.loanExpiryDate}
              onChange={(e) => setForm({ ...form, loanExpiryDate: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
        </div>

        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">다음 사항을 읽고 본인의 의사를 사실에 근거하여 직접 기재하여 주십시오.</p>
          <label className="text-sm block">
            1. 위 계약서 및 대부거래표준약관을 확실히 수령하였습니까?
            <input required value={form.receiptAnswer}
              onChange={(e) => setForm({ ...form, receiptAnswer: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm block">
            2. 중요한 내용에 대하여 설명을 들었습니까?
            <input required value={form.explanationAnswer}
              onChange={(e) => setForm({ ...form, explanationAnswer: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
          <label className="text-sm block">
            3. 중개수수료를 채무자로부터 받는 것이 불법이라는 설명을 들었습니까?
            <input required value={form.brokerageFeeAnswer}
              onChange={(e) => setForm({ ...form, brokerageFeeAnswer: e.target.value })}
              className="w-full border rounded px-2 py-1 mt-1" />
          </label>
        </div>

        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-1">서명</p>
          <SignaturePad onChange={setSignature} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50">
          {submitting ? '처리 중...' : '계약서 서명 완료'}
        </button>
      </form>
    </div>
  )
}

import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface LoanCompany {
  id: number
  name: string
}

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

export default function ApplyLoanPage() {
  const [companies, setCompanies] = useState<LoanCompany[]>([])
  const [form, setForm] = useState({
    loanCompanyId: '',
    desiredAmount: '',
    desiredPeriodMonths: '',
    monthlyIncome: '',
    employmentType: 'EMPLOYEE',
    existingDebt: '0',
    memo: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [uploadType, setUploadType] = useState('ID_CARD')
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/loan-companies').then((res) => setCompanies(res.data))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await api.post('/api/loan-applications', {
        loanCompanyId: Number(form.loanCompanyId),
        desiredAmount: Number(form.desiredAmount),
        desiredPeriodMonths: Number(form.desiredPeriodMonths),
        monthlyIncome: Number(form.monthlyIncome),
        employmentType: form.employmentType,
        existingDebt: Number(form.existingDebt),
        memo: form.memo,
      })
      setApplicationId(data.id)
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

  if (applicationId) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="font-medium">대출 신청이 접수되었습니다 (신청번호 #{applicationId}).</p>
          <p className="text-sm text-gray-600 mt-1">
            아래에서 신분증, 소득증빙 등 서류를 업로드해 주시면 대부업체 심사가 더 빨리 진행됩니다.
          </p>
        </div>
        <form onSubmit={handleUpload} className="space-y-3 border rounded p-4">
          <h2 className="font-medium">서류 업로드</h2>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input type="file" name="file" required className="w-full" />
          {uploadMessage && <p className="text-sm text-gray-600">{uploadMessage}</p>}
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">업로드</button>
        </form>
        <button
          onClick={() => navigate('/my-applications')}
          className="w-full border rounded py-2"
        >
          내 신청 내역으로 이동
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">대출 신청</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          value={form.loanCompanyId}
          onChange={(e) => setForm({ ...form, loanCompanyId: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">대부업체 선택</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="희망 대출금액 (원)"
          required
          min={1}
          value={form.desiredAmount}
          onChange={(e) => setForm({ ...form, desiredAmount: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="희망 상환기간 (개월)"
          required
          min={1}
          value={form.desiredPeriodMonths}
          onChange={(e) => setForm({ ...form, desiredPeriodMonths: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="월 소득 (원)"
          required
          min={0}
          value={form.monthlyIncome}
          onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <select
          value={form.employmentType}
          onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="기존 부채 총액 (원)"
          required
          min={0}
          value={form.existingDebt}
          onChange={(e) => setForm({ ...form, existingDebt: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          placeholder="추가 메모 (선택)"
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-medium">
          신청하기
        </button>
      </form>
    </div>
  )
}

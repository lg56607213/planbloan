import { useEffect, useState } from 'react'
import { Home, Car, CreditCard, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../api/client'

interface LoanApplication {
  id: number
  applicantName: string
  loanType: string
  collateralAddress: string | null
  desiredAmount: number
  monthlyIncome: number
  employmentType: string
  creditScoreKcb: number | null
  creditScoreNice: number | null
  existingDebt: number
  status: string
  documents: { id: number; type: string; originalFileName: string }[]
}

interface ApplicantDocument {
  id: number
  type: string
  originalFileName: string
}

const LOAN_TYPE_META: Record<string, { label: string; Icon: typeof Home }> = {
  REAL_ESTATE_COLLATERAL: { label: '부동산 담보대출', Icon: Home },
  CAR_COLLATERAL: { label: '자동차 담보대출', Icon: Car },
  CREDIT: { label: '신용대출', Icon: CreditCard },
}

const EMPLOYMENT_LABEL: Record<string, string> = {
  EMPLOYEE: '직장인',
  SELF_EMPLOYED: '자영업자',
  FREELANCER: '프리랜서',
  UNEMPLOYED: '무직',
  OTHER: '기타',
}

const PROFILE_DOCUMENT_LABEL: Record<string, string> = {
  RESIDENT_REGISTRATION: '등본',
  NATIONAL_PENSION_CERTIFICATE: '자격득실확인서',
  HEALTH_INSURANCE_PAYMENT: '건강보험 납부내역서',
  BANK_STATEMENT: '통장사본',
}

export default function PartnerDashboardPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [decisionState, setDecisionState] = useState<Record<number, { rate: string; limit: string; period: string; reason: string }>>({})
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [applicantDocs, setApplicantDocs] = useState<Record<number, ApplicantDocument[]>>({})

  function load() {
    api.get('/api/partner/loan-applications').then((res) => setApplications(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  function updateField(id: number, field: string, value: string) {
    setDecisionState((prev) => {
      const current = prev[id] ?? { rate: '', limit: '', period: '', reason: '' }
      return { ...prev, [id]: { ...current, [field]: value } }
    })
  }

  async function approve(id: number) {
    const d = decisionState[id] ?? { rate: '', limit: '', period: '', reason: '' }
    await api.patch(`/api/partner/loan-applications/${id}/decision`, {
      approved: true,
      approvedRate: Number(d.rate),
      approvedLimit: Number(d.limit),
      approvedPeriodMonths: Number(d.period),
    })
    load()
  }

  async function reject(id: number) {
    const d = decisionState[id] ?? { rate: '', limit: '', period: '', reason: '' }
    await api.patch(`/api/partner/loan-applications/${id}/decision`, {
      approved: false,
      rejectionReason: d.reason || '심사 기준 미충족',
    })
    load()
  }

  async function toggleApplicantDocs(id: number) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!applicantDocs[id]) {
      const res = await api.get(`/api/partner/loan-applications/${id}/applicant-documents`)
      setApplicantDocs((prev) => ({ ...prev, [id]: res.data }))
    }
  }

  async function viewApplicantDocument(applicationId: number, documentId: number) {
    const res = await api.get(`/api/partner/loan-applications/${applicationId}/applicant-documents/${documentId}`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
  }

  return (
    <div>
      <div className="space-y-4">
        {applications.map((app) => {
          const d = decisionState[app.id] ?? { rate: '', limit: '', period: '', reason: '' }
          const typeMeta = LOAN_TYPE_META[app.loanType]
          const TypeIcon = typeMeta?.Icon ?? CreditCard
          const decidable = app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW'
          const expanded = expandedId === app.id
          const docs = applicantDocs[app.id]
          return (
            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <TypeIcon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{app.applicantName}</p>
                    <p className="text-sm text-gray-500">{typeMeta?.label ?? app.loanType}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 shrink-0">
                  {app.status}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                <p>희망금액 {app.desiredAmount.toLocaleString()}원 · 월소득 {app.monthlyIncome.toLocaleString()}원 · 기존부채 {app.existingDebt.toLocaleString()}원</p>
                <p>{EMPLOYMENT_LABEL[app.employmentType] ?? app.employmentType} · 신용점수 KCB {app.creditScoreKcb ?? '-'} / NICE {app.creditScoreNice ?? '-'}</p>
                {app.collateralAddress && <p>담보 주소지: {app.collateralAddress}</p>}
                <p className="text-xs text-gray-400">첨부 서류: {app.documents.map((doc) => doc.originalFileName).join(', ') || '없음'}</p>
              </div>

              <button
                onClick={() => toggleApplicantDocs(app.id)}
                className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <FileText size={15} />
                채무자 제출서류 확인
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {expanded && (
                <div className="mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-1.5">
                  {!docs && <p className="text-xs text-gray-400">불러오는 중...</p>}
                  {docs && docs.length === 0 && <p className="text-xs text-gray-400">채무자가 업로드한 서류가 없습니다.</p>}
                  {docs && docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm border border-gray-100">
                      <span>{PROFILE_DOCUMENT_LABEL[doc.type] ?? doc.type} <span className="text-gray-400 text-xs">({doc.originalFileName})</span></span>
                      <button onClick={() => viewApplicantDocument(app.id, doc.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium">
                        <Eye size={13} /> 보기
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {decidable && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <input
                    placeholder="승인 금리(%)"
                    value={d.rate}
                    onChange={(e) => updateField(app.id, 'rate', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    placeholder="승인 한도(원)"
                    value={d.limit}
                    onChange={(e) => updateField(app.id, 'limit', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    placeholder="상환기간(개월)"
                    value={d.period}
                    onChange={(e) => updateField(app.id, 'period', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    placeholder="미승인 사유"
                    value={d.reason}
                    onChange={(e) => updateField(app.id, 'reason', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={() => approve(app.id)} className="bg-green-600 hover:bg-green-700 transition text-white rounded-lg py-2 text-sm font-medium">
                    승인
                  </button>
                  <button onClick={() => reject(app.id)} className="bg-red-600 hover:bg-red-700 transition text-white rounded-lg py-2 text-sm font-medium">
                    미승인
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

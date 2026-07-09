import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface LoanApplication {
  id: number
  applicantName: string
  desiredAmount: number
  desiredPeriodMonths: number
  monthlyIncome: number
  employmentType: string
  existingDebt: number
  status: string
  documents: { id: number; type: string; originalFileName: string }[]
}

export default function PartnerDashboardPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [decisionState, setDecisionState] = useState<Record<number, { rate: string; limit: string; period: string; reason: string }>>({})

  function load() {
    api.get('/api/partner/loan-applications').then((res) => setApplications(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  function updateField(id: number, field: string, value: string) {
    setDecisionState((prev) => ({
      ...prev,
      [id]: { rate: '', limit: '', period: '', reason: '', ...prev[id], [field]: value },
    }))
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대출 신청 심사</h1>
      <div className="space-y-4">
        {applications.map((app) => {
          const d = decisionState[app.id] ?? { rate: '', limit: '', period: '', reason: '' }
          return (
            <div key={app.id} className="border rounded p-4">
              <div className="flex justify-between">
                <p className="font-medium">{app.applicantName}</p>
                <span className="text-sm px-2 py-1 rounded bg-gray-100">{app.status}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                희망 {app.desiredAmount.toLocaleString()}원 / {app.desiredPeriodMonths}개월 · 월소득 {app.monthlyIncome.toLocaleString()}원
                · 기존부채 {app.existingDebt.toLocaleString()}원 · {app.employmentType}
              </p>
              <p className="text-xs text-gray-400 mt-1">첨부 서류: {app.documents.map((d) => d.originalFileName).join(', ') || '없음'}</p>

              {app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    placeholder="승인 금리(%)"
                    value={d.rate}
                    onChange={(e) => updateField(app.id, 'rate', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="승인 한도(원)"
                    value={d.limit}
                    onChange={(e) => updateField(app.id, 'limit', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="상환기간(개월)"
                    value={d.period}
                    onChange={(e) => updateField(app.id, 'period', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="미승인 사유"
                    value={d.reason}
                    onChange={(e) => updateField(app.id, 'reason', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <button onClick={() => approve(app.id)} className="bg-green-600 text-white rounded py-1 text-sm">
                    승인
                  </button>
                  <button onClick={() => reject(app.id)} className="bg-red-600 text-white rounded py-1 text-sm">
                    미승인
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

interface LoanApplication {
  id: number
  loanCompanyName: string
  desiredAmount: number
  desiredPeriodMonths: number
  status: string
  approvedRate: number | null
  approvedLimit: number | null
  approvedPeriodMonths: number | null
  rejectionReason: string | null
  documents: { id: number; type: string; originalFileName: string }[]
  createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: '접수됨',
  UNDER_REVIEW: '심사중',
  APPROVED: '승인됨',
  REJECTED: '미승인',
  CONTRACT_COMPLETED: '계약완료',
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([])

  useEffect(() => {
    api.get('/api/loan-applications/mine').then((res) => setApplications(res.data))
  }, [])

  async function downloadContract(id: number) {
    const res = await api.get(`/api/loan-applications/${id}/contract`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">내 신청 내역</h1>
      {applications.length === 0 && <p className="text-gray-500">신청 내역이 없습니다.</p>}
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{app.loanCompanyName}</p>
                <p className="text-sm text-gray-600">
                  희망금액 {app.desiredAmount.toLocaleString()}원 / {app.desiredPeriodMonths}개월
                </p>
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100">
                {STATUS_LABEL[app.status] ?? app.status}
              </span>
            </div>
            {app.status === 'APPROVED' && (
              <div className="mt-2">
                <p className="text-sm text-green-700">
                  승인 조건: 금리 {app.approvedRate}%, 한도 {app.approvedLimit?.toLocaleString()}원, {app.approvedPeriodMonths}개월
                </p>
                <Link to={`/contract/${app.id}`} className="inline-block mt-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded">
                  계약서 작성하기
                </Link>
              </div>
            )}
            {app.status === 'REJECTED' && (
              <p className="text-sm text-red-700 mt-2">미승인 사유: {app.rejectionReason}</p>
            )}
            {app.status === 'CONTRACT_COMPLETED' && (
              <button onClick={() => downloadContract(app.id)}
                className="inline-block mt-2 text-sm bg-gray-700 text-white px-3 py-1.5 rounded">
                계약서 다운로드
              </button>
            )}
            <p className="text-xs text-gray-400 mt-2">첨부 서류 {app.documents.length}건</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Car, CreditCard, FileText, Download } from 'lucide-react'
import { api } from '../api/client'

interface LoanApplication {
  id: number
  loanCompanyName: string
  loanType: string
  collateralAddress: string | null
  desiredAmount: number
  creditScoreKcb: number | null
  creditScoreNice: number | null
  status: string
  approvedRate: number | null
  approvedLimit: number | null
  approvedPeriodMonths: number | null
  rejectionReason: string | null
  documents: { id: number; type: string; originalFileName: string }[]
  createdAt: string
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: '접수됨', className: 'bg-gray-100 text-gray-700' },
  UNDER_REVIEW: { label: '심사중', className: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '승인됨', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: '미승인', className: 'bg-red-100 text-red-700' },
  CONTRACT_COMPLETED: { label: '계약완료', className: 'bg-blue-100 text-blue-700' },
}

const LOAN_TYPE_META: Record<string, { label: string; Icon: typeof Home }> = {
  REAL_ESTATE_COLLATERAL: { label: '부동산 담보대출', Icon: Home },
  CAR_COLLATERAL: { label: '자동차 담보대출', Icon: Car },
  CREDIT: { label: '신용대출', Icon: CreditCard },
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
      {applications.length === 0 && (
        <p className="text-gray-500 bg-white border border-gray-200 rounded-2xl p-6 text-center">신청 내역이 없습니다.</p>
      )}
      <div className="space-y-4">
        {applications.map((app) => {
          const statusStyle = STATUS_STYLE[app.status] ?? { label: app.status, className: 'bg-gray-100 text-gray-700' }
          const typeMeta = LOAN_TYPE_META[app.loanType]
          const TypeIcon = typeMeta?.Icon ?? CreditCard
          return (
            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <TypeIcon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{typeMeta?.label ?? app.loanType}</p>
                    <p className="text-sm text-gray-500">{app.loanCompanyName}</p>
                    <p className="text-sm text-gray-600 mt-1">희망금액 {app.desiredAmount.toLocaleString()}원</p>
                    {app.collateralAddress && (
                      <p className="text-xs text-gray-400 mt-0.5">담보 주소지: {app.collateralAddress}</p>
                    )}
                    {(app.creditScoreKcb || app.creditScoreNice) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        신용점수 KCB {app.creditScoreKcb ?? '-'} · NICE {app.creditScoreNice ?? '-'}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusStyle.className}`}>
                  {statusStyle.label}
                </span>
              </div>

              {app.status === 'APPROVED' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-green-700">
                    승인 조건: 금리 {app.approvedRate}%, 한도 {app.approvedLimit?.toLocaleString()}원, {app.approvedPeriodMonths}개월
                  </p>
                  <Link to={`/contract/${app.id}`}
                    className="inline-block mt-2 text-sm bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl font-medium">
                    계약서 작성하기
                  </Link>
                </div>
              )}
              {app.status === 'REJECTED' && (
                <p className="text-sm text-red-700 mt-3 pt-3 border-t border-gray-100">미승인 사유: {app.rejectionReason}</p>
              )}
              {app.status === 'CONTRACT_COMPLETED' && (
                <button onClick={() => downloadContract(app.id)}
                  className="inline-flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700 hover:text-gray-900 font-medium w-full">
                  <Download size={15} /> 계약서 다운로드
                </button>
              )}
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                <FileText size={13} /> 첨부 서류 {app.documents.length}건
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

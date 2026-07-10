import { useEffect, useState } from 'react'
import { FileText, Download, Home, Car, CreditCard } from 'lucide-react'
import { api } from '../api/client'

interface LoanApplication {
  id: number
  loanCompanyName: string
  loanType: string
  approvedRate: number | null
  approvedLimit: number | null
  approvedPeriodMonths: number | null
  status: string
  createdAt: string
}

const LOAN_TYPE_META: Record<string, { label: string; Icon: typeof Home }> = {
  REAL_ESTATE_COLLATERAL: { label: '부동산 담보대출', Icon: Home },
  CAR_COLLATERAL: { label: '자동차 담보대출', Icon: Car },
  CREDIT: { label: '신용대출', Icon: CreditCard },
}

export default function ContractsListPage() {
  const [contracts, setContracts] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/loan-applications/mine').then((res) => {
      const all: LoanApplication[] = res.data
      setContracts(all.filter((a) => a.status === 'CONTRACT_COMPLETED'))
      setLoading(false)
    })
  }, [])

  async function download(id: number) {
    const res = await api.get(`/api/loan-applications/${id}/contract`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
  }

  if (loading) return <p className="text-gray-500">불러오는 중...</p>

  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="mx-auto text-gray-300 mb-3" size={36} />
        <p className="text-gray-500">아직 작성된 전자계약서가 없습니다.</p>
        <p className="text-sm text-gray-400 mt-1">대출 신청이 승인되면 신청현황 화면에서 전자계약서를 작성할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {contracts.map((c) => {
        const typeMeta = LOAN_TYPE_META[c.loanType]
        const TypeIcon = typeMeta?.Icon ?? CreditCard
        return (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <TypeIcon size={20} />
              </span>
              <div>
                <p className="font-semibold text-gray-900">{c.loanCompanyName}</p>
                <p className="text-sm text-gray-500">{typeMeta?.label ?? c.loanType}</p>
                <p className="text-sm text-gray-600 mt-1">
                  한도 {c.approvedLimit?.toLocaleString()}원 · 연 {c.approvedRate}% · {c.approvedPeriodMonths}개월
                </p>
              </div>
            </div>
            <button onClick={() => download(c.id)}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 transition text-white rounded-xl px-4 py-2 text-sm font-medium shrink-0">
              <Download size={15} /> 다운로드
            </button>
          </div>
        )
      })}
    </div>
  )
}

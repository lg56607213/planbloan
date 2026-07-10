import { useEffect, useState } from 'react'
import { Users, FileSignature, TrendingUp, TrendingDown, AlertTriangle, Clock, Wallet } from 'lucide-react'
import { api } from '../api/client'

interface Overview {
  totalCustomers: number
  totalContracts: number
  activeContracts: number
  overdueContracts: number
  totalFinancedAmount: number
  monthIncome: number
  monthExpense: number
  pendingApplications: number
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-3">
      <span className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${accent}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function PartnerOverviewPage() {
  const [data, setData] = useState<Overview | null>(null)

  useEffect(() => {
    api.get('/api/partner/erp/overview').then((res) => setData(res.data))
  }, [])

  if (!data) return <p className="text-gray-500">불러오는 중...</p>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="총 고객 수" value={`${data.totalCustomers}명`} accent="bg-blue-50 text-blue-600" />
        <StatCard icon={FileSignature} label="총 계약 건수" value={`${data.totalContracts}건`} accent="bg-purple-50 text-purple-600" />
        <StatCard icon={Clock} label="심사 대기중" value={`${data.pendingApplications}건`} accent="bg-amber-50 text-amber-600" />
        <StatCard icon={AlertTriangle} label="연체 계약" value={`${data.overdueContracts}건`} accent="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Wallet} label="총 대출 취급액" value={`${data.totalFinancedAmount.toLocaleString()}원`} accent="bg-gray-100 text-gray-700" />
        <StatCard icon={TrendingUp} label="이번달 수입" value={`${data.monthIncome.toLocaleString()}원`} accent="bg-green-50 text-green-600" />
        <StatCard icon={TrendingDown} label="이번달 지출" value={`${data.monthExpense.toLocaleString()}원`} accent="bg-red-50 text-red-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-2">진행중 계약</h2>
        <p className="text-sm text-gray-600">현재 {data.activeContracts}건의 계약이 진행중입니다.</p>
      </div>
    </div>
  )
}

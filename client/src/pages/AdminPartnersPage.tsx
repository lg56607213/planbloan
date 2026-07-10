import { FormEvent, useEffect, useState } from 'react'
import { UserPlus, CheckCircle2, XCircle, Building2, KeyRound } from 'lucide-react'
import { api } from '../api/client'

interface PartnerAccount {
  companyId: number
  companyName: string
  username: string
  password: string | null
  verificationStatus: string
  businessRegistrationNumber: string | null
  registrationNumber: string | null
  corporateRegistrationNumber: string | null
  representativeName: string | null
  address: string | null
  phone: string | null
  rejectionReason: string | null
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  PENDING_INFO: { label: '정보입력 대기', className: 'bg-gray-100 text-gray-600' },
  PENDING_APPROVAL: { label: '승인 요청중', className: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '승인됨', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: '반려됨', className: 'bg-red-100 text-red-700' },
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerAccount[]>([])
  const [form, setForm] = useState({ username: '', password: '', companyName: '' })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({})
  const [resetTarget, setResetTarget] = useState<number | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)

  function load() {
    api.get('/api/admin/partners').then((res) => setPartners(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    try {
      await api.post('/api/admin/partners', form)
      setMessage(`계정이 생성되었습니다. 아이디: ${form.username} / 비밀번호: ${form.password}`)
      setForm({ username: '', password: '', companyName: '' })
      load()
    } catch (err: any) {
      setError(err.response?.data?.message ?? '계정 생성에 실패했습니다.')
    }
  }

  async function approve(companyId: number) {
    await api.patch(`/api/admin/partners/${companyId}/approve`)
    load()
  }

  async function reject(companyId: number) {
    const reason = rejectReason[companyId] || '서류 미비'
    await api.patch(`/api/admin/partners/${companyId}/reject`, { reason })
    load()
  }

  function openResetForm(companyId: number) {
    setResetTarget(companyId)
    setResetPassword('')
    setResetError(null)
  }

  async function submitReset(companyId: number) {
    setResetError(null)
    if (resetPassword.trim().length < 4) {
      setResetError('비밀번호는 4자 이상 입력해 주세요.')
      return
    }
    try {
      await api.patch(`/api/admin/partners/${companyId}/reset-password`, { newPassword: resetPassword })
      setResetTarget(null)
      load()
    } catch (err: any) {
      setResetError(err.response?.data?.message ?? '비밀번호 재설정에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">대부업체에 발급할 아이디/비밀번호를 생성하고, 등록 승인을 처리합니다.</p>

      <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><UserPlus size={18} className="text-blue-600" /> 신규 제휴사 계정 발급</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            placeholder="아이디 (예: Planblaon)"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-base"
          />
          <input
            placeholder="비밀번호"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-base"
          />
          <input
            placeholder="업체명"
            required
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-base"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</p>}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2.5 font-medium">
          계정 발급
        </button>
      </form>

      <div className="space-y-3">
        {partners.map((p) => {
          const style = STATUS_STYLE[p.verificationStatus] ?? { label: p.verificationStatus, className: 'bg-gray-100 text-gray-600' }
          return (
            <div key={p.companyId} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Building2 size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{p.companyName}</p>
                    <p className="text-sm text-gray-500">
                      아이디: {p.username} · 비밀번호: {p.password ?? <span className="text-gray-400">(재설정 필요)</span>}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${style.className}`}>{style.label}</span>
              </div>

              {p.verificationStatus === 'PENDING_APPROVAL' && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                  <p>사업자등록번호: {p.businessRegistrationNumber}</p>
                  <p>대부업등록번호: {p.registrationNumber}</p>
                  <p>법인등록번호: {p.corporateRegistrationNumber}</p>
                  <p>대표자: {p.representativeName}</p>
                  <p>주소: {p.address}</p>
                  <p>연락처: {p.phone}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      placeholder="반려 사유 (반려 시)"
                      value={rejectReason[p.companyId] ?? ''}
                      onChange={(e) => setRejectReason({ ...rejectReason, [p.companyId]: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <button onClick={() => approve(p.companyId)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 transition text-white rounded-lg px-3 py-1.5 text-sm font-medium">
                      <CheckCircle2 size={14} /> 승인
                    </button>
                    <button onClick={() => reject(p.companyId)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 transition text-white rounded-lg px-3 py-1.5 text-sm font-medium">
                      <XCircle size={14} /> 반려
                    </button>
                  </div>
                </div>
              )}
              {p.verificationStatus === 'REJECTED' && p.rejectionReason && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-red-700">반려 사유: {p.rejectionReason}</p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                {resetTarget === p.companyId ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      placeholder="새 비밀번호"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <button onClick={() => submitReset(p.companyId)}
                      className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg px-3 py-1.5 text-sm font-medium">
                      확인
                    </button>
                    <button onClick={() => setResetTarget(null)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600">
                      취소
                    </button>
                  </div>
                ) : (
                  <button onClick={() => openResetForm(p.companyId)}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <KeyRound size={14} /> 비밀번호 재설정
                  </button>
                )}
                {resetTarget === p.companyId && resetError && (
                  <p className="text-red-600 text-xs mt-1.5">{resetError}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

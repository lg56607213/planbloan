import { FormEvent, useEffect, useState } from 'react'
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react'
import { api } from '../api/client'

interface CompanyInfo {
  companyId: number
  companyName: string
  username: string
  verificationStatus: string
  businessRegistrationNumber: string | null
  registrationNumber: string | null
  corporateRegistrationNumber: string | null
  representativeName: string | null
  address: string | null
  phone: string | null
  rejectionReason: string | null
}

const STATUS_BANNER: Record<string, { label: string; className: string; Icon: typeof ShieldCheck }> = {
  PENDING_INFO: { label: '업체 정보를 입력하고 승인을 요청해 주세요.', className: 'bg-gray-50 border-gray-200 text-gray-700', Icon: ShieldAlert },
  PENDING_APPROVAL: { label: '본사 승인 대기중입니다. 승인 전까지 대출 신청 정보는 열람할 수 없습니다.', className: 'bg-amber-50 border-amber-200 text-amber-700', Icon: Clock },
  APPROVED: { label: '승인이 완료되어 대출 신청을 접수할 수 있습니다.', className: 'bg-green-50 border-green-200 text-green-700', Icon: ShieldCheck },
  REJECTED: { label: '승인이 반려되었습니다. 정보를 수정 후 다시 요청해 주세요.', className: 'bg-red-50 border-red-200 text-red-700', Icon: ShieldAlert },
}

export default function PartnerCompanyPage() {
  const [info, setInfo] = useState<CompanyInfo | null>(null)
  const [form, setForm] = useState({
    companyName: '', businessRegistrationNumber: '', registrationNumber: '',
    corporateRegistrationNumber: '', representativeName: '', address: '', phone: '',
    bankName: '', bankAccountNumber: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function load() {
    api.get('/api/partner/company').then((res) => {
      const data: CompanyInfo = res.data
      setInfo(data)
      setForm((f) => ({
        ...f,
        companyName: data.companyName ?? '',
        businessRegistrationNumber: data.businessRegistrationNumber ?? '',
        registrationNumber: data.registrationNumber ?? '',
        corporateRegistrationNumber: data.corporateRegistrationNumber ?? '',
        representativeName: data.representativeName ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
      }))
    })
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    try {
      await api.put('/api/partner/company', form)
      setSaved(true)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message ?? '저장에 실패했습니다.')
    }
  }

  if (!info) return <p className="text-gray-500">불러오는 중...</p>

  const banner = STATUS_BANNER[info.verificationStatus]
  const editable = info.verificationStatus !== 'APPROVED'

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">업체 정보 등록</h1>
        <p className="text-sm text-gray-500 mt-1">아래 정보를 입력하고 승인을 요청하면 본사 검토 후 채무자 정보 열람이 가능합니다.</p>
      </div>

      {banner && (
        <div className={`flex items-start gap-2.5 border rounded-2xl p-4 ${banner.className}`}>
          <banner.Icon size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{banner.label}</p>
        </div>
      )}
      {info.verificationStatus === 'REJECTED' && info.rejectionReason && (
        <p className="text-sm text-red-700">반려 사유: {info.rejectionReason}</p>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            업체명
            <input required disabled={!editable} value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm">
            대표자
            <input required disabled={!editable} value={form.representativeName}
              onChange={(e) => setForm({ ...form, representativeName: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm">
            사업자등록번호
            <input required disabled={!editable} value={form.businessRegistrationNumber}
              onChange={(e) => setForm({ ...form, businessRegistrationNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm">
            대부업등록번호
            <input required disabled={!editable} value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm">
            법인등록번호
            <input required disabled={!editable} value={form.corporateRegistrationNumber}
              onChange={(e) => setForm({ ...form, corporateRegistrationNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm">
            연락처
            <input required disabled={!editable} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm sm:col-span-2">
            주소
            <input required disabled={!editable} value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm">
            은행명 (계약서용)
            <input disabled={!editable} value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
          <label className="text-sm">
            계좌번호 (계약서용)
            <input disabled={!editable} value={form.bankAccountNumber}
              onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1 disabled:bg-gray-50" />
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">저장되었습니다. 승인 대기 상태로 전환되었습니다.</p>}

        {editable && (
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl py-3 font-semibold">
            정보 저장 및 승인 요청
          </button>
        )}
      </form>
    </div>
  )
}

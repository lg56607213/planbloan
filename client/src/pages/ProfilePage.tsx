import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { UserCog, FileText, Upload, Eye, Trash2 } from 'lucide-react'
import { api } from '../api/client'

const DOCUMENT_TYPES = [
  { value: 'RESIDENT_REGISTRATION', label: '등본' },
  { value: 'NATIONAL_PENSION_CERTIFICATE', label: '자격득실확인서' },
  { value: 'HEALTH_INSURANCE_PAYMENT', label: '건강보험 납부내역서' },
  { value: 'BANK_STATEMENT', label: '통장사본' },
]

interface UserDocument {
  id: number
  type: string
  originalFileName: string
  uploadedAt: string
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', birthDate: '', gender: '', address: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [docError, setDocError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/me/profile').then((res) => {
      const d = res.data
      setForm({
        name: d.name ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        birthDate: d.birthDate ?? '',
        gender: d.gender ?? '',
        address: d.address ?? '',
      })
      setLoading(false)
    })
    loadDocuments()
  }, [])

  function loadDocuments() {
    api.get('/api/me/profile/documents').then((res) => setDocuments(res.data))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    try {
      await api.put('/api/me/profile', {
        name: form.name,
        phone: form.phone,
        birthDate: form.birthDate || null,
        gender: form.gender || null,
        address: form.address || null,
      })
      setSaved(true)
    } catch (err: any) {
      setError(err.response?.data?.message ?? '저장에 실패했습니다.')
    }
  }

  async function handleUpload(type: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDocError(null)
    setUploadingType(type)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/api/me/profile/documents?type=${type}`, formData)
      loadDocuments()
    } catch (err: any) {
      setDocError(err.response?.data?.message ?? '업로드에 실패했습니다.')
    } finally {
      setUploadingType(null)
      e.target.value = ''
    }
  }

  async function handleView(id: number) {
    const res = await api.get(`/api/me/profile/documents/${id}`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
  }

  async function handleDelete(id: number) {
    await api.delete(`/api/me/profile/documents/${id}`)
    loadDocuments()
  }

  if (loading) return <p className="text-gray-500">불러오는 중...</p>

  return (
    <div className="max-w-lg space-y-5">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserCog size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">개인정보</h2>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          아래 정보는 전자계약서 작성 시 채무자란에 자동으로 반영됩니다.
        </p>

        <label className="text-sm block">
          이메일 (로그인 아이디)
          <input disabled value={form.email} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 mt-1" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            이름
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
          <label className="text-sm">
            연락처
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
          <label className="text-sm">
            생년월일
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
          <label className="text-sm">
            성별
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1">
              <option value="">선택 안 함</option>
              <option value="MALE">남</option>
              <option value="FEMALE">여</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            주소
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mt-1" />
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">저장되었습니다.</p>}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl py-3 font-semibold">
          저장
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">제출 서류</h2>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          업로드한 서류는 대출을 진행하려는 대부업체가 확인할 수 있습니다.
        </p>

        {docError && <p className="text-red-600 text-sm">{docError}</p>}

        <div className="space-y-3">
          {DOCUMENT_TYPES.map(({ value, label }) => {
            const uploaded = documents.filter((d) => d.type === value)
            return (
              <div key={value} className="border border-gray-200 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <label className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                    <Upload size={13} />
                    {uploadingType === value ? '업로드 중...' : '파일 선택'}
                    <input type="file" className="hidden" accept="image/*,.pdf"
                      onChange={(e) => handleUpload(value, e)} disabled={uploadingType === value} />
                  </label>
                </div>
                {uploaded.length === 0 ? (
                  <p className="text-xs text-gray-400 mt-2">업로드된 파일이 없습니다.</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {uploaded.map((d) => (
                      <li key={d.id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <span className="truncate">{d.originalFileName}</span>
                        <span className="flex items-center gap-2 shrink-0 ml-2">
                          <button type="button" onClick={() => handleView(d.id)} className="text-blue-600 hover:text-blue-700">
                            <Eye size={14} />
                          </button>
                          <button type="button" onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

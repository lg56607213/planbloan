import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Landmark, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-gray-50 to-gray-50">
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3 gap-2">
          <Link to="/" className="flex items-center gap-1.5 font-bold text-base sm:text-lg text-blue-700 shrink-0">
            <Landmark size={20} className="text-blue-600" />
            <span>PlanB 대출중개</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap justify-end">
            {!user && <Link to="/login" className="px-2 py-1 text-gray-600 hover:text-gray-900">로그인</Link>}
            {!user && (
              <Link to="/register" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                회원가입
              </Link>
            )}
            {user?.role === 'CUSTOMER' && <Link to="/apply" className="px-2 py-1 text-gray-600 hover:text-gray-900">대출 신청</Link>}
            {user?.role === 'CUSTOMER' && <Link to="/my-applications" className="px-2 py-1 text-gray-600 hover:text-gray-900">내 신청 내역</Link>}
            {user?.role === 'PARTNER_ADMIN' && <Link to="/partner/company" className="px-2 py-1 text-gray-600 hover:text-gray-900">업체 정보</Link>}
            {user?.role === 'PARTNER_ADMIN' && <Link to="/partner/criteria" className="px-2 py-1 text-gray-600 hover:text-gray-900">대출조건</Link>}
            {(user?.role === 'PARTNER_ADMIN' || user?.role === 'HQ_ADMIN') && (
              <Link to="/partner" className="px-2 py-1 text-gray-600 hover:text-gray-900">심사 관리</Link>
            )}
            {user?.role === 'HQ_ADMIN' && <Link to="/admin/partners" className="px-2 py-1 text-gray-600 hover:text-gray-900">제휴사 관리</Link>}
            {user && (
              <button onClick={handleLogout} className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-800">
                <LogOut size={14} />
                <span className="hidden sm:inline">{user.name}</span>
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}

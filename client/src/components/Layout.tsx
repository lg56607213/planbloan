import { Link, Outlet, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="font-bold text-lg text-blue-600">PlanB 대출중개</Link>
          <nav className="flex items-center gap-4 text-sm">
            {!user && <Link to="/login">로그인</Link>}
            {!user && <Link to="/register">회원가입</Link>}
            {user?.role === 'CUSTOMER' && <Link to="/apply">대출 신청</Link>}
            {user?.role === 'CUSTOMER' && <Link to="/my-applications">내 신청 내역</Link>}
            {(user?.role === 'PARTNER_ADMIN' || user?.role === 'HQ_ADMIN') && (
              <Link to="/partner">심사 관리</Link>
            )}
            {user && (
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-800">
                로그아웃 ({user.name})
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

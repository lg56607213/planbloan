import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Landmark, LogOut, Menu, X, Banknote, ClipboardList, FileText, UserCog,
  Building2, ShieldCheck, ListChecks, Users, FileSignature, Wallet, Calculator, LayoutDashboard,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface MenuItem {
  label: string
  to: string
  Icon: typeof Banknote
}

const MENUS: Record<string, MenuItem[]> = {
  CUSTOMER: [
    { label: '대출신청', to: '/apply', Icon: Banknote },
    { label: '신청현황', to: '/my-applications', Icon: ClipboardList },
    { label: '계약서목록', to: '/contracts', Icon: FileText },
    { label: '내정보관리', to: '/profile', Icon: UserCog },
  ],
  PARTNER_ADMIN: [
    { label: '업체 정보', to: '/partner/company', Icon: Building2 },
    { label: '대출조건', to: '/partner/criteria', Icon: ShieldCheck },
    { label: '심사 관리', to: '/partner', Icon: ListChecks },
    { label: '고객관리', to: '/partner/customers', Icon: Users },
    { label: '계약관리', to: '/partner/contracts', Icon: FileSignature },
    { label: '수납관리', to: '/partner/payments', Icon: Wallet },
    { label: '회계관리', to: '/partner/accounting', Icon: Calculator },
    { label: '총괄관리', to: '/partner/overview', Icon: LayoutDashboard },
  ],
  HQ_ADMIN: [
    { label: '제휴사 관리', to: '/admin/partners', Icon: Building2 },
  ],
}

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const menus = (user && MENUS[user.role]) || []
  const current = [...menus]
    .sort((a, b) => b.to.length - a.to.length)
    .find((m) => location.pathname === m.to || location.pathname.startsWith(m.to + '/'))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-60 bg-[#23304e] text-white z-40 flex flex-col transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-14 flex items-center justify-between px-4 bg-[#1b253a] shrink-0">
          <Link to="/" className="flex items-center gap-1.5 font-bold text-white">
            <Landmark size={19} className="text-sky-400" />
            <span>PlanB <span className="text-sky-400">대출중개</span></span>
          </Link>
          <button className="md:hidden text-slate-300" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul>
            {menus.map(({ label, to, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-5 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-white text-[#1b253a] font-semibold border-l-4 border-sky-400'
                        : 'text-slate-200 border-l-4 border-transparent hover:bg-sky-400 hover:text-white'
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-600/50 shrink-0">
          <p className="px-2 pb-2 text-xs text-slate-400 truncate">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-lg border border-slate-500/60 px-3 py-2 text-xs text-slate-300 hover:bg-red-600 hover:border-red-600 hover:text-white transition"
          >
            <LogOut size={14} /> 로그아웃
          </button>
        </div>
      </aside>

      <div className="md:ml-60">
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-20 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600">
            <Menu size={22} />
          </button>
          <span className="ml-3 font-semibold text-gray-800">{current?.label ?? 'PlanB 대출중개'}</span>
        </div>

        <div className="px-4 sm:px-8 pt-6 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{current?.label ?? '대시보드'}</h1>
          <p className="text-sm text-gray-400 mt-1">홈 {current ? `> ${current.label}` : ''}</p>
        </div>

        <main className="px-4 sm:px-8 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

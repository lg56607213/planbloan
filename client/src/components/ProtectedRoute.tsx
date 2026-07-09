import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props {
  allowedRoles?: Array<'CUSTOMER' | 'PARTNER_ADMIN' | 'HQ_ADMIN'>
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

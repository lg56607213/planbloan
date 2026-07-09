import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold mb-4">PlanB 대부중개 플랫폼</h1>
      <p className="text-gray-600 mb-8">
        정보를 입력하고 서류를 업로드하면, 제휴 대부업체가 검토 후 대출 조건을 안내해 드립니다.
      </p>
      {!user && (
        <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
          지금 시작하기
        </Link>
      )}
      {user?.role === 'CUSTOMER' && (
        <Link to="/apply" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
          대출 신청하기
        </Link>
      )}
    </div>
  )
}

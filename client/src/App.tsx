import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ApplyLoanPage from './pages/ApplyLoanPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import PartnerDashboardPage from './pages/PartnerDashboardPage'
import ContractSigningPage from './pages/ContractSigningPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/apply" element={<ApplyLoanPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/contract/:id" element={<ContractSigningPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['PARTNER_ADMIN', 'HQ_ADMIN']} />}>
          <Route path="/partner" element={<PartnerDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

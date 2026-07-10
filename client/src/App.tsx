import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ApplyLoanPage from './pages/ApplyLoanPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import ContractsListPage from './pages/ContractsListPage'
import ProfilePage from './pages/ProfilePage'
import PartnerDashboardPage from './pages/PartnerDashboardPage'
import PartnerCompanyPage from './pages/PartnerCompanyPage'
import PartnerCriteriaPage from './pages/PartnerCriteriaPage'
import PartnerCustomersPage from './pages/PartnerCustomersPage'
import PartnerContractsPage from './pages/PartnerContractsPage'
import PartnerPaymentsPage from './pages/PartnerPaymentsPage'
import PartnerAccountingPage from './pages/PartnerAccountingPage'
import PartnerOverviewPage from './pages/PartnerOverviewPage'
import AdminPartnersPage from './pages/AdminPartnersPage'
import ContractSigningPage from './pages/ContractSigningPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/apply" element={<ApplyLoanPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/contracts" element={<ContractsListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contract/:id" element={<ContractSigningPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['PARTNER_ADMIN', 'HQ_ADMIN']} />}>
          <Route path="/partner" element={<PartnerDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['PARTNER_ADMIN']} />}>
          <Route path="/partner/company" element={<PartnerCompanyPage />} />
          <Route path="/partner/criteria" element={<PartnerCriteriaPage />} />
          <Route path="/partner/customers" element={<PartnerCustomersPage />} />
          <Route path="/partner/contracts" element={<PartnerContractsPage />} />
          <Route path="/partner/payments" element={<PartnerPaymentsPage />} />
          <Route path="/partner/accounting" element={<PartnerAccountingPage />} />
          <Route path="/partner/overview" element={<PartnerOverviewPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['HQ_ADMIN']} />}>
          <Route path="/admin/partners" element={<AdminPartnersPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

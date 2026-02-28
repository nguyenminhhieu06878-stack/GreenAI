import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import EnergyConsumption from './pages/EnergyConsumption'
import MeterReading from './pages/MeterReading'
import Tips from './pages/Tips'
import Pricing from './pages/Pricing'
import Settings from './pages/Settings'
import Invoice from './pages/Invoice'
import Achievements from './pages/Achievements'
import RoomManagement from './pages/RoomManagement'
import RoomDetails from './pages/RoomDetails'
import Support from './pages/Support'
import CheckIn from './pages/CheckIn'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminRooms from './pages/admin/Rooms'
import AdminTenants from './pages/admin/Tenants'
import AdminSubscriptions from './pages/admin/Subscriptions'
import AdminRevenue from './pages/admin/Revenue'
import AdminSupport from './pages/admin/Support'
import AdminVouchers from './pages/admin/Vouchers'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/trang-chu" />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (isAuthenticated) {
    // Redirect admin to admin dashboard, others to trang-chu
    if (user?.role === 'admin') {
      return <Navigate to="/admin" />
    }
    return <Navigate to="/trang-chu" />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="trang-chu" element={<Dashboard />} />
          <Route path="bieu-do-tieu-thu" element={<EnergyConsumption />} />
          <Route path="nhap-chi-so" element={<MeterReading />} />
          <Route path="hoa-don" element={<Invoice />} />
          <Route path="meo-tiet-kiem" element={<Tips />} />
          <Route path="bang-gia" element={<Pricing />} />
          <Route path="cai-dat" element={<Settings />} />
          <Route path="thanh-tich" element={<Achievements />} />
          <Route path="diem-danh" element={<CheckIn />} />
          <Route path="quan-ly-phong" element={<RoomManagement />} />
          <Route path="phong/:id" element={<RoomDetails />} />
          <Route path="ho-tro" element={<Support />} />
          <Route path="thanh-toan/thanh-cong" element={<PaymentSuccess />} />
          <Route path="thanh-toan/that-bai" element={<PaymentFailure />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="tenants" element={<AdminTenants />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="vouchers" element={<AdminVouchers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

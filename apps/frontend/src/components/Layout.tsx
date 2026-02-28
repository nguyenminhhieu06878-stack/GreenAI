import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AIChatbot from './AIChatbot'
import { useAuthStore } from '@/stores/authStore'

export default function Layout() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
      {/* Show AI Chatbot only for logged in users */}
      {user && <AIChatbot />}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8 lg:gap-10">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start mb-3">
              <img 
                src="/logo.png" 
                alt="GreenEnergy AI" 
                className="h-16 sm:h-20 lg:h-24 w-auto object-contain -ml-2 sm:-ml-6 lg:-ml-10 -mt-2 sm:-mt-4 lg:-mt-8" 
              />
            </div>
            <p className="text-xs sm:text-sm mb-4 px-2 sm:px-0 sm:-ml-4 lg:-ml-8 leading-relaxed">
              Giải pháp quản lý điện năng thông minh cho mọi người
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start sm:-ml-4 lg:-ml-8">
              <a href="#" className="hover:text-emerald-400 transition-colors p-1">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors p-1">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors p-1">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors p-1">
                <Youtube size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors inline-block py-0.5">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-emerald-400 transition-colors inline-block py-0.5">Blog</Link></li>
              <li><Link to="/careers" className="hover:text-emerald-400 transition-colors inline-block py-0.5">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors inline-block py-0.5">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/help" className="hover:text-emerald-400 transition-colors inline-block py-0.5">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-400 transition-colors inline-block py-0.5">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors inline-block py-0.5">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors inline-block py-0.5">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Stay Up to Date</h3>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed px-2 sm:px-0">
              Đăng ký nhận tin tức và cập nhật mới nhất
            </p>
            <div className="flex flex-col gap-2 px-2 sm:px-0">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full px-3 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Đăng ký</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-6 sm:pt-8 text-xs sm:text-sm text-center">
          <p className="text-gray-400">&copy; 2024 GreenEnergy AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

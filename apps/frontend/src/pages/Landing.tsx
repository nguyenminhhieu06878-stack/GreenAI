import { Link } from 'react-router-dom'
import { Shield, BarChart3, Users, Building2, ArrowRight, Menu, X, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Calculate scroll progress
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(scrollPercentage)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: "Trang Chủ", href: "#home" },
    { label: "Dịch Vụ", href: "#services" },
    { label: "Tính Năng", href: "#features" },
    { label: "Đánh Giá", href: "#testimonials" },
    { label: "Blog", href: "#blog" },
    { label: "Liên Hệ", href: "#contact" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-1' : 'py-2'}`}>
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
        
        <div className={`container mx-auto px-3 sm:px-4 transition-all duration-500 ${isScrolled ? 'max-w-6xl' : 'max-w-7xl'}`}>
          <div className={`relative flex items-center justify-between px-3 sm:px-4 md:px-6 transition-all duration-500
            ${isScrolled 
              ? 'h-14 sm:h-16 rounded-full border border-white/20 bg-primary-600/90 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]' 
              : 'h-16 sm:h-20 bg-transparent'
            }`}>
            
            {/* Scroll Progress Bar - only show when scrolled */}
            {isScrolled && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-400 via-green-300 to-green-400 origin-left z-50 rounded-full"
                style={{ width: `${scrollProgress}%` }}
              />
            )}

            {/* Logo */}
            <Link 
              to="/" 
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex items-center space-x-2 cursor-pointer group z-10"
            >
              <img 
                src="/logo.png" 
                alt="GreenEnergy AI" 
                className={`transition-all duration-500 group-hover:scale-110 ${
                  isScrolled 
                    ? 'h-16 sm:h-20 md:h-24 lg:h-28 -ml-2 sm:-ml-3 md:-ml-4 mt-1 sm:mt-2' 
                    : 'h-24 sm:h-32 md:h-40 lg:h-48 -ml-3 sm:-ml-4 md:-ml-6 mt-2 sm:mt-4'
                }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 z-10">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    const id = item.href.replace('#', '')
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-xs lg:text-sm font-semibold text-white transition-all hover:text-green-200 hover:scale-105 whitespace-nowrap"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 z-10">
              <div className="hidden md:flex items-center gap-2 sm:gap-3 lg:gap-4">
                <Link
                  to="/login"
                  className={`text-white hover:text-green-200 hover:bg-white/10 transition-all rounded-lg inline-flex items-center justify-center font-semibold ${isScrolled ? 'h-8 sm:h-9 px-3 sm:px-4 text-xs' : 'h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm'}`}
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className={`bg-white text-primary-600 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold rounded-lg inline-flex items-center justify-center ${isScrolled ? 'h-8 sm:h-9 px-3 sm:px-4 text-xs' : 'h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm'}`}
                >
                  Đăng Ký
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-2 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-primary-600/95 backdrop-blur-xl shadow-2xl relative z-50">
              <div className="p-4 sm:p-6 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      const id = item.href.replace('#', '')
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                      setIsMenuOpen(false)
                    }}
                    className="block text-sm sm:text-base font-medium text-white/90 transition-all hover:text-green-200 hover:pl-2 py-2.5 sm:py-3 border-b border-white/10 last:border-0"
                  >
                    {item.label}
                  </a>
                ))}
                
                <div className="flex flex-col gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                  <Link 
                    to="/login" 
                    className="w-full text-white border border-white/20 hover:bg-white/10 rounded-lg sm:rounded-xl h-11 sm:h-12 flex items-center justify-center font-semibold text-sm sm:text-base" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng Nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="w-full bg-white text-primary-600 hover:bg-green-50 font-bold rounded-lg sm:rounded-xl h-11 sm:h-12 flex items-center justify-center shadow-lg text-sm sm:text-base" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng Ký
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div id="home" className="bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {/* Circular waves */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] border border-white rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] border border-white/50 rounded-full"></div>
          
          {/* Energy flow lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="white" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <path d="M 0 200 Q 400 100 800 300" stroke="url(#line-gradient)" strokeWidth="2" fill="none"/>
            <path d="M 200 0 Q 500 200 900 100" stroke="url(#line-gradient)" strokeWidth="2" fill="none"/>
            <path d="M 0 400 Q 300 300 600 500" stroke="url(#line-gradient)" strokeWidth="1.5" fill="none"/>
          </svg>
          
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-7xl relative z-10 pt-24 sm:pt-28 md:pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Quản Lý Điện Năng Thông Minh
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-green-100">
                Kiểm soát lượng điện tiêu thụ của bạn để dùng và tiết kiệm hiệu quả với GreenEnergy AI
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-4 sm:mb-6">
                <Link to="/register" className="px-6 sm:px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg text-sm sm:text-base">
                  Bắt Đầu Ngay
                </Link>
                <Link to="/login" className="px-6 sm:px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors text-sm sm:text-base">
                  Đăng Nhập
                </Link>
              </div>
              
              {/* Free Trial Banner with fade animation */}
              <div className="flex justify-center lg:justify-start">
                <p className="text-white text-xs sm:text-sm font-bold animate-[fadeInOut_3s_ease-in-out_infinite]">
                  Người Thuê nhận FREE 2 tháng Gói Cơ Bản khi đăng ký lần đầu!
                </p>
              </div>
            </div>
            <div className="hidden lg:block relative z-10">
              <img 
                src="/banner.png" 
                alt="GreenEnergy AI Banner" 
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manage Community Section */}
      <div id="services" className="container mx-auto px-4 py-8 sm:py-10 md:py-12 max-w-7xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Quản lý toàn bộ cộng đồng của bạn<br className="hidden sm:block" />trong một hệ thống duy nhất
          </h2>
          <p className="text-sm sm:text-base text-gray-600">GreenEnergy AI phù hợp với ai?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-green-600" size={28} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3">Người Thuê Trọ</h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Theo dõi tiêu thụ điện cá nhân, nhận cảnh báo khi vượt ngưỡng và được AI tư vấn tiết kiệm điện hiệu quả
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-green-600" size={28} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3">Chủ Nhà Trọ</h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Quản lý nhiều phòng trọ, tự động tính toán hóa đơn điện và theo dõi thanh toán của người thuê một cách dễ dàng
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <div className="bg-green-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600" size={28} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3">Doanh Nghiệp<br />& Tổ Chức</h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Giám sát tiêu thụ điện toàn bộ tòa nhà, phân tích chi phí và tối ưu hóa hiệu suất năng lượng
            </p>
          </div>
        </div>
      </div>

      {/* Illustration Section 1 */}
      <div id="features" className="bg-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="/image6.png" 
                alt="OCR Technology" 
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Công nghệ OCR thông minh nhận diện đồng hồ điện tự động
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Chỉ cần chụp ảnh đồng hồ điện, hệ thống AI của chúng tôi sẽ tự động nhận diện số điện và ghi nhận vào hệ thống. Tiết kiệm thời gian, chính xác tuyệt đối và không cần nhập liệu thủ công.
              </p>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
              >
                Tìm Hiểu Thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Illustration Section 2 */}
      <div className="bg-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="/image5.png" 
                alt="AI Chatbot" 
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                AI Chatbot tư vấn tiết kiệm điện 24/7
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Trợ lý AI thông minh của chúng tôi luôn sẵn sàng tư vấn cách tiết kiệm điện, phân tích xu hướng tiêu thụ và đưa ra các gợi ý tối ưu dựa trên thói quen sử dụng của bạn.
              </p>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
              >
                Tìm Hiểu Thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Achievement Section */}
      <div className="bg-gradient-to-br from-primary-50 to-green-50 py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Giúp hàng nghìn người dùng <span className="text-primary-600">tiết kiệm điện mỗi ngày</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-4">
              Tham gia cộng đồng GreenEnergy AI để quản lý điện năng thông minh và tiết kiệm chi phí hiệu quả
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 px-4">
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform text-sm sm:text-base"
            >
              Bắt Đầu Ngay - Miễn Phí <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </Link>
            
            {/* Free Trial Text */}
            <p className="text-primary-600 text-xs sm:text-sm font-bold animate-[fadeInOut_3s_ease-in-out_infinite]">
              Người Thuê nhận FREE 2 tháng Gói Cơ Bản khi đăng ký lần đầu!
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div id="testimonials" className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center">
            <div className="flex justify-center lg:justify-start">
              <img 
                src="/image7.png" 
                alt="Testimonial" 
                className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl shadow-xl object-cover"
              />
            </div>
            <div className="lg:col-span-2 text-center lg:text-left">
              <p className="text-gray-600 mb-4 sm:mb-6 italic text-sm sm:text-base lg:text-lg leading-relaxed">
                "GreenEnergy AI đã giúp tôi tiết kiệm được 30% chi phí điện hàng tháng. Giao diện dễ sử dụng, tính năng OCR nhận diện đồng hồ rất chính xác và AI chatbot tư vấn rất hữu ích. Tôi rất hài lòng với dịch vụ này!"
              </p>
              <div className="text-primary-600 font-semibold mb-1 text-base sm:text-lg">Nguyễn Văn An</div>
              <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Chủ nhà trọ tại Hà Nội</div>
              
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4 sm:mb-6 justify-center lg:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>

              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-primary-600 text-xs sm:text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all mx-auto lg:mx-0"
              >
                Xem thêm đánh giá <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div id="blog" className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-7xl">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Chia sẻ kiến thức tiết kiệm điện
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Blog GreenEnergy AI là nơi tốt nhất để đọc về các xu hướng tiết kiệm năng lượng mới nhất, mẹo hay và nhiều hơn nữa. Tham gia cộng đồng của chúng tôi để học hỏi cách tối ưu hóa chi phí điện năng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 sm:h-48 overflow-hidden">
              <img 
                src="/image8.png" 
                alt="10 Cách Tiết Kiệm Điện" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                10 Cách Tiết Kiệm Điện Hiệu Quả Cho Nhà Trọ
              </h3>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-primary-600 font-semibold flex items-center justify-center gap-2 hover:gap-3 transition-all mx-auto text-xs sm:text-sm"
              >
                Đọc thêm <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 sm:h-48 overflow-hidden">
              <img 
                src="/image9.png" 
                alt="Hướng Dẫn OCR" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Hướng Dẫn Sử Dụng OCR Nhận Diện Đồng Hồ Điện
              </h3>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-primary-600 font-semibold flex items-center justify-center gap-2 hover:gap-3 transition-all mx-auto text-xs sm:text-sm"
              >
                Đọc thêm <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <div className="h-40 sm:h-48 overflow-hidden">
              <img 
                src="/image10.png" 
                alt="Bảo Mật Dữ Liệu" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Bảo Mật Dữ Liệu Tiêu Thụ Điện Của Bạn
              </h3>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-primary-600 font-semibold flex items-center justify-center gap-2 hover:gap-3 transition-all mx-auto text-xs sm:text-sm"
              >
                Đọc thêm <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Sẵn sàng bắt đầu tiết kiệm điện?
          </h2>
          <p className="text-green-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
            Tham gia cùng hàng nghìn người dùng đang tiết kiệm chi phí điện mỗi ngày
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-xl hover:scale-105 transform text-sm sm:text-base">
            Đăng Ký Miễn Phí <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-gradient-to-br from-gray-50 to-green-50 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              <span className="text-gray-900">Gửi đánh giá & </span>
              <span className="text-emerald-600">Góp ý</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn mỗi ngày
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200">
            <form className="space-y-4 sm:space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                  Đánh giá của bạn <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1.5 sm:gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-gray-300 hover:text-emerald-500 transition-colors"
                    >
                      <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">
                  Họ và tên
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition text-sm sm:text-base"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition text-sm sm:text-base"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">
                  Nhận xét của bạn <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ của GreenEnergy AI..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition resize-none text-sm sm:text-base"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 sm:py-4 rounded-lg transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transform text-sm sm:text-base"
              >
                Gửi đánh giá
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Contact & Location Section */}
      <div id="contact" className="bg-slate-900 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              <span className="text-white">Liên hệ & </span>
              <span className="text-emerald-400">Địa chỉ</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
              Hãy liên hệ với chúng tôi để được tư vấn miễn phí
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Info */}
            <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-slate-700">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Thông tin liên hệ</h3>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Address */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-emerald-500/20 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Địa chỉ</h4>
                    <p className="text-slate-400 text-xs sm:text-sm">Số 1 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM</p>
                  </div>
                </div>

                {/* Hotline */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-emerald-500/20 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Hotline</h4>
                    <a href="tel:0888889805" className="text-emerald-400 hover:text-emerald-300 transition text-sm sm:text-base">088 888 9805</a>
                    <p className="text-slate-500 text-xs sm:text-sm">Zalo: 0888889805</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-emerald-500/20 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Email</h4>
                    <a href="mailto:greenenergy@gmail.com" className="text-emerald-400 hover:text-emerald-300 transition text-sm sm:text-base break-all">greenenergy@gmail.com</a>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-emerald-500/20 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Website</h4>
                    <a href="https://greenenergy.vn" className="text-emerald-400 hover:text-emerald-300 transition text-sm sm:text-base break-all">https://greenenergy.vn</a>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-700 text-center">
                <p className="text-slate-400 text-xs sm:text-sm">Hỗ trợ 24/7 - Tư vấn miễn phí</p>
              </div>
            </div>

            {/* Map */}
            <div className="bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700 h-[400px] sm:h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4544374621546!2d106.76933817570754!3d10.850632857778526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f23816ab%3A0x282f711441b6916f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTxrAgcGjhuqFtIEvhu7kgdGh14bqtdCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1709053200000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="GreenEnergy AI Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
          {/* Desktop: 4 columns, Mobile: Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 md:gap-8">
            {/* Company Info - Desktop only shows logo, Mobile shows full info */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                <img src="/logo.png" alt="GreenEnergy AI" className="h-16 sm:h-20 md:h-24 -ml-0 sm:-ml-6 md:-ml-8 -mt-0 sm:-mt-4 md:-mt-8" />
              </div>
              <p className="text-xs sm:text-sm mb-3 -ml-0 sm:-ml-6 md:-ml-8 text-gray-400">
                Giải pháp quản lý điện năng thông minh cho mọi người
              </p>
              <p className="text-xs -ml-0 sm:-ml-6 md:-ml-8 text-gray-500">
                © 2024 GreenEnergy AI
              </p>
            </div>

            {/* Company Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm">Support</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm">Stay Up to Date</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">
                Đăng ký nhận tin tức và cập nhật mới nhất
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center sm:w-auto">
                  <Mail size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              &copy; 2024 GreenEnergy AI. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 text-center sm:text-right">
              Được phát triển với <span className="text-red-500">❤️</span> tại Việt Nam
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

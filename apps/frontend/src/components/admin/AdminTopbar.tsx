import { Search, Bell, Menu } from 'lucide-react'

interface AdminTopbarProps {
  onMenuClick: () => void
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>
  )
}

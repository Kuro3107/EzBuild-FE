import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ApiService } from '../services/api'
import ChatBubble from './ChatBubble'

function AppShell() {
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { key: 'home', label: 'Home', link: '/', icon: '🏠' },
    { key: 'pcbuilder', label: 'PC Builder', link: '/pcbuilder', icon: '🔧' },
    { key: 'products', label: 'Products', icon: '📦', children: [
      { key: 'case', label: 'Case', link: '/products/case' },
      { key: 'cpu', label: 'CPU', link: '/products/cpu' },
      { key: 'mainboard', label: 'Mainboard', link: '/products/mainboard' },
      { key: 'gpu', label: 'GPU', link: '/products/gpu' },
      { key: 'ram', label: 'RAM', link: '/products/ram' },
      { key: 'storage', label: 'Storage', link: '/products/storage' },
      { key: 'psu', label: 'Power Supply', link: '/products/psu' },
      { key: 'cooling', label: 'Cooling', link: '/products/cooling' },
      { key: 'headset', label: 'Headset/Speaker', link: '/products/headset-speaker' },
      { key: 'monitor', label: 'Monitor', link: '/products/monitor' },
      { key: 'mouse', label: 'Mouse', link: '/products/mouse' },
      { key: 'keyboard', label: 'Keyboard', link: '/products/keyboard' },
    ]},
    { key: 'sales', label: 'Sales', link: '/sales', icon: '💰' },
    { key: 'compare', label: 'Compare', link: '/compare', icon: '⚖️' },
    { key: 'builds', label: 'My Builds', link: '/builds', icon: '📋' },
    { key: 'profile', label: 'Profile', link: '/profile', icon: '👤' },
    ...(ApiService.isStaff() && !ApiService.isAdmin() ? [{ key: 'staff', label: 'Staff Panel', link: '/staff', icon: '👨‍💼' }] : []),
    ...(ApiService.isAdmin() ? [{ key: 'admin', label: 'Admin Panel', link: '/admin', icon: '👑' }] : []),
  ]


  // Helper function to check if current path matches menu item
  const isActiveRoute = (item: { link?: string; children?: { link: string }[] }) => {
    if (item.link) {
      return location.pathname === item.link
    }
    if (item.children) {
      return item.children.some((child) => location.pathname === child.link)
    }
    return false
  }



  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span>EzBuild</span>
          </Link>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2">
            {menuItems.map((item) => (
              <div key={item.key}>
                {item.link ? (
                  <Link
                    to={item.link}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                      isActiveRoute(item)
                        ? 'bg-blue-600 text-white'
                        : 'text-white hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-white text-sm font-medium">{item.label}</span>
                  </Link>
                ) : item.children ? (
                  <div>
                    <button
                      onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                        isActiveRoute(item)
                          ? 'bg-blue-600 text-white'
                          : 'text-white hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isProductsMenuOpen ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    </button>
                    {isProductsMenuOpen && (
                      <div className="ml-6 mt-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.key}
                            to={child.link}
                            className={`block px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                              location.pathname === child.link
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-white">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  )
}

export default AppShell
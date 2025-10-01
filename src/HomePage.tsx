import './Homepage.css'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiService } from './services/api'
import { Carousel, Layout, Menu } from 'antd'
import { 
  HomeOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  SwapOutlined,
  PictureOutlined,
  BuildOutlined,
  UserOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined
} from '@ant-design/icons'
import LandingHero from './components/LandingHero'
import LandingFeatures from './components/LandingFeatures'
import LandingStats from './components/LandingStats'
import LandingFooter from './components/LandingFooter'

const { Header, Content, Sider } = Layout

function HomePage() {
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null)
  const productsBtnRef = useRef<HTMLAnchorElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Menu items cho sidebar
  const menuItems = [
    {
      key: 'apps',
      type: 'group' as const,
      label: 'APPS',
    },
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">PC Builder</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingCartOutlined />,
      label: 'Products',
      children: [
        { key: 'case', label: <Link to="/products/case">Case</Link> },
        { key: 'cpu', label: <Link to="/products/cpu">CPU</Link> },
        { key: 'mainboard', label: <Link to="/products/mainboard">Mainboard</Link> },
        { key: 'gpu', label: <Link to="/products/gpu">GPU</Link> },
        { key: 'ram', label: <Link to="/products/ram">RAM</Link> },
        { key: 'storage', label: <Link to="/products/storage">Storage</Link> },
        { key: 'psu', label: <Link to="/products/psu">Power Supply</Link> },
        { key: 'cooling', label: <Link to="/products/cooling">Cooling</Link> },
        { key: 'headset', label: <Link to="/products/headset-speaker">Headset/Speaker</Link> },
        { key: 'monitor', label: <Link to="/products/monitor">Monitor</Link> },
        { key: 'mouse', label: <Link to="/products/mouse">Mouse</Link> },
        { key: 'keyboard', label: <Link to="/products/keyboard">Keyboard</Link> },
      ],
    },
    {
      key: 'sales',
      icon: <TagsOutlined />,
      label: <Link to="/sales">Sales</Link>,
    },
    {
      key: 'compare',
      icon: <SwapOutlined />,
      label: <Link to="/compare">Compare</Link>,
    },
    {
      key: 'gallery',
      icon: <PictureOutlined />,
      label: 'PC Part Gallery',
    },
    {
      key: 'community',
      type: 'group' as const,
      label: 'COMMUNITY',
    },
    {
      key: 'builds',
      icon: <BuildOutlined />,
      label: 'Completed Builds',
    },
    {
      key: 'updates',
      icon: <UserOutlined />,
      label: 'Updates',
    },
    {
      key: 'setup',
      icon: <SettingOutlined />,
      label: 'Setup Builder',
    },
    {
      key: 'management',
      type: 'group' as const,
      label: 'MANAGEMENT',
    },
    ...(ApiService.isStaff() && !ApiService.isAdmin() ? [{
      key: 'staff',
      icon: <TeamOutlined />,
      label: <Link to="/staff">Staff Panel</Link>,
    }] : []),
    ...(ApiService.isAdmin() ? [{
      key: 'admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Admin Panel</Link>,
    }] : []),
  ]

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    // Kiểm tra và xóa dữ liệu cũ trước
    ApiService.checkAndClearOldData()
    
    const user = ApiService.getCurrentUser()
    console.log('Current user:', user) // Debug
    
    // Chỉ set user nếu thực sự có user đăng nhập
    if (user) {
      setCurrentUser(user)
    } else {
      setCurrentUser(null)
    }
  }, [])

  useEffect(() => {
    if (!isProductsOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        productsBtnRef.current &&
        !productsBtnRef.current.contains(target)
      ) {
        setIsProductsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsProductsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isProductsOpen])

  // Xử lý click outside cho user menu
  useEffect(() => {
    if (!isUserMenuOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsUserMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isUserMenuOpen])

  // Xử lý logout
  const handleLogout = () => {
    // Hiển thị confirm dialog
    const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?')
    
    if (confirmLogout) {
      ApiService.clearAuthData()
      setCurrentUser(null)
      setIsUserMenuOpen(false)
      
      // Redirect về trang login
      navigate('/login')
      
      // Hiển thị thông báo thành công
      alert('Đăng xuất thành công!')
    }
  }


  return (
    <>
    <Layout style={{ minHeight: '100vh' }} className="bg-grid-dark">
      {/* Header với avatar user hoặc login button */}
      {currentUser ? (
        <Header style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          zIndex: 1000, 
          background: 'transparent',
          padding: '8px 16px',
          border: 'none',
          width: 'auto'
        }}>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {(currentUser.email as string || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-800 max-w-32 truncate hidden sm:block">
                {currentUser.fullname as string || currentUser.email as string || 'User'}
              </span>
              <svg 
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isUserMenuOpen && (
              <div
                ref={userMenuRef}
                className="absolute top-full right-0 mt-3 w-72 bg-gray-900 rounded-2xl shadow-2xl py-4 z-50 border border-gray-700"
              >
                {/* User Info Section */}
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                      {(currentUser.email as string || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-base truncate">
                        {currentUser.fullname as string || currentUser.email as string || 'User'}
                      </div>
                      <div className="text-sm text-gray-300 truncate">
                        {currentUser.email as string || 'user@example.com'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link 
                    to="/customer"
                    className="w-full px-6 py-3 text-left text-blue-400 hover:bg-gray-800 transition-colors text-sm flex items-center gap-4 group"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Profile</span>
                  </Link>
                  
                  <button className="w-full px-6 py-3 text-left text-gray-300 hover:bg-gray-800 transition-colors text-sm flex items-center gap-4 group">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">Favorites</span>
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full px-6 py-3 text-left text-red-400 hover:bg-gray-800 transition-colors text-sm flex items-center gap-4 group"
                  >
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Header>
      ) : (
        <Header style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          zIndex: 1000, 
          background: 'transparent',
          padding: '8px 16px',
          border: 'none',
          width: 'auto'
        }}>
          <Link 
            to="/login"
            className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium text-gray-800">Sign In</span>
          </Link>
        </Header>
      )}

      <Layout>
            <Sider 
              width={256} 
              style={{ 
                background: '#000000',
                borderRight: '1px solid #333333',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 100
              }}
              className="hidden md:block"
            >
          {/* Logo */}
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #333333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '6px', 
              background: '#050544' 
            }} />
            <span style={{ fontWeight: '600', fontSize: '16px', color: 'white' }}>EzBuild</span>
          </div>

          {/* Menu */}
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={[location.pathname === '/' ? 'home' : '']}
            defaultOpenKeys={['products']}
            style={{ 
              height: '100%', 
              borderRight: 0,
              paddingTop: '8px',
              background: '#000000'
            }}
            items={menuItems}
            className="custom-sidebar-menu-dark"
          />

          {/* Footer links */}
          <div style={{ 
            position: 'absolute', 
            bottom: '16px', 
            left: '16px', 
            right: '16px',
            fontSize: '12px',
            color: '#8c8c8c'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" style={{ color: '#050544' }}>Contact</a>
              <a href="#" style={{ color: '#050544' }}>FAQ</a>
            </div>
          </div>
        </Sider>

        <Layout style={{ marginLeft: '256px', background: '#000000' }}>
          <Content style={{ 
            margin: 0, 
            minHeight: '100vh',
            background: '#000000',
            padding: 0
          }}>
          {/* Landing Hero Section */}
          <LandingHero currentUser={currentUser} />

          {/* Landing Features Section */}
          <LandingFeatures />

          {/* Landing Stats Section */}
          <LandingStats />

           <div style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto', background: '#000000' }}>
             <div className="section-title" style={{ color: 'white', fontSize: '36px', fontWeight: 700, textAlign: 'center', marginBottom: '16px' }}>Quick Start</div>
          
          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {[
              { 
                title: 'All-AMD Red Build', 
                description: 'High-performance AMD build with red theme',
                price: '$1,299',
                image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop'
              },
              { 
                title: 'Baller White 4K RGB', 
                description: 'Premium white build with RGB lighting',
                price: '$2,199',
                image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop'
              },
              { 
                title: 'Modern 1440p Gaming', 
                description: 'Perfect for 1440p gaming experience',
                price: '$1,599',
                image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=300&fit=crop'
              },
            ].map((item) => (
               <article key={item.title} className="qs-card group" style={{ background: '#111111', borderRadius: '16px', border: '1px solid #333333', overflow: 'hidden' }}>
                 <div className="qs-media relative overflow-hidden">
                   <img 
                     src={item.image} 
                     alt={item.title}
                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                   <div className="absolute bottom-3 left-3 text-white font-semibold text-lg">
                     {item.price}
                   </div>
                 </div>
                 <div className="qs-body" style={{ padding: '24px' }}>
                   <div className="qs-title" style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{item.title}</div>
                   <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.description}</p>
                   <div className="qs-cta" style={{ background: '#050544', color: 'white', padding: '12px 24px', borderRadius: '8px', textAlign: 'center', fontWeight: 600, cursor: 'pointer' }}>Open Build</div>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden">
            <Carousel
              autoplay
              autoplaySpeed={4000}
              dots={{ className: 'custom-dots' }}
              infinite
              speed={500}
              swipeToSlide
              className="custom-carousel"
            >
              {[
                { 
                  title: 'All-AMD Red Build', 
                  description: 'High-performance AMD build with red theme',
                  price: '$1,299',
                  image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop'
                },
                { 
                  title: 'Baller White 4K RGB', 
                  description: 'Premium white build with RGB lighting',
                  price: '$2,199',
                  image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop'
                },
                { 
                  title: 'Modern 1440p Gaming', 
                  description: 'Perfect for 1440p gaming experience',
                  price: '$1,599',
                  image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=300&fit=crop'
                },
               ].map((item, index) => (
                 <div key={index} className="px-2">
                   <article className="qs-card group" style={{ background: '#111111', borderRadius: '16px', border: '1px solid #333333', overflow: 'hidden' }}>
                     <div className="qs-media relative overflow-hidden h-48">
                       <img 
                         src={item.image} 
                         alt={item.title}
                         className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                       <div className="absolute bottom-3 left-3 text-white font-bold text-xl">
                         {item.price}
                       </div>
                     </div>
                     <div className="qs-body p-4">
                       <div className="qs-title text-lg font-bold mb-2" style={{ color: 'white' }}>{item.title}</div>
                       <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.description}</p>
                       <div className="qs-cta px-4 py-2 rounded-lg text-center font-medium transition-colors" style={{ background: '#050544', color: 'white' }}>
                         Open Build
                       </div>
                     </div>
                   </article>
                 </div>
               ))}
            </Carousel>
            </div>
          </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
    
    {/* Landing Footer - Outside Layout for Full Width */}
    <LandingFooter />
    </>
  )
}

export default HomePage



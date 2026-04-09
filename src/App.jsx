import './index.css'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LocaleProvider } from './i18n/LocaleContext'
import { AuthProvider } from './firebase/AuthContext.jsx'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Carousel from './components/Carousel'
import Footer from './components/Footer'
import ProductDetail from './components/ProductDetail'
import NotFound from './components/NotFound'
import Marketplace from './components/Marketplace'
import Contact from './components/Contact'
import AdminAuthGuard from './components/AdminAuthGuard'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './components/AdminLogin'
import AdminHome from './components/AdminHome'
import { detectNearestBranch } from './utils/nearestBranch'

function Home() {
  useEffect(() => { detectNearestBranch() }, [])
  return (
    <>
      <Banner />
      <Carousel />
      <Footer />
    </>
  )
}

function AppContent() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<><Contact /><Footer /></>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminAuthGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <LocaleProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocaleProvider>
    </HashRouter>
  )
}

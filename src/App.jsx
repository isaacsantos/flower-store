import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LocaleProvider } from './i18n/LocaleContext'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Carousel from './components/Carousel'
import Footer from './components/Footer'
import ProductDetail from './components/ProductDetail'

function Home() {
  return (
    <>
      <Banner />
      <Carousel />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  )
}

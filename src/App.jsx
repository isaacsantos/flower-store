import './index.css'
import { LocaleProvider } from './i18n/LocaleContext'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Carousel from './components/Carousel'
import Footer from './components/Footer'

export default function App() {
  return (
    <LocaleProvider>
      <Navbar />
      <Banner />
      <Carousel />
      <Footer />
    </LocaleProvider>
  )
}

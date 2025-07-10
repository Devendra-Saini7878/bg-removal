import React from 'react'
import  {Routes ,Route} from "react-router-dom"
import  Home from "./pages/Home"
import BuyCridit  from "./pages/BuyCredit";
import Navbar from './components/Navbar';
import Footer from './components/Footer'
import { ToastContainer, toast } from 'react-toastify';
import Results from './pages/Results';



const App = () => {
  return (
    <div className='min-h-screen bg-slate-50'>
      <ToastContainer position='bottom-right' />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/result' element={<Results />} />
        <Route path='/buy' element={<BuyCridit />} />
      </Routes>
      <Footer />

    </div>
  )
}

export default App

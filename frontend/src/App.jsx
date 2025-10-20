import { useState } from 'react'
import GradientBackground from './Components/GradientBackground'
import Navbar from './Components/Navbar'
import HeroSection from './Components/HeroSection'
import Footer from './Components/Footer'
import { Loginscreen } from './Components/Loginscreen'
import Dashboard from "./Components/Dashboard";
import {BrowserRouter, Route, Routes, Navigate , useNavigate} from 'react-router-dom';

function App() {

  const LandingPage = ()=>{

    const navigate = useNavigate();
    const goToLoginpage = () => {
    navigate("/login")};

    return (
      <div className='pb-3 lg:pb-4 pl-3 lg:pl-4 pr-3 lg:pr-4'>
      <GradientBackground>
        <div className="flex flex-col min-h-screen">
          <header className='flex items-center px-3 lg:px-4 mt-6 lg:mt-8 z-10 relative'>
            <div className='flex items-center gap-3 lg:gap-4 ml-1 lg:ml-2'>
              <div className='font-semibold text-lg lg:text-xl xl:text-2xl'>Qumail</div>
            </div>

            <div className='absolute left-1/2 transform -translate-x-1/2'>
              <Navbar />
            </div>

            <div className='absolute right-6 lg:right-9 transform -translate-x-3 lg:-translate-x-5'>
            <div className='flex items-center gap-2 lg:gap-3'>
                <button
                    onClick={goToLoginpage}
                    type="button"
                    className="bg-white text-black px-4 lg:px-6 py-1 lg:py-2 rounded-2xl font-bold text-xs lg:text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >Login</button>
                <div>Cyber</div>
            </div>
            </div>
          </header>
            <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-6 xl:px-8 text-center">
              <HeroSection />
                <button onClick={goToLoginpage}
                className="bg-white text-purple-900 px-6 lg:px-8 xl:px-10 py-3 lg:py-3.5 xl:py-4 rounded-full font-semibold text-sm lg:text-base xl:text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 lg:gap-3 hover:bg-gray-100"
                >Get Started<span className="text-base lg:text-lg">›</span></button>
                </div>
                </div>

      </GradientBackground>
      <Footer></Footer>
    </div>
    )
  }

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/landingpage" element={<LandingPage />} />
      <Route path="/" element={<Navigate to="/landingpage" />} />
      <Route path="/login" element={<Loginscreen/>} />
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='*' element={<LandingPage />}/>
    </Routes>
    
    </BrowserRouter>
    
  )
}

export default App

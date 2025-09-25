import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import HomePage from './HomePage.tsx'
import SalesPage from './pages/sales.tsx'
import CasePage from './pages/products/case.tsx'
import CPUPage from './pages/products/cpu.tsx'
import MainboardPage from './pages/products/mainboard.tsx'
import GPUPage from './pages/products/gpu.tsx'
import RAMPage from './pages/products/ram.tsx'
import StoragePage from './pages/products/storage.tsx'
import PSUPage from './pages/products/psu.tsx'
import CPUCoolerPage from './pages/products/cpu-cooler.tsx'
import CaseFanPage from './pages/products/case-fan.tsx'
import MonitorPage from './pages/products/monitor.tsx'
import MousePage from './pages/products/mouse.tsx'
import KeyboardPage from './pages/products/keyboard.tsx'
import HeadphonesPage from './pages/products/headphones.tsx'
import WebcamPage from './pages/products/webcam.tsx'
import MicrophonePage from './pages/products/microphone.tsx'
import SpeakersPage from './pages/products/speakers.tsx'
import LoginPage from './pages/login&register/login.tsx'
import RegisterPage from './pages/login&register/register.tsx'
import ComparePage from './pages/compare/compare.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/case" element={<CasePage />} />
        <Route path="/products/cpu" element={<CPUPage />} />
        <Route path="/products/mainboard" element={<MainboardPage />} />
        <Route path="/products/gpu" element={<GPUPage />} />
        <Route path="/products/ram" element={<RAMPage />} />
        <Route path="/products/storage" element={<StoragePage />} />
        <Route path="/products/psu" element={<PSUPage />} />
        <Route path="/products/cpu-cooler" element={<CPUCoolerPage />} />
        <Route path="/products/case-fan" element={<CaseFanPage />} />
        <Route path="/products/monitor" element={<MonitorPage />} />
        <Route path="/products/mouse" element={<MousePage />} />
        <Route path="/products/keyboard" element={<KeyboardPage />} />
        <Route path="/products/headphones" element={<HeadphonesPage />} />
        <Route path="/products/webcam" element={<WebcamPage />} />
        <Route path="/products/microphone" element={<MicrophonePage />} />
        <Route path="/products/speakers" element={<SpeakersPage />} />
      </Routes>
    </Router>
  </StrictMode>,
)

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import RainEffect from './components/RainEffect'
import Home from './components/main/Home'
import AnimeFullInfoPage from './pages/AnimeFullInfoPage'

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={isAuthPage ? 'app' : ''}>
      {isAuthPage && <RainEffect />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/anime/:title" element={<AnimeFullInfoPage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  )
}

export default App

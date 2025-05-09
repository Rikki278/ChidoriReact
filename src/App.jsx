import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import RainEffect from './components/RainEffect'

function App() {
  return (
    <div className="app">
      <RainEffect />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import RainEffect from './components/RainEffect'
import Home from './components/main/Home'
import AnimeFullInfoPage from './pages/AnimeFullInfoPage'
import UserProfilePage from './pages/UserProfilePage'
import UserProfileViewPage from './pages/UserProfileViewPage'
import PostSearchPage from './pages/PostSearchPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage';

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
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfileViewPage />} />
        <Route path="/anime/:title" element={<AnimeFullInfoPage />} />
        <Route path="/search" element={<PostSearchPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/adminpage" element={<AdminPage />} />
      </Routes>
    </div>
  )
}

export default App

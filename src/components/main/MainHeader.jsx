import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Home.css';

const MainHeader = () => {
  const location = useLocation();
  return (
    <header className="main-header main-header-full">
      <div className="header-title">
        Chidori
        <span className="header-title-jp">千鳥</span>
      </div>
      <nav className="header-nav">
        <Link to="/home" className="header-link" tabIndex={0} aria-label="Go to Home" style={{ fontWeight: 700, color: location.pathname === '/home' ? '#6effff' : undefined }}>Home</Link>
        {/* <a href="#" className="header-link">Favorites</a>
        <a href="#" className="header-link">Chat</a>
        <a href="#" className="header-link">Profile</a> */}
      </nav>
    </header>
  );
};

export default MainHeader; 
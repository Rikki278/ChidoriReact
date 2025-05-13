import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';

const MainHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  useEffect(() => {
    // If on /search, sync input with query param
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      setSearch(params.get('q') || '');
    } else {
      setSearch('');
    }
  }, [location]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const isAnimePage = /^\/anime\//.test(location.pathname);
  return (
    <header className="main-header main-header-full">
      <div className="header-left">
        <div className="header-title">
          Chidori
          <span className="header-title-jp">千鳥</span>
        </div>
      </div>
      <div className="header-center">
        {location.pathname === '/search' && (
          <input
            type="text"
            className="search-page-input search-page-input-compact"
            placeholder="Search posts by anime..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search posts"
            style={{ maxWidth: 340 }}
          />
        )}
      </div>
      <div className="header-right">
        <nav className="header-nav">
          <Link to="/home" className="header-link" tabIndex={0} aria-label="Go to Home" style={{ fontWeight: 700, color: location.pathname === '/home' ? '#6effff' : undefined }}>Home</Link>
          <Link to="/search" className="header-link" tabIndex={0} aria-label="Go to Search" style={{ fontWeight: 700, color: location.pathname === '/search' ? '#6effff' : undefined }}>Search</Link>
          {!isAnimePage && (
            <Link to="/profile" className="header-link" tabIndex={0} aria-label="Go to Profile" style={{ fontWeight: 700, color: location.pathname === '/profile' ? '#6effff' : undefined }}>Profile</Link>
          )}
          {/* <a href="#" className="header-link">Favorites</a>
          <a href="#" className="header-link">Chat</a>
          <a href="#" className="header-link">Profile</a> */}
        </nav>
      </div>
    </header>
  );
};

export default MainHeader; 
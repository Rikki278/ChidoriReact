import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';

const USER_API = '/api/users';

const MainHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // If on /search, sync input with query param
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      setSearch(params.get('q') || '');
    } else {
      setSearch('');
    }
  }, [location]);

  // Debounced user search
  useEffect(() => {
    if (!userSearch) {
      setUserResults([]);
      setShowUserDropdown(false);
      return;
    }
    setLoadingUsers(true);
    const token = localStorage.getItem('accessToken');
    fetch(`${USER_API}/search/username/${encodeURIComponent(userSearch)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setUserResults(data);
        setShowUserDropdown(true);
      })
      .catch(() => setUserResults([]))
      .finally(() => setLoadingUsers(false));
  }, [userSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleUserSearchChange = (e) => {
    setUserSearch(e.target.value);
  };

  const handleUserClick = (userId) => {
    setShowUserDropdown(false);
    setUserSearch('');
    setUserResults([]);
    navigate(`/profile/${userId}`);
  };

  const handleBlur = () => {
    setTimeout(() => setShowUserDropdown(false), 120); // allow click
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
      <div className="header-center" style={{ position: 'absolute', left: '50%', top: '27%', transform: 'translateX(-50%)', width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
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
        {/* Поиск пользователей */}
        {location.pathname !== '/search' && (
          <div style={{ position: 'relative', display: 'inline-block', marginLeft: 18 }}>
            <input
              type="text"
              className="search-page-input search-page-input-compact"
              placeholder="Search users..."
              value={userSearch}
              onChange={handleUserSearchChange}
              onFocus={() => userResults.length > 0 && setShowUserDropdown(true)}
              onBlur={handleBlur}
              aria-label="Search users"
              style={{ maxWidth: 220, minWidth: 120, background: '#181a23', color: '#6effff', border: '1.5px solid #6effff', borderRadius: 10, paddingLeft: 14, fontSize: 15 }}
            />
            {showUserDropdown && (
              <div style={{ position: 'absolute', top: 38, left: 0, width: '100%', background: '#23263a', border: '1.5px solid #6effff', borderRadius: 10, zIndex: 20, boxShadow: '0 4px 24px #00b4d822', maxHeight: 320, overflowY: 'auto' }}>
                {loadingUsers ? (
                  <div style={{ color: '#6effff', padding: 12, textAlign: 'center' }}>Loading...</div>
                ) : userResults.length === 0 ? (
                  <div style={{ color: '#90e0ef', padding: 12, textAlign: 'center' }}>No users found.</div>
                ) : (
                  userResults.map(user => (
                    <div
                      key={user.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s', color: '#d0e4ff' }}
                      onClick={() => handleUserClick(user.id)}
                      tabIndex={0}
                      aria-label={`Go to profile of @${user.username}`}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleUserClick(user.id)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <img src={user.profileImageUrl} alt={user.username} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #6effff', background: '#23263a' }} />
                      <span style={{ color: '#6effff', fontWeight: 700 }}>@{user.username}</span>
                      {user.fullName && <span style={{ color: '#90e0ef', fontSize: 14 }}>{user.fullName}</span>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="header-right">
        <nav className="header-nav">
          <Link to="/home" className="header-link" tabIndex={0} aria-label="Go to Home" style={{ fontWeight: 700, color: location.pathname === '/home' ? '#6effff' : undefined }}>Home</Link>
          <Link to="/search" className="header-link" tabIndex={0} aria-label="Go to Search" style={{ fontWeight: 700, color: location.pathname === '/search' ? '#6effff' : undefined }}>Search</Link>
          <Link to="/recommendations" className="header-link" tabIndex={0} aria-label="Go to AI Recommendations" style={{ fontWeight: 700, color: location.pathname === '/recommendations' ? '#6effff' : undefined }}>AI</Link>
          <Link to="/chat" className="header-link" tabIndex={0} aria-label="Go to Chat" style={{ fontWeight: 700, color: location.pathname === '/chat' ? '#6effff' : undefined }}>Chat</Link>
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
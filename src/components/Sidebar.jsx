import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <a className="sidebar-link active" href="#"><span role="img" aria-label="home">🏠</span> Home</a>
        <a className="sidebar-link" href="#"><span role="img" aria-label="explore">🔍</span> Explore</a>
        <a className="sidebar-link" href="#"><span role="img" aria-label="notifications">🔔</span> Notifications</a>
        <a className="sidebar-link" href="#"><span role="img" aria-label="messages">✉️</span> Messages</a>
        <a className="sidebar-link" href="#"><span role="img" aria-label="library">📚</span> Library</a>
        <a className="sidebar-link" href="#"><span role="img" aria-label="games">🎮</span> Games</a>
        <a className="sidebar-link" href="#"><span role="img" aria-label="settings">⚙️</span> Settings</a>
      </nav>
      <div className="sidebar-profile">
        <img className="sidebar-profile-avatar" src="https://randomuser.me/api/portraits/women/44.jpg" alt="Jiyan Main" />
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">Jiyan Main</div>
          <div className="sidebar-profile-username">@jiyan_waves</div>
        </div>
        <div className="sidebar-profile-menu">...</div>
      </div>
    </aside>
  );
};

export default Sidebar; 
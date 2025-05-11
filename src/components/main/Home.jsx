import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import CharacterCard from '../CharacterCard';
import './Home.css';
import Sidebar from '../Sidebar';
import { postsAPI } from '../../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const data = await postsAPI.getRecommendedPosts(token);
        setPosts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch posts');
        setLoading(false);
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, []);

  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  if (loading) {
    return (
      <div className="home-bg">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-bg">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-bg" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="main-header">
          <div className="header-title">CreativeLab</div>
          <nav className="header-nav">
            <a href="#" className="header-link">Home</a>
            <a href="#" className="header-link">Favorites</a>
            <a href="#" className="header-link">Chat</a>
            <a href="#" className="header-link">Profile</a>
          </nav>
        </header>
        <div className="characters-section">
          <Masonry
            breakpointCols={breakpointColumns}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {posts.map((post) => (
              <CharacterCard
                key={post.id}
                character={post}
              />
            ))}
          </Masonry>
        </div>
      </div>
    </div>
  );
};

export default Home; 
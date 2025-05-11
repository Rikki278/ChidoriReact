import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import CharacterCard from '../CharacterCard';
import './Home.css';
import ChidoriBackground from '../ChidoriBackground';
import { postsAPI } from '../../services/api';
import Tilt from 'react-parallax-tilt';

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
    default: 5,
    1400: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  if (loading) {
    return (
      <div className="home-bg">
        <ChidoriBackground />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-bg">
        <ChidoriBackground />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <ChidoriBackground />
      <header className="main-header main-header-full">
        <div className="header-title">
          Chidori
          <span className="header-title-jp">千鳥</span>
        </div>
        <nav className="header-nav">
          <a href="#" className="header-link">Home</a>
          <a href="#" className="header-link">Favorites</a>
          <a href="#" className="header-link">Chat</a>
          <a href="#" className="header-link">Profile</a>
        </nav>
      </header>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '90px' }}>
        <div className="characters-section">
          <Masonry
            breakpointCols={breakpointColumns}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {posts.map((post) => (
              <Tilt
                key={post.id}
                glareEnable={true}
                glareMaxOpacity={0.10}
                glareColor="#fff"
                glarePosition="all"
                tiltMaxAngleX={5}
                tiltMaxAngleY={5}
                scale={0.98}
                tiltReverse={true}
                transitionSpeed={1200}
                style={{ borderRadius: 16, marginBottom: 20 }}
              >
                <CharacterCard character={post} />
              </Tilt>
            ))}
          </Masonry>
        </div>
      </div>
    </div>
  );
};

export default Home; 
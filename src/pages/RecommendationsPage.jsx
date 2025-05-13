import React, { useEffect, useState } from 'react';
import MainHeader from '../components/main/MainHeader';
import ChidoriBackground from '../components/ChidoriBackground';
import Masonry from 'react-masonry-css';
import Tilt from 'react-parallax-tilt';
import CharacterCard from '../components/CharacterCard';
import PostDetailsModal from '../components/main/PostDetailsModal';
import LottieLoader from '../components/LottieLoader';

const getToken = () => localStorage.getItem('accessToken');

const breakpointColumns = {
  default: 5,
  1400: 4,
  1100: 3,
  700: 2,
  500: 1
};

const RecommendationsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        // Get userId from profile
        const profileRes = await fetch('/api/users/profile-posts', {
          headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        if (!profileRes.ok) throw new Error('Failed to get user profile');
        const profile = await profileRes.json();
        const userId = profile.id;
        // Fetch recommendations
        const recRes = await fetch(`/api/recommendations/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        if (!recRes.ok) throw new Error('Failed to load recommendations');
        const data = await recRes.json();
        setPosts(data);
      } catch {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleCardClick = (postId) => {
    setSelectedPostId(postId);
    setDetailsModalOpen(true);
  };
  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedPostId(null);
  };

  return (
    <div className="home-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <ChidoriBackground />
      <MainHeader />
      <div className="user-profile-root">
        <div className="user-profile-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <div className="user-profile-posts-block" style={{ width: '100%' }}>
            <h2>AI Recommendations</h2>
            {loading ? (
              <div className="user-profile-loader">
                <LottieLoader />
              </div>
            ) : error ? (
              <div className="user-profile-error">{error}</div>
            ) : posts.length === 0 ? (
              <div className="user-profile-empty">No recommendations found</div>
            ) : (
              <div className="characters-section">
                <Masonry
                  breakpointCols={posts.length < 5 ? (posts.length || 1) : breakpointColumns}
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
                      <CharacterCard character={post} onClick={() => handleCardClick(post.id)} />
                    </Tilt>
                  ))}
                </Masonry>
              </div>
            )}
          </div>
        </div>
      </div>
      <PostDetailsModal
        postId={selectedPostId}
        isOpen={detailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
};

export default RecommendationsPage; 
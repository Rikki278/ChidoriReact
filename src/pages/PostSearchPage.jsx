import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainHeader from '../components/main/MainHeader';
import ChidoriBackground from '../components/ChidoriBackground';
import Masonry from 'react-masonry-css';
import Tilt from 'react-parallax-tilt';
import CharacterCard from '../components/CharacterCard';
import PostDetailsModal from '../components/main/PostDetailsModal';

const getToken = () => localStorage.getItem('accessToken');

const breakpointColumns = {
  default: 5,
  1400: 4,
  1100: 3,
  700: 2,
  500: 1
};

const PAGE_SIZE = 20;

const PostSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef();

  const query = new URLSearchParams(location.search).get('q') || '';

  // Reset posts and page on new search
  useEffect(() => {
    setSearch(query);
    setPosts([]);
    setPage(0);
    setHasMore(true);
    setError('');
  }, [query]);

  // Initial load and on page change
  useEffect(() => {
    let ignore = false;
    const fetchPosts = async () => {
      if ((page === 0 && posts.length > 0) || !hasMore) return;
      if (page === 0) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await fetch(`/api/posts?anime=${encodeURIComponent(query)}&page=${page}&size=${PAGE_SIZE}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error('Failed to load posts');
        const data = await res.json();
        if (!ignore) {
          setPosts(prev => page === 0 ? data : [...prev, ...data]);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch {
        if (!ignore) setError('Failed to load posts');
      } finally {
        if (!ignore) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };
    fetchPosts();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [query, page]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    if (docHeight - (scrollY + windowHeight) < 300) {
      setPage(p => p + 1);
    }
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

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
            <h2>Search Results{query ? ` for "${query}"` : ''}</h2>
            {loading && posts.length === 0 ? (
              <div className="user-profile-loader">Loading...</div>
            ) : error ? (
              <div className="user-profile-error">{error}</div>
            ) : posts.length === 0 ? (
              <div className="user-profile-empty">No posts found</div>
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
                {loadingMore && (
                  <div className="user-profile-loader" style={{ margin: '32px 0' }}>Loading more...</div>
                )}
                {!hasMore && posts.length > 0 && (
                  <div style={{ color: '#6effff88', textAlign: 'center', margin: '32px 0 0 0', fontSize: '1.1em' }}></div>
                )}
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

export default PostSearchPage; 
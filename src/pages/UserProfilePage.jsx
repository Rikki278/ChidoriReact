import React, { useEffect, useState, useRef } from 'react';
import ChidoriBackground from '../components/ChidoriBackground';
import MainHeader from '../components/main/MainHeader';
import PostDetailsModal from '../components/main/PostDetailsModal';
import Tilt from 'react-parallax-tilt';
import ProfilePostCard from './ProfilePostCard';
import './UserProfilePage.css';

const getToken = () => localStorage.getItem('accessToken');

const getDominantColor = (imgUrl, callback) => {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrl;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    callback(`rgba(${r},${g},${b},0.85)`);
  };
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hour${diffH === 1 ? '' : 's'} ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} day${diffD === 1 ? '' : 's'} ago`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return `${diffW} week${diffW === 1 ? '' : 's'} ago`;
  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `${diffM} month${diffM === 1 ? '' : 's'} ago`;
  const diffY = Math.floor(diffD / 365);
  return `${diffY} year${diffY === 1 ? '' : 's'} ago`;
};

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/users/profile-posts', {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        console.log('[UserProfilePage] profile-posts:', data);
        setProfile(data);
      })
      .catch((err) => {
        setError('Failed to load profile');
        console.error('[UserProfilePage] Error loading profile-posts:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePostClick = (id) => {
    setSelectedPostId(id);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPostId(null);
  };

  return (
    <div className="home-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <ChidoriBackground />
      <MainHeader />
      <div className="user-profile-root">
        {loading ? (
          <div className="user-profile-loader">Loading...</div>
        ) : error ? (
          <div className="user-profile-error">{error}</div>
        ) : profile && (
          <div className="user-profile-content">
            <div className="user-profile-info">
              <img src={profile.profileImageUrl} alt="avatar" className="user-profile-avatar" />
              <div className="user-profile-username">@{profile.username}</div>
              <div className="user-profile-name">{profile.firstName} {profile.lastName}</div>
              <div className="user-profile-email">{profile.email}</div>
              {profile.bio && <div className="user-profile-bio">{profile.bio}</div>}
              <div className="user-profile-dates">
                <span>Joined: {new Date(profile.createdAt).toLocaleDateString()}</span>
                <span>Last login: {getTimeAgo(profile.lastLogin)}</span>
              </div>
            </div>
            <div className="user-profile-posts-block">
              <h2>My Posts</h2>
              {console.log('[UserProfilePage] characterPosts:', profile.characterPosts)}
              <div className="user-profile-posts-grid">
                {(profile.characterPosts || []).length === 0 ? (
                  <div className="user-profile-empty">No posts</div>
                ) : (
                  [...(profile.characterPosts || [])]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(post => (
                      <ProfilePostCard key={post.id} post={post} onClick={() => handlePostClick(post.id)} />
                    ))
                )}
              </div>
              <h2>Favorites</h2>
              {console.log('[UserProfilePage] favoritePosts:', profile.favoritePosts)}
              <div className="user-profile-posts-grid">
                {(profile.favoritePosts || []).length === 0 ? (
                  <div className="user-profile-empty">No favorites</div>
                ) : (
                  [...(profile.favoritePosts || [])]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(post => (
                      <ProfilePostCard key={post.id} post={post} onClick={() => handlePostClick(post.id)} />
                    ))
                )}
              </div>
            </div>
            <PostDetailsModal postId={selectedPostId} isOpen={modalOpen} onClose={handleCloseModal} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage; 
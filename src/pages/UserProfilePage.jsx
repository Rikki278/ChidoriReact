import React, { useEffect, useState, useRef } from 'react';
import ChidoriBackground from '../components/ChidoriBackground';
import MainHeader from '../components/main/MainHeader';
import PostDetailsModal from '../components/main/PostDetailsModal';
import Tilt from 'react-parallax-tilt';
import ProfilePostCard from './ProfilePostCard';
import './UserProfilePage.css';
import Lottie from 'lottie-react';
import lightningLottie from '../assets/animation/Animation - 1746823194589.json';

const getToken = () => localStorage.getItem('accessToken');

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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleAvatarEditClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/users/profile/picture', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update avatar');
      // После успешного обновления — перезапрашиваем профиль
      try {
        const profileRes = await fetch('/api/users/profile-posts', {
          headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        if (!profileRes.ok) throw new Error('Failed to reload profile');
        const newProfile = await profileRes.json();
        setProfile(newProfile);
      } catch {
        alert('Avatar updated, but failed to reload profile');
      }
    } catch {
      alert('Failed to update avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="home-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <ChidoriBackground />
      <MainHeader />
      <div className="user-profile-root">
        {loading ? (
          <div className="user-profile-loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
            <Lottie
              animationData={lightningLottie}
              loop
              autoplay
              style={{ height: 120, width: 120, filter: 'drop-shadow(0 0 24px #6effff) drop-shadow(0 0 48px #00b4d8)' }}
            />
            <div style={{ color: '#6effff', marginTop: 12, fontWeight: 500 }}>Loading...</div>
          </div>
        ) : error ? (
          <div className="user-profile-error">{error}</div>
        ) : profile && (
          <div className="user-profile-content">
            <div className="user-profile-info">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={profile.profileImageUrl} alt="avatar" className="user-profile-avatar" />
                {avatarUploading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(10,16,32,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    zIndex: 3,
                  }}>
                    <Lottie
                      animationData={lightningLottie}
                      loop
                      autoplay
                      style={{ height: 64, width: 64, filter: 'drop-shadow(0 0 16px #6effff) drop-shadow(0 0 32px #00b4d8)' }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="avatar-edit-btn"
                  aria-label="Change avatar"
                  tabIndex={0}
                  onClick={handleAvatarEditClick}
                  disabled={avatarUploading}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#6effff',
                    boxShadow: 'none',
                    zIndex: 2,
                  }}
                >
                  <span style={{
                    fontSize: 28,
                    color: '#6effff',
                    filter: 'drop-shadow(0 0 8px #6effff) drop-shadow(0 0 16px #00b4d8)',
                    WebkitTextStroke: '1px #00b4d8',
                  }}>📷</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  aria-label="Upload new avatar"
                />
              </div>
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
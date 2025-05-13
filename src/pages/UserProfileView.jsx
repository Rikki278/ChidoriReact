import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChidoriBackground from '../components/ChidoriBackground';
import MainHeader from '../components/main/MainHeader';
import ProfilePostCard from './ProfilePostCard';
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

const UserProfileView = ({ userId, isOwn }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    const url = userId ? `/api/users/${userId}/profile-posts` : '/api/users/profile-posts';
    fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setProfile(data);
        if (data.id) {
          fetch(`/api/relationships/${data.id}/followers/count`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
          })
            .then(res => res.ok ? res.json() : 0)
            .then(setFollowersCount)
            .catch(() => setFollowersCount(0));
          fetch(`/api/relationships/${data.id}/following/count`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
          })
            .then(res => res.ok ? res.json() : 0)
            .then(setFollowingCount)
            .catch(() => setFollowingCount(0));
          if (!isOwn) {
            fetch(`/api/relationships/${data.id}/is-following`, {
              headers: { 'Authorization': `Bearer ${getToken()}` },
            })
              .then(res => res.ok ? res.json() : false)
              .then(setIsFollowing)
              .catch(() => setIsFollowing(false));
          }
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [userId, isOwn]);

  const handleOpenFollowers = () => {
    if (!profile?.id) return;
    setFollowersModalOpen(true);
    setListLoading(true);
    setListError('');
    fetch(`/api/relationships/${profile.id}/followers`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setFollowersList)
      .catch(() => setListError('Failed to load followers'))
      .finally(() => setListLoading(false));
  };
  const handleOpenFollowing = () => {
    if (!profile?.id) return;
    setFollowingModalOpen(true);
    setListLoading(true);
    setListError('');
    fetch(`/api/relationships/${profile.id}/following`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setFollowingList)
      .catch(() => setListError('Failed to load following'))
      .finally(() => setListLoading(false));
  };
  const handleCloseFollowers = () => {
    setFollowersModalOpen(false);
    setFollowersList([]);
    setListError('');
  };
  const handleCloseFollowing = () => {
    setFollowingModalOpen(false);
    setFollowingList([]);
    setListError('');
  };
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };
  const handleFollowToggle = async () => {
    if (!profile?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await fetch(`/api/relationships/${profile.id}/unfollow`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        setIsFollowing(false);
        setFollowersCount(c => c - 1);
      } else {
        await fetch(`/api/relationships/${profile.id}/follow`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        setIsFollowing(true);
        setFollowersCount(c => c + 1);
      }
    } catch {
      // Optionally show error
    } finally {
      setFollowLoading(false);
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
              <img src={profile.profileImageUrl} alt="avatar" className="user-profile-avatar" />
              <div className="user-profile-username">@{profile.username}</div>
              <div className="user-profile-name">{profile.firstName} {profile.lastName}</div>
              <div className="user-profile-email">{profile.email}</div>
              {profile.bio && <div className="user-profile-bio">{profile.bio}</div>}
              <div className="user-profile-dates">
                <span>Joined: {new Date(profile.createdAt).toLocaleDateString()}</span>
                <span>Last login: {getTimeAgo(profile.lastLogin)}</span>
              </div>
              <div className="user-profile-relations">
                <button
                  className="relation-btn"
                  onClick={handleOpenFollowers}
                  aria-label="Show followers"
                  tabIndex={0}
                >
                  Followers: {followersCount}
                </button>
                <button
                  className="relation-btn"
                  onClick={handleOpenFollowing}
                  aria-label="Show following"
                  tabIndex={0}
                >
                  Following: {followingCount}
                </button>
              </div>
              {!isOwn && (
                <button
                  className="edit-profile-btn"
                  style={{ marginTop: 18, minWidth: 120 }}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
                  tabIndex={0}
                >
                  {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
            <div className="user-profile-posts-block">
              <h2>Posts</h2>
              <div className="user-profile-posts-grid">
                {(profile.characterPosts || []).length === 0 ? (
                  <div className="user-profile-empty">No posts</div>
                ) : (
                  [...(profile.characterPosts || [])]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(post => (
                      <ProfilePostCard key={post.id} post={post} onClick={() => {}} />
                    ))
                )}
              </div>
              <h2>Favorites</h2>
              <div className="user-profile-posts-grid">
                {(profile.favoritePosts || []).length === 0 ? (
                  <div className="user-profile-empty">No favorites</div>
                ) : (
                  [...(profile.favoritePosts || [])]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(post => (
                      <ProfilePostCard key={post.id} post={post} onClick={() => {}} />
                    ))
                )}
              </div>
            </div>
            {/* Followers Modal */}
            {followersModalOpen && (
              <div className="modal-overlay" onClick={e => { if (e.target.classList.contains('modal-overlay')) handleCloseFollowers(); }}>
                <div className="edit-profile-modal">
                  <div className="modal-header">
                    <h2>Followers</h2>
                    <button
                      className="modal-close-btn"
                      onClick={handleCloseFollowers}
                      aria-label="Close modal"
                      tabIndex={0}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="edit-profile-form">
                    {listLoading ? (
                      <div style={{ color: '#6effff', textAlign: 'center' }}>Loading...</div>
                    ) : listError ? (
                      <div className="update-error">{listError}</div>
                    ) : followersList.length === 0 ? (
                      <div style={{ color: '#8fd7ff', textAlign: 'center' }}>No followers yet</div>
                    ) : (
                      <ul className="relation-list">
                        {followersList.map(user => (
                          <li key={user.id} className="relation-list-item" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => handleUserClick(user.id)}>
                            <img src={user.profileImageUrl} alt="avatar" className="relation-avatar" />
                            <div className="relation-info">
                              <div className="relation-username">@{user.username}</div>
                              <div className="relation-name">{user.firstName} {user.lastName}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Following Modal */}
            {followingModalOpen && (
              <div className="modal-overlay" onClick={e => { if (e.target.classList.contains('modal-overlay')) handleCloseFollowing(); }}>
                <div className="edit-profile-modal">
                  <div className="modal-header">
                    <h2>Following</h2>
                    <button
                      className="modal-close-btn"
                      onClick={handleCloseFollowing}
                      aria-label="Close modal"
                      tabIndex={0}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="edit-profile-form">
                    {listLoading ? (
                      <div style={{ color: '#6effff', textAlign: 'center' }}>Loading...</div>
                    ) : listError ? (
                      <div className="update-error">{listError}</div>
                    ) : followingList.length === 0 ? (
                      <div style={{ color: '#8fd7ff', textAlign: 'center' }}>Not following anyone yet</div>
                    ) : (
                      <ul className="relation-list">
                        {followingList.map(user => (
                          <li key={user.id} className="relation-list-item" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => handleUserClick(user.id)}>
                            <img src={user.profileImageUrl} alt="avatar" className="relation-avatar" />
                            <div className="relation-info">
                              <div className="relation-username">@{user.username}</div>
                              <div className="relation-name">{user.firstName} {user.lastName}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileView; 
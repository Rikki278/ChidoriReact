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

const UserProfileModal = ({ userId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/users/${userId}/profile-posts`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setProfile)
      .catch(() => setError('Failed to load user profile'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h2>User Profile</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal" tabIndex={0}>&times;</button>
        </div>
        <div className="edit-profile-form">
          {loading ? (
            <div style={{ color: '#6effff', textAlign: 'center' }}>Loading...</div>
          ) : error ? (
            <div className="update-error">{error}</div>
          ) : profile && (
            <div className="user-profile-content" style={{ boxShadow: 'none', background: 'none', padding: 0 }}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
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
        // Initialize form data with current profile info
        setFormData({
          username: data.username || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          bio: data.bio || ''
        });
        // Fetch followers/following counts
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
        }
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

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setUpdateError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError('');

    try {
      // Get the current token
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Only send the fields that the API expects
      const updateData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio
      };
      
      console.log('[UserProfilePage] Sending profile update request with data:', updateData);
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      console.log('[UserProfilePage] Profile update response status:', response.status);
      
      if (!response.ok) {
        console.error('[UserProfilePage] Profile update failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('[UserProfilePage] Error data:', errorData);
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      console.log('[UserProfilePage] Profile updated successfully');
      
      // Reload profile after successful update
      const profileRes = await fetch('/api/users/profile-posts', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!profileRes.ok) throw new Error('Failed to reload profile');
      
      const newProfile = await profileRes.json();
      setProfile(newProfile);
      setEditModalOpen(false);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

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
    window.open(`/profile/${userId}`, '_blank');
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
              <div className="user-profile-relations" style={{ display: 'flex', flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 10, marginBottom: 10, flexWrap: 'nowrap' }}>
                <button
                  className="relation-btn"
                  onClick={handleOpenFollowers}
                  aria-label="Show followers"
                  tabIndex={0}
                  style={{ fontSize: 14, padding: '5px 10px', minWidth: 0, whiteSpace: 'nowrap' }}
                >
                  Followers: {followersCount}
                </button>
                <button
                  className="relation-btn"
                  onClick={handleOpenFollowing}
                  aria-label="Show following"
                  tabIndex={0}
                  style={{ fontSize: 14, padding: '5px 10px', minWidth: 0, whiteSpace: 'nowrap' }}
                >
                  Following: {followingCount}
                </button>
              </div>
              
              <button 
                className="edit-profile-btn"
                onClick={handleEditClick}
                aria-label="Edit profile"
                tabIndex={0}
              >
                Edit Profile
              </button>
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
            
            {/* Edit Profile Modal */}
            {editModalOpen && (
              <div className="modal-overlay">
                <div className="edit-profile-modal">
                  <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button 
                      className="modal-close-btn" 
                      onClick={handleCloseEditModal}
                      aria-label="Close modal"
                      tabIndex={0}
                    >
                      &times;
                    </button>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="edit-profile-form">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bio">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                    {updateError && <div className="update-error">{updateError}</div>}
                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={handleCloseEditModal}
                        tabIndex={0}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="save-btn"
                        disabled={updating}
                        tabIndex={0}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

export default UserProfilePage; 
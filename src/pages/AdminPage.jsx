import React, { useState } from 'react';

const API_URL = '/api';

const AdminPage = () => {
  const [userId, setUserId] = useState('');
  const [postId, setPostId] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [postMsg, setPostMsg] = useState('');
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [commentPostId, setCommentPostId] = useState('');
  const [commentId, setCommentId] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const handleDeleteUser = async () => {
    if (!userId) return setUserMsg('Enter userId');
    setLoadingUser(true);
    setUserMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setUserMsg('User deleted successfully');
      } else {
        const err = await res.text();
        setUserMsg('Error: ' + err);
      }
    } catch (e) {
      setUserMsg('Error: ' + e.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postId) return setPostMsg('Enter postId');
    setLoadingPost(true);
    setPostMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setPostMsg('Post deleted successfully');
      } else {
        const err = await res.text();
        setPostMsg('Error: ' + err);
      }
    } catch (e) {
      setPostMsg('Error: ' + e.message);
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentPostId || !commentId) return setCommentMsg('Enter postId and commentId');
    setLoadingComment(true);
    setCommentMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/posts/${commentPostId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setCommentMsg('Comment deleted successfully');
      } else {
        const err = await res.text();
        setCommentMsg('Error: ' + err);
      }
    } catch (e) {
      setCommentMsg('Error: ' + e.message);
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #181a23, #23263a 80%)', color: '#d0e4ff', fontFamily: 'Orbitron, Arial, sans-serif' }}>
      <div style={{ maxWidth: 420, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(20,22,30,0.97)', borderRadius: 16, boxShadow: '0 0 32px #00b4d822', padding: 32 }}>
        <h2 style={{ color: '#6effff', fontWeight: 700, fontSize: 26, marginBottom: 24, textAlign: 'center' }}>Admin Panel</h2>
        <div style={{ marginBottom: 32 }}>
          <label style={{ fontWeight: 600, color: '#90e0ef' }}>Delete User by ID:</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <input
              type="number"
              placeholder="User ID"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: '1.5px solid #6effff', background: '#181a23', color: '#d0e4ff', fontSize: 16 }}
            />
            <button
              onClick={handleDeleteUser}
              style={{ background: '#6effff', color: '#181a23', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', minWidth: 90 }}
              disabled={loadingUser}
            >
              {loadingUser ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          {userMsg && <div style={{ marginTop: 8, color: userMsg.startsWith('Error') ? '#ff5a9e' : '#6effff', fontWeight: 600 }}>{userMsg}</div>}
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#90e0ef' }}>Delete Post by ID:</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <input
              type="number"
              placeholder="Post ID"
              value={postId}
              onChange={e => setPostId(e.target.value)}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: '1.5px solid #6effff', background: '#181a23', color: '#d0e4ff', fontSize: 16 }}
            />
            <button
              onClick={handleDeletePost}
              style={{ background: '#6effff', color: '#181a23', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', minWidth: 90 }}
              disabled={loadingPost}
            >
              {loadingPost ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          {postMsg && <div style={{ marginTop: 8,  color: postMsg.startsWith('Error') ? '#ff5a9e' : '#6effff', fontWeight: 600 }}>{postMsg}</div>}
        </div>
        <div style={{ marginTop: 32 }}>
          <label style={{ fontWeight: 600, color: '#90e0ef' }}>Delete Comment by Post ID & Comment ID:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <input
              type="number"
              placeholder="Post ID"
              value={commentPostId}
              onChange={e => setCommentPostId(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1.5px solid #6effff', background: '#181a23', color: '#d0e4ff', fontSize: 16 }}
            />
            <input
              type="number"
              placeholder="Comment ID"
              value={commentId}
              onChange={e => setCommentId(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1.5px solid #6effff', background: '#181a23', color: '#d0e4ff', fontSize: 16 }}
            />
            <button
              onClick={handleDeleteComment}
              style={{ background: '#6effff', color: '#181a23', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', minWidth: 90 }}
              disabled={loadingComment}
            >
              {loadingComment ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          {commentMsg && <div style={{ marginTop: 8, color: commentMsg.startsWith('Error') ? '#ff5a9e' : '#6effff', fontWeight: 600 }}>{commentMsg}</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 
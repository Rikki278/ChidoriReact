import React, { useEffect, useState } from 'react';
import './PostDetailsModal.css';

const getToken = () => localStorage.getItem('accessToken');

const PostDetailsModal = ({ postId, isOpen, onClose }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError('');
    setPost(null);
    const fetchPost = async () => {
      try {
        const token = getToken();
        const res = await fetch(`/api/posts/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load post');
        const data = await res.json();
        setPost(data);
      } catch {
        // Можно показать ошибку
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setCommentLoading(true);
    setCommentError('');
    setComments([]);
    const fetchComments = async () => {
      try {
        const token = getToken();
        const res = await fetch(`/api/posts/${postId}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load comments');
        const data = await res.json();
        setComments(data);
      } catch {
        // Можно показать ошибку
      } finally {
        setCommentLoading(false);
      }
    };
    fetchComments();
  }, [postId, isOpen]);

  const handleLike = async () => {
    if (!post) return;
    setLikeLoading(true);
    try {
      const token = getToken();
      const method = post.liked ? 'DELETE' : 'POST';
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to update like');
      setPost({ ...post, liked: !post.liked, likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1 });
    } catch {
      // Можно показать ошибку
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!post) return;
    setFavoriteLoading(true);
    try {
      const token = getToken();
      const method = post.favorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/posts/${post.id}/favorite`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to update favorite');
      setPost({ ...post, favorited: !post.favorited });
    } catch {
      // Можно показать ошибку
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      setNewComment('');
      // Обновить список комментариев
      const updated = await res.json();
      setComments([updated, ...comments]);
      setPost({ ...post, commentCount: post.commentCount + 1 });
    } catch {
      // Можно показать ошибку
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('post-modal-backdrop')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="post-modal-backdrop" tabIndex={-1} aria-modal="true" role="dialog" onClick={handleBackdropClick}>
      <div className="post-modal-content" tabIndex={0}>
        <button className="post-modal-close" aria-label="Close modal" onClick={onClose}>&times;</button>
        {loading ? (
          <div className="post-modal-loader">Loading...</div>
        ) : error ? (
          <div className="post-modal-error">{error}</div>
        ) : (
          <div className="post-modal-body">
            <div className="post-modal-image-block">
              <img src={post.characterImageUrl} alt={post.characterName} className="post-modal-image" />
            </div>
            <div className="post-modal-info-block">
              <div className="post-modal-fields">
                <div className="post-modal-field"><span className="post-modal-label">Name:</span> {post.characterName}</div>
                <div className="post-modal-field"><span className="post-modal-label">Anime:</span> {post.anime}</div>
                <div className="post-modal-field"><span className="post-modal-label">Genres:</span> {post.animeGenre.map((g, i) => (
                  <span className="post-modal-genre-tag" key={g + i}>{g}</span>
                ))}</div>
                <div className="post-modal-field"><span className="post-modal-label">Description:</span> {post.description}</div>
              </div>
              <div className="post-modal-meta-row">
                <div className="post-modal-author">
                  <img src={post.author?.profileImageUrl} alt="author" className="post-modal-author-avatar" />
                  <span>@{post.author?.username}</span>
                </div>
                <span className="post-modal-date">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <div className="post-modal-actions-row">
                <button className={`post-modal-action-btn${post.liked ? ' active' : ''}`} onClick={handleLike} disabled={likeLoading} aria-label="Like post">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={post.liked ? '#6effff' : 'none'} stroke={post.liked ? '#181c24' : '#6effff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z"/>
                  </svg>
                  {post.likeCount}
                </button>
                <button className={`post-modal-action-btn${post.favorited ? ' active' : ''}`} onClick={handleFavorite} disabled={favoriteLoading} aria-label="Favorite post">
                  <svg width="18" height="18" viewBox="-5.5 0 24 24" xmlns="http://www.w3.org/2000/svg" fill={post.favorited ? '#6effff' : 'none'} stroke={post.favorited ? '#181c24' : '#6effff'} strokeWidth="2.5"><path d="m0 2.089v21.912l6.546-6.26 6.545 6.26v-21.912c-.012-1.156-.952-2.089-2.109-2.089-0.026 0-.051 0-.077.001h.004-8.726c-.022-.001-.047-.001-.073-.001-1.158 0-2.098.933-2.109 2.088v.001z"/></svg>
                  {post.favorited ? 'Saved' : 'Save'}
                </button>
              </div>
              <div className="post-modal-comments-block">
                <h3>Comments</h3>
                <form className="post-modal-comment-form" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    disabled={submittingComment}
                  />
                  <button type="submit" disabled={submittingComment || !newComment.trim()}>Send</button>
                </form>
                {commentLoading ? (
                  <div className="post-modal-loader">Loading comments...</div>
                ) : commentError ? (
                  <div className="post-modal-error">{commentError}</div>
                ) : (
                  <ul className="post-modal-comments-list">
                    {comments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((c) => (
                      <li key={c.id} className="post-modal-comment-item">
                        <img src={c.author?.profileImageUrl} alt="author" className="post-modal-comment-avatar" />
                        <div>
                          <span className="post-modal-comment-author">@{c.author?.username}</span>
                          <span className="post-modal-comment-date">{new Date(c.createdAt).toLocaleString()}</span>
                          <div className="post-modal-comment-content">{c.content}</div>
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
    </div>
  );
};

export default PostDetailsModal; 
// import React, { useEffect, useState } from 'react';
// import { postsAPI } from '../services/api';
// import { useNavigate } from 'react-router-dom';
//
// const PostModal = ({ postId, onClose }) => {
//   const navigate = useNavigate();
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [comment, setComment] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//
//   useEffect(() => {
//     let cancelled = false;
//     const fetchPost = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const token = localStorage.getItem('accessToken');
//         if (!token) {
//           throw new Error('Authentication required');
//         }
//         const data = await postsAPI.getPostById(postId, token);
//         if (!cancelled) {
//           setPost(data);
//           setLoading(false);
//           console.log('Post loaded:', data);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           if (err.message === 'Authentication required') {
//             setError('Please log in to view this post');
//             setTimeout(() => {
//               navigate('/login');
//             }, 2000);
//           } else if (err.response?.status === 403) {
//             setError('You do not have permission to view this post');
//           } else {
//             setError('Failed to load post. Please try again later.');
//           }
//           setLoading(false);
//           console.error('Error loading post:', err);
//         }
//       }
//     };
//     if (postId) fetchPost();
//     return () => { cancelled = true; };
//   }, [postId, navigate]);
//
//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => { document.body.style.overflow = ''; };
//   }, []);
//
//   const handleLike = async () => {
//     if (!post) return;
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         navigate('/login');
//         return;
//       }
//       const updatedPost = await postsAPI.likePost(post.id, token);
//       setPost(updatedPost);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         navigate('/login');
//       } else {
//         console.error('Error liking post:', err);
//       }
//     }
//   };
//
//   const handleFavorite = async () => {
//     if (!post) return;
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         navigate('/login');
//         return;
//       }
//       const updatedPost = await postsAPI.favoritePost(post.id, token);
//       setPost(updatedPost);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         navigate('/login');
//       } else {
//         console.error('Error favoriting post:', err);
//       }
//     }
//   };
//
//   const handleCommentSubmit = async (e) => {
//     e.preventDefault();
//     if (!comment.trim() || !post) return;
//
//     const token = localStorage.getItem('accessToken');
//     if (!token) {
//       navigate('/login');
//       return;
//     }
//
//     setIsSubmitting(true);
//     try {
//       const updatedPost = await postsAPI.addComment(post.id, comment.trim(), token);
//       setPost(updatedPost);
//       setComment('');
//     } catch (err) {
//       if (err.response?.status === 401) {
//         navigate('/login');
//       } else {
//         console.error('Error adding comment:', err);
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//
//   const handleKeyDown = (e) => {
//     if (e.key === 'Escape') {
//       onClose();
//     }
//   };
//
//   if (!postId) return null;
//
//   return (
//     <div
//       className="modal-overlay"
//       onClick={onClose}
//       tabIndex={-1}
//       onKeyDown={handleKeyDown}
//     >
//       <div
//         className="modal-content"
//         onClick={e => e.stopPropagation()}
//         tabIndex={0}
//         aria-modal="true"
//         role="dialog"
//       >
//         <button
//           className="modal-close"
//           onClick={onClose}
//           aria-label="Закрыть"
//         >
//           ×
//         </button>
//         {loading ? (
//           <div className="modal-loading">Загрузка...</div>
//         ) : error ? (
//           <div className="modal-error">
//             {error}
//             {error.includes('log in') && (
//               <div className="modal-error-redirect">
//                 Redirecting to login page...
//               </div>
//             )}
//           </div>
//         ) : post ? (
//           <div className="modal-post">
//             <img src={post.characterImageUrl} alt={post.characterName} className="modal-image" />
//             <div className="modal-info">
//               <div className="modal-title">{post.characterName}</div>
//               <div className="modal-anime">{post.anime}</div>
//               <div className="modal-description">{post.description}</div>
//               <div className="modal-meta">
//                 <div className="modal-author">
//                   <img
//                     src={post.author?.profileImageUrl || 'https://via.placeholder.com/32'}
//                     alt="Author avatar"
//                     className="modal-author-avatar"
//                   />
//                   <span>@{post.author?.username || 'Unknown'}</span>
//                 </div>
//                 <div className="modal-stats">
//                   <button
//                     className={`modal-like ${post.liked ? 'liked' : ''}`}
//                     onClick={handleLike}
//                     aria-label={post.liked ? 'Убрать лайк' : 'Поставить лайк'}
//                   >
//                     ❤️ {post.likeCount}
//                   </button>
//                   <button
//                     className={`modal-fav ${post.favorited ? 'favorited' : ''}`}
//                     onClick={handleFavorite}
//                     aria-label={post.favorited ? 'Убрать из избранного' : 'Добавить в избранное'}
//                   >
//                     ☆ {post.favorited ? 'В избранном' : 'В избранное'}
//                   </button>
//                 </div>
//               </div>
//               <div className="modal-comments">
//                 <div className="modal-comments-title">Комментарии ({post.commentCount})</div>
//                 <form className="modal-comment-form" onSubmit={handleCommentSubmit}>
//                   <input
//                     type="text"
//                     placeholder="Оставьте комментарий..."
//                     className="modal-comment-input"
//                     value={comment}
//                     onChange={(e) => setComment(e.target.value)}
//                     disabled={isSubmitting}
//                   />
//                   <button
//                     type="submit"
//                     className="modal-comment-btn"
//                     disabled={isSubmitting || !comment.trim()}
//                   >
//                     {isSubmitting ? 'Отправка...' : 'Отправить'}
//                   </button>
//                 </form>
//                 <div className="modal-comments-list">
//                   {post.comments?.map((comment) => (
//                     <div key={comment.id} className="modal-comment">
//                       <div className="modal-comment-author">
//                         <img
//                           src={comment.author?.profileImageUrl || 'https://via.placeholder.com/24'}
//                           alt="Comment author avatar"
//                           className="modal-comment-avatar"
//                         />
//                         <span>@{comment.author?.username || 'Unknown'}</span>
//                       </div>
//                       <div className="modal-comment-content">{comment.content}</div>
//                       <div className="modal-comment-date">
//                         {new Date(comment.createdAt).toLocaleDateString()}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : null}
//       </div>
//       <style>{`
//         .modal-overlay {
//           position: fixed; inset: 0; background: rgba(10,16,32,0.72); z-index: 9999;
//           display: flex; align-items: center; justify-content: center;
//         }
//         .modal-content {
//           background: #181a23; color: #d0e4ff; border-radius: 18px; box-shadow: 0 8px 48px #000a;
//           max-width: 540px; width: 100%; padding: 32px 24px 24px 24px; position: relative;
//           outline: none; min-height: 420px;
//         }
//         .modal-close {
//           position: absolute; top: 18px; right: 18px; background: none; border: none; color: #6effff;
//           font-size: 2.2em; cursor: pointer; z-index: 2; transition: color 0.2s;
//         }
//         .modal-close:hover { color: #ff5a9e; }
//         .modal-loading, .modal-error {
//           text-align: center;
//           font-size: 1.2em;
//           margin: 60px 0;
//           color: #ff5a9e;
//         }
//         .modal-error-redirect {
//           margin-top: 12px;
//           font-size: 0.9em;
//           color: #90e0ef;
//         }
//         .modal-post { display: flex; flex-direction: column; align-items: center; gap: 18px; }
//         .modal-image { width: 100%; max-width: 320px; border-radius: 14px; box-shadow: 0 2px 24px #00b4d866; }
//         .modal-info { width: 100%; display: flex; flex-direction: column; gap: 10px; }
//         .modal-title { font-size: 2em; font-family: 'Orbitron', Arial, sans-serif; color: #6effff; text-shadow: 0 0 8px #00b4d8; }
//         .modal-anime { font-size: 1.1em; color: #90e0ef; }
//         .modal-description { font-size: 1em; color: #d3e0f4; margin-bottom: 8px; }
//         .modal-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
//         .modal-author { display: flex; align-items: center; gap: 8px; }
//         .modal-author-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
//         .modal-stats { display: flex; gap: 12px; }
//         .modal-like, .modal-fav {
//           background: none;
//           border: none;
//           color: #6effff;
//           font-size: 1.1em;
//           cursor: pointer;
//           transition: color 0.2s;
//           padding: 4px 8px;
//           border-radius: 4px;
//         }
//         .modal-like:hover, .modal-fav:hover { color: #ff5a9e; }
//         .modal-like.liked { color: #ff5a9e; }
//         .modal-fav.favorited { color: #ff5a9e; }
//         .modal-comments { margin-top: 18px; }
//         .modal-comments-title { font-size: 1.1em; margin-bottom: 8px; color: #90e0ef; }
//         .modal-comment-form { display: flex; gap: 8px; margin-bottom: 10px; }
//         .modal-comment-input {
//           flex: 1;
//           padding: 8px 12px;
//           border-radius: 8px;
//           border: 1px solid #233;
//           background: #23263a;
//           color: #d0e4ff;
//         }
//         .modal-comment-input:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//         }
//         .modal-comment-btn {
//           background: #6effff;
//           color: #181a23;
//           border: none;
//           border-radius: 8px;
//           padding: 8px 18px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: background 0.2s;
//         }
//         .modal-comment-btn:hover:not(:disabled) { background: #00b4d8; color: #fff; }
//         .modal-comment-btn:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//         }
//         .modal-comments-list {
//           display: flex;
//           flex-direction: column;
//           gap: 12px;
//           margin-top: 16px;
//         }
//         .modal-comment {
//           background: rgba(35, 38, 58, 0.5);
//           border-radius: 8px;
//           padding: 12px;
//         }
//         .modal-comment-author {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 8px;
//         }
//         .modal-comment-avatar {
//           width: 24px;
//           height: 24px;
//           border-radius: 50%;
//           object-fit: cover;
//         }
//         .modal-comment-content {
//           color: #d0e4ff;
//           margin-bottom: 4px;
//         }
//         .modal-comment-date {
//           font-size: 0.8em;
//           color: #90e0ef;
//         }
//       `}</style>
//     </div>
//   );
// };
//
// export default PostModal;
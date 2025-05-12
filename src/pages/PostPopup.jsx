// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { postsAPI } from '../services/api';
// import PostPage from './PostPage';
//
// const PostPopup = () => {
//   const { id } = useParams();
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     let cancelled = false;
//     const fetchPost = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('accessToken');
//         const data = await postsAPI.getPostById(id, token);
//         if (!cancelled) {
//           setPost(data);
//           setLoading(false);
//         }
//       } catch {
//         setLoading(false);
//       }
//     };
//     fetchPost();
//     return () => { cancelled = true; };
//   }, [id]);
//
//   if (loading) return <div style={{textAlign: 'center', marginTop: 100}}>Загрузка...</div>;
//   if (!post) return <div style={{textAlign: 'center', marginTop: 100}}>Пост не найден</div>;
//
//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: '#181a23',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center'
//     }}>
//       <div style={{
//         width: 700,
//         maxWidth: '95vw',
//         minHeight: 400,
//         background: '#23263a',
//         borderRadius: 18,
//         boxShadow: '0 8px 48px #000a',
//         color: '#d0e4ff',
//         display: 'flex',
//         flexDirection: 'row',
//         overflow: 'hidden'
//       }}>
//         <div style={{
//           flex: 1,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           background: 'rgba(0,0,0,0.2)'
//         }}>
//           <img
//             src={post.characterImageUrl}
//             alt={post.characterName}
//             style={{maxWidth: '90%', maxHeight: '90%', borderRadius: 14}}
//           />
//         </div>
//         <div style={{
//           flex: 1,
//           padding: 32,
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 16
//         }}>
//           <h2 style={{color: '#6effff', margin: 0}}>{post.characterName}</h2>
//           <div style={{color: '#90e0ef'}}>{post.anime}</div>
//           <div style={{margin: '12px 0'}}>{post.description}</div>
//           <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
//             <img src={post.author?.profileImageUrl || 'https://via.placeholder.com/32'} alt="Author" style={{width: 32, borderRadius: '50%'}} />
//             <span>@{post.author?.username || 'Unknown'}</span>
//           </div>
//           <div style={{marginTop: 12}}>❤️ {post.likeCount} | 💬 {post.commentCount}</div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default PostPopup;
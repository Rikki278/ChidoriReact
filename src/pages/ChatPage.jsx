import React, { useEffect, useRef, useState } from 'react';

const USER_API = '/api/users';
const MESSAGE_API = '/api/messages';
const WS_URL = 'ws://localhost:8080/ws/chat'; // Измени порт если другой

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const wsRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [showUserList, setShowUserList] = useState(true);
  const [chatPartners, setChatPartners] = useState([]);

  // Получить текущего пользователя
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    fetch(`${USER_API}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  // Получить список собеседников (recent chats)
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem('accessToken');
    fetch(`${MESSAGE_API}/for/${currentUser.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then(messages => {
        const partners = {};
        messages.forEach(msg => {
          const partner = msg.sender.id === currentUser.id ? msg.receiver : msg.sender;
          if (partner && partner.id !== currentUser.id) {
            partners[partner.id] = partner;
          }
        });
        setChatPartners(Object.values(partners));
      })
      .catch(() => setChatPartners([]));
  }, [currentUser]);

  // Поиск пользователей
  useEffect(() => {
    if (!search) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    const token = localStorage.getItem('accessToken');
    fetch(`${USER_API}/search/username/${encodeURIComponent(search)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setUsers(data.filter(u => currentUser ? u.id !== currentUser.id : true)))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [search, currentUser]);

  // Получить сообщения при выборе пользователя
  useEffect(() => {
    if (!selectedUser || !currentUser) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    const token = localStorage.getItem('accessToken');
    fetch(`${MESSAGE_API}/between/${currentUser.id}/${selectedUser.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then(history => {
        setMessages(history);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedUser, currentUser]);

  // WebSocket для новых сообщений (только добавляет новые, не затирает историю)
  useEffect(() => {
    if (!currentUser) return;
    wsRef.current = new window.WebSocket(`${WS_URL}?userId=${currentUser.id}`);
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      // Добавлять только если это сообщение для текущего открытого чата и оно не дублирует последнее
      setMessages(prev => {
        // Если это сообщение уже есть (например, оно пришло по WebSocket и уже есть в истории) — не добавлять
        if (prev.some(m => m.id === msg.id)) return prev;
        if (
          selectedUser &&
          ((msg.sender.id === currentUser.id && msg.receiver.id === selectedUser.id) ||
            (msg.sender.id === selectedUser.id && msg.receiver.id === currentUser.id))
        ) {
          return [...prev, msg];
        }
        return prev;
      });
    };
    wsRef.current.onopen = () => console.log('WebSocket opened');
    wsRef.current.onerror = (e) => console.error('WebSocket error', e);
    wsRef.current.onclose = () => console.log('WebSocket closed');
    return () => wsRef.current && wsRef.current.close();
  }, [currentUser, selectedUser]);

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Превью изображения
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowUserList(false);
  };

  const handleBackToUsers = () => {
    setShowUserList(true);
    setSelectedUser(null);
    setMessages([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!currentUser || !selectedUser) return; // Защита
    if (!messageText.trim() && !imageFile) return;

    let imageBase64 = null;
    if (imageFile) {
      imageBase64 = await toBase64(imageFile);
    }
    const payload = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      type: imageBase64 ? 'IMAGE' : 'TEXT',
      content: messageText,
      imageBase64: imageBase64 || null,
    };

    // Отправка через WebSocket если соединение открыто
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(payload));
      setMessageText('');
      setImageFile(null);
    } else {
      // Fallback на REST
      const token = localStorage.getItem('accessToken');
      fetch(`${MESSAGE_API}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(msg => {
          setMessages(prev => [...prev, msg]);
          setMessageText('');
          setImageFile(null);
        });
    }
  };

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 90px)', background: 'linear-gradient(120deg, #181a23, #23263a, #23263a, #181a23, #23263a)', color: '#d0e4ff', fontFamily: 'Orbitron, Arial, sans-serif' }}>
      {/* Левая панель: поиск и список пользователей */}
      {showUserList && (
        <div style={{ width: 340, borderRight: '1.5px solid #23263a', padding: 24, background: 'rgba(20,22,30,0.97)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: '#6effff', fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Chat</h2>
          {/* Recent chats */}
          {chatPartners.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: '#90e0ef', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Recent chats</div>
              {chatPartners.map(user => (
                <div
                  key={user.id}
                  style={{
                    padding: 10,
                    cursor: 'pointer',
                    borderRadius: 8,
                    background: selectedUser?.id === user.id ? '#23263a' : 'transparent',
                    marginBottom: 4,
                    color: '#d0e4ff',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: selectedUser?.id === user.id ? '1.5px solid #6effff' : '1.5px solid transparent',
                    transition: 'background 0.2s, border 0.2s',
                  }}
                  onClick={() => handleSelectUser(user)}
                  tabIndex={0}
                  aria-label={`Open chat with ${user.username}`}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelectUser(user)}
                >
                  <img src={user.profileImageUrl} alt={user.username} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #6effff', background: '#23263a' }} />
                  <span style={{ color: '#6effff', fontWeight: 700 }}>@{user.username}</span>
                  {user.fullName && <span style={{ color: '#90e0ef', fontSize: 13 }}>{user.fullName}</span>}
                </div>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Search user by username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #6effff', background: 'rgba(20,22,30,0.92)', color: '#d0e4ff', marginBottom: 18, fontSize: 16 }}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingUsers ? (
              <div style={{ color: '#6effff', textAlign: 'center', marginTop: 30 }}>Loading...</div>
            ) : search ? (
              users.length === 0 ? (
                <div style={{ color: '#90e0ef', fontSize: 16, textAlign: 'center', marginTop: 30 }}>No users found.</div>
              ) : (
                users.map(user => (
                  <div
                    key={user.id}
                    style={{
                      padding: 12,
                      cursor: 'pointer',
                      borderRadius: 8,
                      background: selectedUser?.id === user.id ? '#23263a' : 'transparent',
                      marginBottom: 6,
                      color: '#d0e4ff',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: selectedUser?.id === user.id ? '1.5px solid #6effff' : '1.5px solid transparent',
                      transition: 'background 0.2s, border 0.2s',
                    }}
                    onClick={() => handleSelectUser(user)}
                    tabIndex={0}
                    aria-label={`Start chat with ${user.username}`}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelectUser(user)}
                  >
                    <img src={user.profileImageUrl} alt={user.username} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #6effff', background: '#23263a' }} />
                    <span style={{ color: '#6effff', fontWeight: 700 }}>@{user.username}</span>
                    {user.fullName && <span style={{ color: '#90e0ef', fontSize: 14 }}>{user.fullName}</span>}
                  </div>
                ))
              )
            ) : (
              chatPartners.length === 0 ? (
                <div style={{ color: '#90e0ef', fontSize: 16, textAlign: 'center', marginTop: 30 }}>No chats yet.</div>
              ) : (
                chatPartners.map(user => (
                  <div
                    key={user.id}
                    style={{
                      padding: 12,
                      cursor: 'pointer',
                      borderRadius: 8,
                      background: selectedUser?.id === user.id ? '#23263a' : 'transparent',
                      marginBottom: 6,
                      color: '#d0e4ff',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: selectedUser?.id === user.id ? '1.5px solid #6effff' : '1.5px solid transparent',
                      transition: 'background 0.2s, border 0.2s',
                    }}
                    onClick={() => handleSelectUser(user)}
                    tabIndex={0}
                    aria-label={`Open chat with ${user.username}`}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelectUser(user)}
                  >
                    <img src={user.profileImageUrl} alt={user.username} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #6effff', background: '#23263a' }} />
                    <span style={{ color: '#6effff', fontWeight: 700 }}>@{user.username}</span>
                    {user.fullName && <span style={{ color: '#90e0ef', fontSize: 14 }}>{user.fullName}</span>}
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}
      {/* Правая панель: чат */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, background: 'transparent' }}>
        {/* Хедер чата */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1.5px solid #23263a', background: 'rgba(20,22,30,0.93)' }}>
          {selectedUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={handleBackToUsers} style={{ background: 'none', border: 'none', color: '#6effff', fontSize: 22, cursor: 'pointer', marginRight: 10, padding: 0 }} aria-label="Back to user list">←</button>
              <img src={selectedUser.profileImageUrl} alt={selectedUser.username} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #6effff', background: '#23263a' }} />
              <span style={{ color: '#6effff', fontWeight: 700, fontSize: 20 }}>@{selectedUser.username}</span>
              {selectedUser.fullName && <span style={{ color: '#90e0ef', fontSize: 15 }}>{selectedUser.fullName}</span>}
            </div>
          ) : (
            <span style={{ color: '#90e0ef', fontSize: 17 }}>Select a user to start chat</span>
          )}
        </div>
        {/* Сообщения */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32, background: 'rgba(20,22,30,0.85)', minHeight: 0 }}>
          {loadingMessages ? (
            <div style={{ color: '#6effff', textAlign: 'center', marginTop: 30 }}>Loading messages...</div>
          ) : selectedUser && messages.length === 0 ? (
            <div style={{ color: '#90e0ef', textAlign: 'center', marginTop: 30 }}>No messages yet.</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender.id === currentUser?.id ? 'flex-end' : 'flex-start',
                  marginBottom: 18,
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  borderRadius: 16,
                  padding: '12px 18px',
                  background: msg.sender.id === currentUser?.id ? 'linear-gradient(90deg, #6effff 60%, #00b4d8 100%)' : 'rgba(35,38,58,0.95)',
                  color: msg.sender.id === currentUser?.id ? '#181a23' : '#d0e4ff',
                  boxShadow: '0 2px 12px #00b4d822',
                  wordBreak: 'break-word',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  {msg.imageBase64 && (
                    <img
                      src={`data:image/*;base64,${msg.imageBase64}`}
                      alt="attachment"
                      style={{ maxWidth: 220, maxHeight: 180, borderRadius: 10, marginBottom: 6, border: '1.5px solid #6effff' }}
                    />
                  )}
                  {msg.content && (
                    <span style={{ whiteSpace: 'pre-line', fontSize: 16 }}>{msg.content}</span>
                  )}
                  <span style={{ fontSize: 12, color: msg.sender.id === currentUser?.id ? '#00b4d8' : '#90e0ef', alignSelf: 'flex-end', marginTop: 2 }}>{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>
        {/* Ввод сообщения */}
        {selectedUser && (
          <form style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 24, borderTop: '1.5px solid #23263a', background: 'rgba(20,22,30,0.93)' }} onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              style={{ flex: 1, padding: 12, borderRadius: 10, border: '1.5px solid #6effff', background: 'rgba(20,22,30,0.92)', color: '#d0e4ff', fontSize: 16 }}
              aria-label="Type your message"
              autoComplete="off"
            />
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#23263a', border: '1.5px solid #6effff', transition: 'background 0.2s', marginRight: 2 }}
              tabIndex={0}
              aria-label="Attach image"
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && e.target.click()}
              onMouseOver={e => e.currentTarget.style.background = '#1a1c28'}
              onMouseOut={e => e.currentTarget.style.background = '#23263a'}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => setImageFile(e.target.files[0] || null)}
                aria-label="Attach image"
              />
              <svg width="22" height="22" fill="none" stroke="#6effff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.49"/></svg>
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #6effff' }} />
            )}
            <button
              type="submit"
              style={{ background: '#6effff', color: '#181a23', border: 'none', borderRadius: 10, width: 90, height: 40, fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s', marginLeft: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={!messageText.trim() && !imageFile}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default ChatPage; 
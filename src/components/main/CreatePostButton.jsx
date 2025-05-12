import React from 'react';

const CreatePostButton = ({ onOpen }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onOpen();
    }
  };

  return (
    <button
      type="button"
      className="create-post-fab"
      aria-label="Create new post"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#1976d2',
        color: '#fff',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontSize: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      +
    </button>
  );
};

export default CreatePostButton; 
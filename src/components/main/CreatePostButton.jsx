import React from 'react';
import './CreatePostButton.css';

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
    >
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="18" fill="none" />
        <rect x="16" y="8" width="4" height="20" rx="2" fill="#6effff" />
        <rect x="8" y="16" width="20" height="4" rx="2" fill="#6effff" />
      </svg>
    </button>
  );
};

export default CreatePostButton; 
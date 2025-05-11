import React, { useRef, useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';
import './CharacterCard.css';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";

const CharacterCard = ({ character }) => {
  const imgRef = useRef(null);
  const [dominantColor, setDominantColor] = useState('#00B4D8');
  const [imgSrc, setImgSrc] = useState(character.characterImageUrl);

  useEffect(() => {
    setImgSrc(character.characterImageUrl);
  }, [character.characterImageUrl]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      extractColor();
    }
    // eslint-disable-next-line
  }, [imgSrc]);

  const extractColor = () => {
    const img = imgRef.current;
    if (img) {
      const fac = new FastAverageColor();
      fac.getColorAsync(img)
        .then(color => {
          setDominantColor(color.hex);
        })
        .catch(() => {});
    }
  };

  const handleImageError = () => {
    if (imgSrc !== DEFAULT_IMAGE) {
      setImgSrc(DEFAULT_IMAGE);
      setDominantColor('#00B4D8');
    }
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }
  };

  return (
    <div
      className="card"
      tabIndex={0}
      aria-label={`Карточка персонажа ${character.characterName}`}
      onClick={() => {}}
      onKeyDown={handleCardKeyDown}
      style={{
        '--card-glow': dominantColor,
      }}
    >
      <div className="image-container">
        <img
          ref={imgRef}
          src={imgSrc}
          alt={character.characterName}
          className="card-image"
          crossOrigin="anonymous"
          onLoad={extractColor}
          onError={handleImageError}
        />
      </div>
      <div className="card-content">
        <div className="character-name" style={{ color: dominantColor }}>{character.characterName}</div>
        <div className="anime">{character.anime}</div>
        <div className="description">{character.description}</div>
        <div className="meta">
          <div className="author-info">
            <img
              src={character.author?.profileImageUrl || 'https://via.placeholder.com/32'}
              alt="Author avatar"
              className="author-avatar"
            />
            <span>@{character.author?.username || 'Unknown'}</span>
          </div>
          <div className="stats">
            <span className="stat" aria-label="Лайки">
              <svg width="20" height="20" fill="none" stroke="#ff5a9e" strokeWidth="2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12 4.5 12 4.5C12 4.5 12.96 3 14.5 3C17.5 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z" />
              </svg>
              {character.likeCount}
            </span>
            <span className="stat" aria-label="Комментарии">
              <svg width="20" height="20" fill="none" stroke="#90e0ef" strokeWidth="2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {character.commentCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard; 
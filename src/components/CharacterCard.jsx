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
        '--card-glow': dominantColor
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
            <span aria-label="Лайки">❤️ {character.likeCount}</span>
            <span aria-label="Комментарии">💬 {character.commentCount}</span>
            <span
              aria-label="В избранном"
              className={character.isFavorited ? 'favorited' : ''}
            >★</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard; 
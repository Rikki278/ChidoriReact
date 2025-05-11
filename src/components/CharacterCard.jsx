import React from 'react';
import './CharacterCard.css';

const CharacterCard = ({ character }) => {
  console.log('Character data:', character);
  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Здесь можно добавить переход или действие по клику
      e.preventDefault();
    }
  };

  return (
    <div
      className="card"
      tabIndex={0}
      aria-label={`Карточка персонажа ${character.characterName}`}
      onClick={() => { /* Здесь можно добавить переход или действие по клику */ }}
      onKeyDown={handleCardKeyDown}
    >
      <div className="image-container">
        <img
          src={character.characterImageUrl}
          alt={character.characterName}
          className="card-image"
        />
      </div>
      <div className="card-content">
        <div className="character-name">{character.characterName}</div>
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
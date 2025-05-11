import React from 'react';
import './CharacterCard.css';

const CharacterCard = ({ character }) => {
  return (
    <div className="character-card">
      <img src={character.characterImageUrl} alt={character.characterName} className="character-image" />
      <div className="character-info">
        <h3 className="character-title">{character.characterName}</h3>
        <div className="character-anime">{character.anime}</div>
        <div className="character-genres">
          {character.animeGenre?.map((genre, index) => (
            <span key={index} className="genre-tag">{genre}</span>
          ))}
        </div>
        <div className="character-description">
          {character.description}
        </div>
        <div className="character-stats">
          <span className="stat">
            <i className="fas fa-heart"></i> {character.likeCount}
          </span>
          <span className="stat">
            <i className="fas fa-comment"></i> {character.commentCount}
          </span>
          <span className="stat">
            <i className={`fas fa-star ${character.isFavorited ? 'favorited' : ''}`}></i>
          </span>
        </div>
        <div className="character-author">
          by {character.author?.username || 'Unknown'}
        </div>
        <div className="character-date">
          Posted {new Date(character.createdAt).toLocaleDateString()}
        </div>
        <a href="#" className="character-link">View Post</a>
      </div>
    </div>
  );
};

export default CharacterCard; 
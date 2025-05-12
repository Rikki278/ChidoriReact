import React, { useState, useRef } from 'react';
import Tilt from 'react-parallax-tilt';
import { FastAverageColor } from 'fast-average-color';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";

const ProfilePostCard = ({ post, onClick }) => {
  const imgRef = useRef(null);
  const [dominantColor, setDominantColor] = useState('#00B4D8');
  const [imgSrc, setImgSrc] = useState(post.characterImageUrl);

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

  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.10}
      glareColor={dominantColor}
      glarePosition="all"
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      scale={0.98}
      tiltReverse={true}
      transitionSpeed={1200}
      style={{ borderRadius: 16, marginBottom: 20, boxShadow: `0 0 36px 0 ${dominantColor}, 0 0 12px 0 ${dominantColor}` }}
    >
      <div
        className="user-profile-post-card"
        onClick={onClick}
        tabIndex={0}
        aria-label={`Open post ${post.characterName}`}
        style={{ '--card-glow': dominantColor }}
      >
        <img
          ref={imgRef}
          src={imgSrc}
          alt={post.characterName}
          className="user-profile-post-img"
          crossOrigin="anonymous"
          onLoad={extractColor}
          onError={handleImageError}
        />
      </div>
    </Tilt>
  );
};

export default ProfilePostCard; 
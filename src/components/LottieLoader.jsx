import React from 'react';
import Lottie from 'lottie-react';
import loaderAnimation from '../assets/animation/Animation - 1746823194589.json';

const LottieLoader = () => (
  <div
    role="status"
    aria-label="Loading"
    tabIndex={0}
    style={{
      width: 120,
      height: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      filter: 'drop-shadow(0 0 16px #6effff) drop-shadow(0 0 32px #6effff)',
      background: 'transparent',
      borderRadius: 24,
      margin: '0 auto',
    }}
  >
    <Lottie
      animationData={loaderAnimation}
      loop
      autoplay
      style={{ width: '100%', height: '100%' }}
      aria-label="Loading animation"
    />
  </div>
);

export default LottieLoader; 
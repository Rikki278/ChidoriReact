import React, { useRef, useEffect } from 'react';

const FIREFLY_COUNT = 32;
const COLORS = [
  'rgba(110,255,255,0.85)',
  'rgba(0,180,216,0.75)',
  'rgba(144,224,239,0.7)',
  'rgba(255,255,255,0.7)'
];

const random = (min, max) => Math.random() * (max - min) + min;

const ChidoriBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const firefliesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Инициализация fireflies
    firefliesRef.current = Array.from({ length: FIREFLY_COUNT }).map(() => ({
      x: random(0, width),
      y: random(0, height),
      r: random(2, 5),
      color: COLORS[Math.floor(random(0, COLORS.length))],
      speed: random(0.08, 0.22),
      angle: random(0, Math.PI * 2),
      pulse: random(0, Math.PI * 2),
      pulseSpeed: random(0.01, 0.025)
    }));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      firefliesRef.current.forEach(f => {
        // Движение по кругу + дрейф
        f.angle += f.speed * 0.01;
        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed * 0.7;
        // Пульсация радиуса
        f.pulse += f.pulseSpeed;
        const pr = f.r + Math.sin(f.pulse) * 1.2;
        // Зацикливание
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;
        if (f.y < -10) f.y = height + 10;
        if (f.y > height + 10) f.y = -10;
        // Glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x, f.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 24;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.restore();
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.33,
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      aria-hidden="true"
    />
  );
};

export default ChidoriBackground;
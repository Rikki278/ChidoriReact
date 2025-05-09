import { useEffect, useState } from 'react';

const RainEffect = () => {
  const [raindrops, setRaindrops] = useState([]);

  useEffect(() => {
    const createRaindrops = () => {
      const drops = [];
      for (let i = 0; i < 100; i++) {
        drops.push({
          id: i,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 1 + 2}s`,
          animationDelay: `${Math.random() * 2}s`,
        });
      }
      setRaindrops(drops);
    };

    createRaindrops();
  }, []);

  return (
    <div className="rain-container">
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="raindrop"
          style={{
            left: drop.left,
            animationDuration: drop.animationDuration,
            animationDelay: drop.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

export default RainEffect; 
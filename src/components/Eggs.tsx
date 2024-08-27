import React, { useState, useEffect } from 'react';
import { DigimonEgg } from '../shared/types';
import { getEggType, EggType } from '../data/eggTypes';
import './Eggs.css';

interface EggProps {
  egg: DigimonEgg;
}

const Egg: React.FC<EggProps> = ({ egg }) => {
  const [frame, setFrame] = useState(0);
  const [eggType, setEggType] = useState<EggType | undefined>(undefined);

  useEffect(() => {
    let direction = 1;
  
    const intervalId = setInterval(() => {
      setFrame((prevFrame) => {
        if (prevFrame === 2) {
          direction = -1;
        } else if (prevFrame === 0) {
          direction = 1;
        }
        return prevFrame + direction;
      });
    }, 500);
  
    setEggType(getEggType(egg.typeId));
  
    return () => clearInterval(intervalId);
  }, [egg.typeId]);

  const getBackgroundPosition = (eggId: number, frameIndex: number) => {
    const eggsPerRow = 6;
    const eggWidth = 96;
    const eggHeight = 32;

    const row = Math.floor(eggId / eggsPerRow);
    const col = eggId % eggsPerRow;

    const x = col * eggWidth + frameIndex * eggHeight;
    const y = row * eggHeight;

    return `-${x}px -${y}px`;
  };

  const spritePosition = {
    backgroundPosition: getBackgroundPosition(egg.typeId, frame),
    width: '32px',
    height: '32px',
    imageRendering: 'pixelated' as 'pixelated',
  };

  return (
    <div className="egg-container">
      <div style={spritePosition} className="egg-sprite" />
      <div className="egg-info">
        <div>{eggType?.name || 'Unknown Egg'}</div>
        <div>Hatch Time: {egg.hatchTime}</div>
      </div>
    </div>
  );
};

interface EggsProps {
  eggs: DigimonEgg[];
}

const Eggs: React.FC<EggsProps> = ({ eggs }) => {
  return (
    <div className="eggs-container">
      <h2>Your Eggs</h2>
      <div className="eggs-grid">
        {eggs.map((egg) => (
          <Egg key={egg.id} egg={egg} />
        ))}
      </div>
    </div>
  );
};

export default Eggs;
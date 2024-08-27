import React, { useState, useEffect } from 'react';
import './EggHatchingSequence.css';
import DigimonSprite from './DigimonSprite';

interface EggHatchingSequenceProps {
  eggType: number;
  newDigimonName: string;
  onComplete: () => void;
}

const EggHatchingSequence: React.FC<EggHatchingSequenceProps> = ({ eggType, newDigimonName, onComplete }) => {
  const [stage, setStage] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const stageTimings = [3000, 2000, 2000, 2000];
    
    const timer = setTimeout(() => {
      if (stage < 3) {
        setStage(stage + 1);
      } else {
        onComplete();
      }
    }, stageTimings[stage]);

    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  useEffect(() => {
    const frames = [0, 1, 0, 2];
    let frameIndex = 0;

    const intervalId = setInterval(() => {
      setFrame(frames[frameIndex]);
      frameIndex = (frameIndex + 1) % frames.length;
    }, 250);

    return () => clearInterval(intervalId);
  }, []);

  const getEggBackgroundPosition = (eggId: number, frameIndex: number) => {
    const eggsPerRow = 6;
    const eggWidth = 32;
    const eggHeight = 32;

    const row = Math.floor(eggId / eggsPerRow);
    const col = eggId % eggsPerRow;

    const x = (col * 3 + frameIndex) * eggWidth;
    const y = row * eggHeight;

    return `-${x}px -${y}px`;
  };

  return (
    <div className="ehs-container">
      <div className={`ehs-egg-container ehs-stage-${stage}`}>
        {stage < 2 && (
          <div 
            className={`ehs-egg-sprite ${stage === 1 ? 'ehs-shaking' : ''}`}
            style={{
              backgroundImage: `url(${require('../assets/images/digitama-sheet.png')})`,
              backgroundPosition: getEggBackgroundPosition(eggType, frame),
              backgroundRepeat: 'no-repeat',
              backgroundSize: '576px 256px',
              width: '32px',
              height: '32px',
              imageRendering: 'pixelated',
            }}
          />
        )}
        {stage >= 2 && (
          <DigimonSprite name={newDigimonName} scale={2} isAttacking={stage === 3} />
        )}
      </div>
      <div className={`ehs-hatching-effect ${stage >= 2 ? 'ehs-active' : ''}`} />
    </div>
  );
};

export default EggHatchingSequence;
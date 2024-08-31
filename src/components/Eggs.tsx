import React, { useState, useEffect } from 'react';
import { DigimonEgg } from '../shared/types';
import { getEggType, EggType, getRandomOutcome } from '../data/eggTypes';
import './Eggs.css';
import EggHatchingSequence from './EggHatchingSequence';
import { DigimonTemplate } from '../shared/types';

interface EggsProps {
  eggs: DigimonEgg[];
  onHatchEgg: (eggId: number, newDigimonTemplate: DigimonTemplate) => void;
  onUpdateEggs: (updatedEggs: DigimonEgg[]) => void;
  onClose: () => void;
}

const Eggs: React.FC<EggsProps> = ({ eggs, onHatchEgg, onUpdateEggs, onClose }) => {
  const [hatchingEgg, setHatchingEgg] = useState<DigimonEgg | null>(null);
  const [newDigimonTemplate, setNewDigimonTemplate] = useState<DigimonTemplate | null>(null);

  const handleHatch = (egg: DigimonEgg) => {
    const eggType = getEggType(egg.typeId);
    if (eggType) {
      const outcome = getRandomOutcome(eggType);
      if (outcome) {
        setHatchingEgg(egg);
        setNewDigimonTemplate(outcome);
      }
    }
  };

  const handleHatchingComplete = () => {
    if (hatchingEgg && newDigimonTemplate) {
      onHatchEgg(hatchingEgg.id, newDigimonTemplate);
      
      // Remove the hatched egg from the list
      const updatedEggs = eggs.filter(egg => egg.id !== hatchingEgg.id);
      onUpdateEggs(updatedEggs);

      setHatchingEgg(null);
      setNewDigimonTemplate(null);
    }
  };

  return (
    <div className="eggs-container">
      {hatchingEgg && newDigimonTemplate ? (
        <EggHatchingSequence
          eggType={hatchingEgg.typeId}
          newDigimonName={newDigimonTemplate.name}
          onComplete={handleHatchingComplete}
        />
      ) : (
        <>
          <h2>Digi-Egg Nursery</h2>
          <div className="eggs-grid">
            {eggs.map((egg) => (
              <Egg key={egg.id} egg={egg} onHatch={() => handleHatch(egg)} />
            ))}
            {eggs.length === 0 && (
              <div className="no-eggs-message">
                <p>No eggs in the nursery yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

interface EggProps {
  egg: DigimonEgg;
  onHatch: () => void;
}

const Egg: React.FC<EggProps> = ({ egg, onHatch }) => {
  const [frame, setFrame] = useState(0);
  const [eggType, setEggType] = useState<EggType | undefined>(undefined);

  useEffect(() => {
    const frames = [0, 1, 0, 2];
    let frameIndex = 0;

    const intervalId = setInterval(() => {
      setFrame(frames[frameIndex]);
      frameIndex = (frameIndex + 1) % frames.length;
    }, 250);
  
    setEggType(getEggType(egg.typeId));
  
    return () => clearInterval(intervalId);
  }, [egg.typeId]);

  const getBackgroundPosition = (eggId: number, frameIndex: number) => {
    const eggsPerRow = 6;
    const eggWidth = 32;
    const eggHeight = 32;

    const row = Math.floor(eggId / eggsPerRow);
    const col = eggId % eggsPerRow;

    const x = (col * 3 + frameIndex) * eggWidth;
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
      <div className="egg-sprite" style={spritePosition} />
      <div className="egg-info">
        <div className="egg-name">{eggType?.name || 'Unknown Egg'}</div>
        <div className="egg-hatch-time">Hatch in: {egg.hatchTime} turns</div>
      </div>
      <button className="hatch-button" onClick={onHatch}>DEV FORCE HATCH</button>
    </div>
  );
};

export default Eggs;
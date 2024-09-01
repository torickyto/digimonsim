import React, { useState, useEffect } from 'react';
import { Digimon } from '../shared/types';
import './NodeEvent.css';
import { getEggType, EggType } from '../data/eggTypes';
import { gainExperience } from '../data/digimon';


const digitamaSpriteSheet = require('../assets/images/digitama-sheet.png');

type NodeType = 'start' | 'monster' | 'chest' | 'event' | 'boss' | 'empty' | 'rest';

interface NodeEventProps {
    type: NodeType;
    onClose: () => void;
    onUpdatePlayerTeam: (updatedTeam: Digimon[]) => void;
    playerTeam: Digimon[];
    onAddEgg: (eggType: string) => void;
    onUpdateBits: (amount: number) => void;
  }
  

const NodeEvent: React.FC<NodeEventProps> = ({ type, onClose, onUpdatePlayerTeam, playerTeam, onAddEgg, onUpdateBits }) => {
    const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
    const [loading, setLoading] = useState(true);
    const [frame, setFrame] = useState(0);
    const [eggType, setEggType] = useState<EggType | undefined>(undefined);
    const [bitsReward, setBitsReward] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (type === 'chest') {
      setBitsReward(Math.floor(Math.random() * 50) + 50);
    }
  }, [type]);

  const handleRestEvent = () => {
    if (selectedDigimon) {
      const updatedTeam = playerTeam.map(digimon => 
        digimon.id === selectedDigimon.id 
          ? { ...digimon, hp: Math.min(digimon.hp + 50, digimon.maxHp) }
          : digimon
      );
      onUpdatePlayerTeam(updatedTeam);
      alert(`${selectedDigimon.displayName} restored 50 HP!`);
      onClose();
    } else {
      alert("Please select a Digimon to rest.");
    }
  };

  useEffect(() => {
    if (type === 'event') {
      const frames = [0, 1, 0, 2];
      let frameIndex = 0;

      const intervalId = setInterval(() => {
        setFrame(frames[frameIndex]);
        frameIndex = (frameIndex + 1) % frames.length;
      }, 250);

      setEggType(getEggType(0));

      return () => clearInterval(intervalId);
    }
  }, [type]);

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

  const handleLabelForestEvent = () => {
    const spritePosition = {
      backgroundImage: `url(${digitamaSpriteSheet})`,
      backgroundPosition: getBackgroundPosition(0, frame),
      backgroundRepeat: 'no-repeat',
      backgroundSize: '576px 256px',
      width: '32px',
      height: '32px',
      imageRendering: 'pixelated' as 'pixelated',
      margin: '0 auto 20px',
      transform: 'scale(2)',
    };


    return (
      <div className="event-content">
        <h2>📡 Digital Anomaly Detected</h2>
        <div style={spritePosition} className="egg-sprite-container" />
        <p>You found a data cluster resembling a digimon egg.</p>
        <div className="event-options">
          <button onClick={() => {
            onAddEgg('Red');
            onClose();
          }}>
            Scan
            <small>Acquire 1 Red Egg</small>
          </button>
          <button onClick={() => {
              if (selectedDigimon) {
                const xpGain = 50;
                const updatedDigimon = gainExperience(selectedDigimon, xpGain);
                const updatedTeam = playerTeam.map(digimon => 
                  digimon.id === selectedDigimon.id ? updatedDigimon : digimon
                );
                onUpdatePlayerTeam(updatedTeam);
                alert(`${selectedDigimon.displayName} gained ${xpGain} XP!`);
                onClose();
              } else {
                alert("Please select a Digimon to absorb the data.");
              }
            }}>
            Absorb Data
            <small>Give 50 XP to a Digimon</small>
          </button>
        </div>
        <div className="digimon-selection">
          <p>Select a Digimon:</p>
          {playerTeam.map(digimon => (
            <button //TODO: SWITCH TO XP LOGIC
              key={digimon.id} 
              onClick={() => setSelectedDigimon(digimon)}
              className={selectedDigimon?.id === digimon.id ? 'selected' : ''}
            >
               {digimon.displayName} (Level: {digimon.level}, XP: {digimon.exp}/{digimon.expToNextLevel})
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleChestEvent = () => {
    return (
      <div className="event-content">
        <h2>💾 Data Cache Located</h2>
        <p>Your Digivice has decrypted a data cache. {bitsReward} bits extracted!</p>
        <button onClick={() => {
          onUpdateBits(bitsReward);
          onClose();
        }}>Download and Close</button>
      </div>
    );
  };

  const renderEventContent = () => {
    if (loading) {
      return <div className="loading">Scanning area...</div>;
    }

    switch (type) {
        case 'chest':
          return handleChestEvent();
      case 'rest':
        return (
          <div className="event-content">
            <h2>🔋 Energy Restoration Point</h2>
            <p>Select a Digimon to interface with the restoration matrix and recover 50 HP:</p>
            <div className="digimon-selection">
              {playerTeam.map(digimon => (
                <button 
                  key={digimon.id} 
                  onClick={() => setSelectedDigimon(digimon)}
                  className={selectedDigimon?.id === digimon.id ? 'selected' : ''}
                >
                  {digimon.displayName} (HP: {digimon.hp}/{digimon.maxHp})
                </button>
              ))}
            </div>
            <button onClick={handleRestEvent}>Initiate Restoration</button>
          </div>
        );
      case 'event':
        return handleLabelForestEvent();
      case 'start':
        return (
          <div className="event-content">
            <h2>🚀 Initialization Point</h2>
            <p>Systems online. Commencing digital world exploration sequence.</p>
            <button onClick={onClose}>Proceed</button>
          </div>
        );
      case 'monster':
      case 'boss':
        return (
          <div className="event-content">
            <h2>⚠️ Hostile Data Detected</h2>
            <p>Prepare for imminent data conflict. Battle subroutines loading...</p>
            <button onClick={onClose}>Engage</button>
          </div>
        );
      case 'empty':
        return (
          <div className="event-content">
            <h2>🌐 Void Sector</h2>
            <p>This digital sector contains no significant data patterns.</p>
            <button onClick={onClose}>Continue Scan</button>
          </div>
        );
      default:
        return (
          <div className="event-content">
            <h2>❓ Unknown Data Signature</h2>
            <p>An unclassified digital anomaly has been detected.</p>
            <button onClick={onClose}>Investigate</button>
          </div>
        );
    }
  };

  return (
    <div className="node-event-overlay">
      <div className="node-event-modal">
        {renderEventContent()}
      </div>
    </div>
  );
};

export default NodeEvent;
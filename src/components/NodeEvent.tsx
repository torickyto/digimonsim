import React, { useState, useEffect } from 'react';
import { Digimon } from '../shared/types';
import './NodeEvent.css';

type NodeType = 'start' | 'monster' | 'chest' | 'event' | 'boss' | 'empty' | 'rest';

interface NodeEventProps {
  type: NodeType;
  onClose: () => void;
  onUpdatePlayerTeam: (updatedTeam: Digimon[]) => void;
  playerTeam: Digimon[];
  onAddEgg: (eggType: string) => void;
}

const NodeEvent: React.FC<NodeEventProps> = ({ type, onClose, onUpdatePlayerTeam, playerTeam, onAddEgg }) => {
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const handleLabelForestEvent = () => (
    <div className="event-content">
      <h2>📡 Digital Anomaly Detected</h2>
      <p>Your Digivice scans the area and detects a mysterious data cluster resembling a Red Egg within the digital landscape of Label Forest.</p>
      <div className="event-options">
        <button onClick={() => {
          onAddEgg('Red');
          onClose();
        }}>
          🥚 Materialize Egg
          <small>Acquire 1 Red Egg Data</small>
        </button>
        <button onClick={() => {
          if (selectedDigimon) {
            const updatedTeam = playerTeam.map(digimon => 
              digimon.id === selectedDigimon.id 
                ? { ...digimon, hp: digimon.maxHp }
                : digimon
            );
            onUpdatePlayerTeam(updatedTeam);
            alert(`${selectedDigimon.displayName} was fully restored!`);
            onClose();
          } else {
            alert("Please select a Digimon to absorb the data.");
          }
        }}>
          💽 Absorb Data
          <small>Restore a Digimon to full capacity</small>
        </button>
      </div>
      <div className="digimon-selection">
        <p>Select a Digimon:</p>
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
    </div>
  );

  const renderEventContent = () => {
    if (loading) {
      return <div className="loading">Initializing digital interface...</div>;
    }

    switch (type) {
      case 'chest':
        return (
          <div className="event-content">
            <h2>💾 Data Cache Located</h2>
            <p>Your Digivice has decrypted a data cache. 50 RAM units extracted!</p>
            <button onClick={onClose}>Download and Close</button>
          </div>
        );
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
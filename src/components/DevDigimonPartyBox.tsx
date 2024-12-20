import React, { useState } from 'react';
import { Digimon } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import './DigimonPartyBox.css';
import { FaPlus } from 'react-icons/fa';
import { createUniqueDigimon } from '../data/digimon';

interface DevDigimonPartyBoxProps {
  party: Digimon[];
  allDigimon: Digimon[];
  onSwapDigimon: (partyIndex: number, newDigimon: Digimon | null) => void;
}

const DevDigimonPartyBox: React.FC<DevDigimonPartyBoxProps> = ({ party, allDigimon, onSwapDigimon }) => {
  const [selectedPartyIndex, setSelectedPartyIndex] = useState<number | null>(null);

  const handlePartySlotClick = (index: number) => {
    if (selectedPartyIndex === index && party[index]) {
      onSwapDigimon(index, null);
      setSelectedPartyIndex(null);
    } else {
      setSelectedPartyIndex(index);
    }
  };

  const handleBoxDigimonClick = (digimon: Digimon) => {
    if (selectedPartyIndex !== null) {
      // Create a new unique Digimon instance
      const newDigimon = createUniqueDigimon(digimon.name);
      onSwapDigimon(selectedPartyIndex, newDigimon);
      setSelectedPartyIndex(null);
    }
  };

  const renderDigimonCard = (digimon: Digimon | null, index: number, isPartySlot: boolean) => {
    const cardClass = isPartySlot ? 'party-slot' : 'box-slot';
    const selectedClass = isPartySlot && selectedPartyIndex === index ? 'selected' : '';
    const emptyClass = !digimon ? 'empty' : '';
    return (
      <div
        key={digimon ? digimon.id : `slot-${index}`}
        className={`pdigimon-card ${cardClass} ${selectedClass} ${emptyClass}`}
        onClick={() => isPartySlot ? handlePartySlotClick(index) : digimon && handleBoxDigimonClick(digimon)}
      >
        {digimon ? (
          <>
            <div className="plevel">Lv.{digimon.level}</div>
            <div className="psprite-container">
              <DigimonSprite name={digimon.name} scale={1.2} />
            </div>
            <div className="pname">{digimon.nickname || digimon.displayName}</div>
          </>
        ) : (
          <FaPlus className="add-icon" />
        )}
      </div>
    );
  };

  return (
    <div className="digimon-party-box">
      <h2>Digimon Party</h2>
      <div className="party-container">
        <div className="party-grid">
          {[0, 1, 2].map((index) => renderDigimonCard(party[index] || null, index, true))}
        </div>
      </div>
      <h3>ALL DIGIMON</h3>
      <div className="box-container">
        <div className="box-grid">
          {allDigimon.map((digimon, index) => {
            if (!digimon || !digimon.name) {
              console.error('Invalid Digimon:', digimon);
              return null;
            }
            return renderDigimonCard(digimon, index, false);
          })}
        </div>
      </div>
    </div>
  );
};

export default DevDigimonPartyBox;
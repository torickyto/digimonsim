import React, { useState } from 'react';
import { Digimon } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import './DigimonPartyBox.css';
import { FaPlus } from 'react-icons/fa';

interface DigimonPartyBoxProps {
  party: Digimon[];
  allDigimon: Digimon[];
  onSwapDigimon: (partyIndex: number, newDigimon: Digimon | null) => void;
}

const DigimonPartyBox: React.FC<DigimonPartyBoxProps> = ({ party, allDigimon, onSwapDigimon }) => {
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
      onSwapDigimon(selectedPartyIndex, digimon);
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
      <h3>STORAGE</h3>
      <div className="box-container">
        <div className="box-grid">
          {allDigimon
            .filter(digimon => !party.some(partyMember => partyMember && partyMember.id === digimon.id))
            .map((digimon, index) => renderDigimonCard(digimon, index, false))}
        </div>
      </div>
    </div>
  );
};

export default DigimonPartyBox;
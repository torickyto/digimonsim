import React from 'react';

interface RamDisplayProps {
  currentRam: number;
  maxRam: number;
  highlightedRam: number;
}

const RamDisplay: React.FC<RamDisplayProps> = ({ currentRam, maxRam, highlightedRam }) => {
  return (
    <div className="ram-crystals">
      {Array.from({ length: maxRam }, (_, i) => (
        <div
          key={i}
          className={`ram-crystal ${i < currentRam ? 'filled' : 'empty'} ${i < highlightedRam ? 'highlighted' : ''}`}
        ></div>
      ))}
    </div>
  );
};

export default RamDisplay;
import React from 'react';
import './WeaknessTriangle.css';

const WeaknessTriangle = () => {
  return (
    <div className="weakness-triangle">
      <div className="triangle-container">
        <div className="triangle">
          <div className="triangle-side data">DATA</div>
          <div className="triangle-side vaccine">VACCINE</div>
          <div className="triangle-side virus">VIRUS</div>
        </div>
        <div className="arrows">
          <div className="arrow data-to-vaccine">→</div>
          <div className="arrow vaccine-to-virus">→</div>
          <div className="arrow virus-to-data">→</div>
        </div>
      </div>
    </div>
  );
};

export default WeaknessTriangle;
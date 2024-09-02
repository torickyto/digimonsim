import React, { useState, useEffect } from 'react';
import './Shop.css';

const digitamaSpriteSheet = require('../assets/images/digitama-sheet.png');
const jijimonImage = require('../assets/backgrounds/jijimon.png');

interface ShopProps {
  bits: number;
  onPurchase: (itemName: string, cost: number) => void;
  onClose: () => void;
}

interface ShopItem {
  name: string;
  description: string;
  cost: number;
  eggTypeId?: number;
  icon: string;
}

const shopItems: ShopItem[] = [
  { name: "Golden Egg", description: "A rare and valuable Digi-Egg", cost: 1000000, eggTypeId: 28, icon: "🥚" },
  { name: "Bits Boost", description: "Instantly gain 10,000 bits", cost: 5000, icon: "💰" },
  { name: "Mystery Box", description: "Contains a random reward", cost: 25000, icon: "🎁" },
  { name: "EXP Booster", description: "Boost EXP gain for all Digimon", cost: 50000, icon: "⚡" },
];

const Shop: React.FC<ShopProps> = ({ bits, onPurchase, onClose }) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [showJijimon, setShowJijimon] = useState(false);
  const [eggFrame, setEggFrame] = useState(0);

  useEffect(() => {
    setTimeout(() => setShowJijimon(true), 300);
    setTimeout(() => setShowItems(true), 600);

    const eggFrames = [0, 1, 0, 2];
    let frameIndex = 0;
    const intervalId = setInterval(() => {
      setEggFrame(eggFrames[frameIndex]);
      frameIndex = (frameIndex + 1) % eggFrames.length;
    }, 250);

    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="jijimon_shop">
      <div className="jijimon_shop__background">
        <div className="jijimon_shop__pattern"></div>
      </div>
      <div className={`jijimon_shop__keeper-container ${showJijimon ? 'jijimon_shop__keeper-container--show' : ''}`}>
        <img src={jijimonImage} alt="Jijimon" className="jijimon_shop__keeper" />
      </div>
      <div className="jijimon_shop__content">
        <h1 className="jijimon_shop__title">Jijimon's Shop</h1>
        <div className="jijimon_shop__refresh">Shop refreshes in 5 days</div>
        <div className="jijimon_shop__bits">Bits: {bits.toLocaleString()}</div>
        <div className={`jijimon_shop__items ${showItems ? 'jijimon_shop__items--show' : ''}`}>
          {shopItems.map((item, index) => (
            <div 
              key={index} 
              className={`jijimon_shop__item ${selectedItem === item ? 'jijimon_shop__item--selected' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              {item.eggTypeId !== undefined ? (
                <div 
                  className="jijimon_shop__item-image jijimon_shop__item-image--egg" 
                  style={{
                    backgroundImage: `url(${digitamaSpriteSheet})`,
                    backgroundPosition: getBackgroundPosition(item.eggTypeId, eggFrame),
                  }}
                />
              ) : (
                <div className="jijimon_shop__item-icon">{item.icon}</div>
              )}
              <div className="jijimon_shop__item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="jijimon_shop__item-cost">{item.cost.toLocaleString()} bits</div>
              </div>
            </div>
          ))}
        </div>
        {selectedItem && (
          <div className="jijimon_shop__details">
            <h3>{selectedItem.name}</h3>
            <p>{selectedItem.description}</p>
            <div className="jijimon_shop__details-cost">{selectedItem.cost.toLocaleString()} Bits</div>
            <button 
              className="jijimon_shop__purchase"
              onClick={() => onPurchase(selectedItem.name, selectedItem.cost)} 
              disabled={bits < selectedItem.cost}
            >
              Purchase
            </button>
          </div>
        )}
      </div>
      <button className="jijimon_shop__close" onClick={onClose}>Exit Shop</button>
    </div>
  );
};

export default Shop;
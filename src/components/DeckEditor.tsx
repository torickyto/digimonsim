import React, { useState, useEffect } from 'react';
import { Digimon, Card } from '../shared/types';
import { CardCollection } from '../shared/cardCollection';
import FullCardDisplay from './FullCardDisplay';
import './DeckEditor.css';

interface DeckEditorProps {
  digimon: Digimon;
  onSave: (updatedDigimon: Digimon) => void;
  onClose: () => void;
}

const DeckEditor: React.FC<DeckEditorProps> = ({ digimon, onSave, onClose }) => {
  const [currentDeck, setCurrentDeck] = useState<Card[]>([]);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    setCurrentDeck(digimon.deck);
    setAvailableCards(Object.values(CardCollection));
  }, [digimon]);

  const addCardToDeck = (card: Card) => {
    if (currentDeck.length < 30) {
      setCurrentDeck([...currentDeck, card]);
      setAvailableCards(availableCards.filter(c => c.id !== card.id));
    }
  };

  const removeCardFromDeck = (card: Card) => {
    setCurrentDeck(currentDeck.filter(c => c.id !== card.id));
    setAvailableCards([...availableCards, card]);
  };

  const handleSave = () => {
    const updatedDigimon = { ...digimon, deck: currentDeck };
    onSave(updatedDigimon);
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  const renderCardItem = (card: Card, inDeck: boolean) => (
    <div
      key={card.id}
      className={`card-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
      onClick={() => handleCardSelect(card)}
    >
      <img src={`/assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`} alt={card.name} />
      <div className="card-overlay">
        <span className="card-name">{card.name}</span>
        <span className="card-cost">Cost: {card.cost}</span>
        <button onClick={(e) => {
          e.stopPropagation();
          inDeck ? removeCardFromDeck(card) : addCardToDeck(card);
        }}>
          {inDeck ? '-' : '+'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="deck-editor-overlay">
      <div className="deck-editor">
        <h2>{digimon.displayName}'s Deck</h2>
        <div className="deck-editor-content">
          <div className="card-collection">
            <h3>Available Cards</h3>
            <div className="card-grid">
              {availableCards.map((card) => renderCardItem(card, false))}
            </div>
          </div>
          <div className="current-deck">
            <h3>Current Deck ({currentDeck.length}/30)</h3>
            <div className="card-grid">
              {currentDeck.map((card) => renderCardItem(card, true))}
            </div>
          </div>
        </div>
        {selectedCard && (
          <div className="selected-card-display">
            <FullCardDisplay card={selectedCard} attacker={digimon} />
          </div>
        )}
        <div className="deck-editor-actions">
          <button onClick={handleSave}>Save Deck</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default DeckEditor;
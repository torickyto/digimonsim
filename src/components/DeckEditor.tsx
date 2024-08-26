import React, { useState, useEffect } from 'react';
import { Digimon, Card } from '../shared/types';
import { CardCollection } from '../shared/cardCollection';
import './DeckEditor.css';
import { FaPencilAlt, FaPlus, FaMinus } from 'react-icons/fa';

interface DeckEditorProps {
  digimon: Digimon;
  onSave: (updatedDigimon: Digimon) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onUpdateNickname: (id: string, nickname: string) => void;
}

const DeckEditor: React.FC<DeckEditorProps> = ({ digimon, onSave, onClose, onPrev, onNext, onUpdateNickname }) => {
  const [currentDeck, setCurrentDeck] = useState<Card[]>([]);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(digimon.nickname || digimon.displayName);

  useEffect(() => {
    setCurrentDeck([...digimon.deck]);
    setNewNickname(digimon.nickname || digimon.displayName);
    const allCards = Object.values(CardCollection);
    setAvailableCards(allCards.filter(card => !digimon.deck.some(c => c.id === card.id)));
  }, [digimon]);

  const addCardToDeck = (card: Card) => {
    if (currentDeck.length < 30) {
      setCurrentDeck(prev => [...prev, card]);
      setAvailableCards(prev => prev.filter(c => c.id !== card.id));
    }
  };

  const removeCardFromDeck = (card: Card) => {
    setCurrentDeck(prev => prev.filter(c => c.id !== card.id));
    setAvailableCards(prev => [...prev, card]);
  };

  const handleSave = () => {
    onSave({ ...digimon, deck: currentDeck });
  };

  const handleNicknameEdit = () => {
    setIsEditingNickname(true);
  };

  const handleNicknameSave = () => {
    onUpdateNickname(digimon.id, newNickname);
    setIsEditingNickname(false);
  };

  return (
    <div className="de-deck-editor">
      <div className="de-deck-editor-header">
        <button className="de-nav-button" onClick={onPrev}>&lt; Prev</button>
        {isEditingNickname ? (
          <input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            onBlur={handleNicknameSave}
            onKeyPress={(e) => e.key === 'Enter' && handleNicknameSave()}
            className="de-nickname-input"
          />
        ) : (
          <h2 className="de-digimon-name">
            {digimon.nickname || digimon.displayName}
            <FaPencilAlt className="de-edit-icon" onClick={handleNicknameEdit} />
          </h2>
        )}
        <button className="de-nav-button" onClick={onNext}>Next &gt;</button>
      </div>
      <div className="de-deck-editor-content">
        <div className="de-available-cards">
          <h3>Available Cards</h3>
          <div className="de-card-list">
            {availableCards.map((card) => (
              <div
                key={card.id}
                className={`de-card-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
                onClick={() => setSelectedCard(card)}
              >
                <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} className="card-image" />
                <span className="de-card-name">{card.name}</span>
                <FaPlus className="de-card-action" onClick={(e) => { e.stopPropagation(); addCardToDeck(card); }} />
              </div>
            ))}
          </div>
        </div>
        <div className="de-card-preview">
          {selectedCard && (
            <div className="de-selected-card">
              <img src={require(`../assets/cards/${selectedCard.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={selectedCard.name} className="card-image" />
              
              <h4>{selectedCard.name}</h4>
              <p>{selectedCard.description}</p>
              <div className="de-card-details">
                <span>Type: {selectedCard.type}</span>
                <span>Cost: {selectedCard.cost}</span>
                <span>Digimon Type: {selectedCard.digimonType}</span>
              </div>
            </div>
          )}
        </div>
        <div className="de-current-deck">
          <h3>Current Deck ({currentDeck.length}/30)</h3>
          <div className="de-card-list">
            {currentDeck.map((card) => (
              <div
                key={card.id}
                className={`de-card-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
                onClick={() => setSelectedCard(card)}
              >
                <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} className="card-image" />
                <span className="de-card-name">{card.name}</span>
                <FaMinus className="de-card-action" onClick={(e) => { e.stopPropagation(); removeCardFromDeck(card); }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="de-deck-editor-actions">
        <button onClick={handleSave}>Save Deck</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default DeckEditor;
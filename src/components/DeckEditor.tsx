import React, { useState, useEffect } from 'react';
import { Digimon, Card, CardEffect } from '../shared/types';
import { CardCollection, updateCardDescription } from '../shared/cardCollection';
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
    
    // Filter out cards that are already in the deck
    const deckCardIds = new Set(digimon.deck.map(card => card.id));
    const availableCardsFromCollection = Object.values(CardCollection)
      .filter(card => !deckCardIds.has(card.id))
      .map(card => ({ ...card, instanceId: `temp_${card.id}` }));
    
    setAvailableCards(availableCardsFromCollection);
  }, [digimon]);

  const addCardToDeck = (card: Card) => {
    if (currentDeck.length < 30) {
      const newCard = { ...card, instanceId: `${digimon.id}_${Date.now()}` };
      setCurrentDeck(prev => [...prev, newCard]);
      setAvailableCards(prev => prev.filter(c => c.id !== card.id));
    }
  };

  const renderCardEffects = (effects: CardEffect[]) => {
    return effects.map((effect, index) => (
      <div key={index} className="de-card-effect">
        {effect.description && <p>{effect.description}</p>}
        {effect.damage && (
          <p>Damage: {effect.damage.formula} to {effect.damage.target}</p>
        )}
        {effect.shield && (
          <p>Shield: {effect.shield.formula} to {effect.shield.target}</p>
        )}
        {effect.heal && (
          <p>Heal: {effect.heal.formula} to {effect.heal.target}</p>
        )}
        {effect.drawCards && <p>Draw {effect.drawCards} card(s)</p>}
        {effect.discardCards && <p>Discard {effect.discardCards} card(s)</p>}
        {effect.gainRam && <p>Gain {typeof effect.gainRam === 'number' ? effect.gainRam : 'variable'} RAM</p>}
        {effect.applyStatus && (
          <p>Apply {effect.applyStatus.type} (Duration: {effect.applyStatus.duration}, Value: {effect.applyStatus.value})</p>
        )}
        {effect.modifyStatMultiplier && (
          <p>Modify {effect.modifyStatMultiplier.stat} by {effect.modifyStatMultiplier.multiplier}x for {effect.modifyStatMultiplier.duration} turn(s)</p>
        )}
        {effect.burst && <p><strong>BURST</strong></p>}
        {effect.recompile && <p><strong>RECOMPILE</strong></p>}
      </div>
    ));
  };

  const removeCardFromDeck = (card: Card) => {
    setCurrentDeck(prev => prev.filter(c => c.instanceId !== card.instanceId));
    // When removing, we add back to available cards using the template from CardCollection
    const templateCard = CardCollection[card.id];
    if (templateCard) {
      setAvailableCards(prev => [...prev, { ...templateCard, instanceId: `temp_${templateCard.id}` }]);
    }
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
                key={card.instanceId}
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
            <p className="de-card-description">{updateCardDescription(selectedCard, digimon).description}</p>
            <div className="de-card-details">
              <span>Type: {selectedCard.type}</span>
              <span>Cost: {selectedCard.cost}</span>
              <span>Digimon Type: {selectedCard.digimonType}</span>
              <span>Target: {selectedCard.target}</span>
            </div>
            <div className="de-card-effects">
              <h5>Effects:</h5>
              {renderCardEffects(selectedCard.effects)}
            </div>
            {selectedCard.requiresCardSelection && (
              <p className="de-card-selection-note">Example of card note</p>
            )}
          </div>
        )}
      </div>
        <div className="de-current-deck">
          <h3>Current Deck ({currentDeck.length}/30)</h3>
          <div className="de-card-list">
            {currentDeck.map((card) => (
              <div
                key={card.instanceId}
                className={`de-card-item ${selectedCard?.instanceId === card.instanceId ? 'selected' : ''}`}
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
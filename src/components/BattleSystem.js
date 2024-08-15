const BattleSystem = ({ playerTeam, enemy }) => {
    // Directly initialize state without useEffect
    const initialDeck = shuffleDeck(playerTeam.flatMap(digimon => createDeck(digimon)));
    const initialHandSize = getHandSize(playerTeam.length);
    const initialHand = initialDeck.slice(0, initialHandSize);
    const remainingDeck = initialDeck.slice(initialHandSize);
  
    const [deck, setDeck] = useState(remainingDeck);
    const [hand, setHand] = useState(initialHand);
    const [discardPile, setDiscardPile] = useState([]);
    const [energy, setEnergy] = useState(3);
    const [turn, setTurn] = useState(1);
  
    const drawCard = () => {
      if (deck.length === 0) {
        refreshDeck();
      }
      if (deck.length > 0) {
        const newCard = deck[0];
        setHand([...hand, newCard]);
        setDeck(deck.slice(1));
      }
    };
  
    const refreshDeck = () => {
      const newDeck = shuffleDeck([...discardPile]);
      setDeck(newDeck);
      setDiscardPile([]);
    };
  
    const playCard = (card) => {
      if (energy >= card.cost) {
        card.effect(playerTeam[0], enemy);
        setEnergy(energy - card.cost);
        setHand(hand.filter(c => c.id !== card.id));
        setDiscardPile([...discardPile, card]);
      }
    };
  
    const endTurn = () => {
      setTurn(turn + 1);
      setEnergy(3);
      const handSize = getHandSize(playerTeam.length);
      while (hand.length < handSize && (deck.length > 0 || discardPile.length > 0)) {
        drawCard();
      }
      // enemy turn logic here
    };

  return (
    <div className="battle-system">
      <div className="player-team">
        {playerTeam.map(digimon => (
          <div key={digimon.id} className="digimon-card">
            <h3>{digimon.name}</h3>
            <p>HP: {digimon.hp}/{digimon.maxHp}</p>
            <p>Block: {digimon.block}</p>
          </div>
        ))}
      </div>
      <div className="enemy">
        <h3>{enemy.name}</h3>
        <p>HP: {enemy.hp}/{enemy.maxHp}</p>
        <p>Block: {enemy.block}</p>
      </div>
      <div className="player-hand">
        {hand.map(card => (
          <Card key={card.id} card={card} onPlay={() => playCard(card)} />
        ))}
      </div>
      <div className="player-info">
        <p>Energy: {energy}/3</p>
        <p>Turn: {turn}</p>
        <p>Deck: {deck.length}</p>
        <p>Discard: {discardPile.length}</p>
      </div>
      <button onClick={endTurn}>End Turn</button>
    </div>
  );
};

export default BattleSystem;
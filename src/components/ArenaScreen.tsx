import React from 'react';
import './ArenaScreen.css';

interface ArenaScreenProps {
  onClose: () => void;
  onSelectTournament: (rank: string) => void;
}

const ArenaScreen: React.FC<ArenaScreenProps> = ({ onClose, onSelectTournament }) => {
  const tournamentRanks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

  return (
    <div className="arena-screen">
      <h2>Arena Tournaments</h2>
      <div className="tournament-list">
        {tournamentRanks.map((rank) => (
          <button
            key={rank}
            className="tournament-button"
            onClick={() => onSelectTournament(rank)}
          >
            Rank {rank} Tournament
          </button>
        ))}
      </div>
      <button className="close-button" onClick={onClose}>Close</button>
    </div>
  );
};

export default ArenaScreen;
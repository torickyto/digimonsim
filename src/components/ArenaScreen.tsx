import React from 'react';
import './ArenaScreen.css';
import DigimonSprite from './DigimonSprite';
import { Digimon } from '../shared/types';
import { createDigimon } from '../shared/digimonManager';
import { DigimonTemplates } from '../data/DigimonTemplate';

interface ArenaScreenProps {
  onClose: () => void;
  onSelectTournament: (rank: string, enemyTeam: Digimon[]) => void;
}

const ArenaScreen: React.FC<ArenaScreenProps> = ({ onClose, onSelectTournament }) => {
  const tournamentRanks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

  const enemyTeams: Record<string, Digimon[]> = {
    'F': [
      createDigimon(DigimonTemplates['agumon'], 5),
      createDigimon(DigimonTemplates['gabumon'], 5),
    ],
    'E': [
      createDigimon(DigimonTemplates['greymon'], 10),
      createDigimon(DigimonTemplates['garurumon'], 10),
    ],
    'D': [
      createDigimon(DigimonTemplates['metalgreymon'], 15),
      createDigimon(DigimonTemplates['impmon'], 15),
    ],
    'C': [
      createDigimon(DigimonTemplates['impmon'], 20),
      createDigimon(DigimonTemplates['impmon'], 20),
    ],
    'B': [
      createDigimon(DigimonTemplates['kimeramon'], 25),
      createDigimon(DigimonTemplates['lucemon'], 25),
    ],
    'A': [
      createDigimon(DigimonTemplates['impmon'], 30),
      createDigimon(DigimonTemplates['impmon'], 30),
    ],
    'S': [
      createDigimon(DigimonTemplates['lucemon'], 35),
      createDigimon(DigimonTemplates['beelzemon'], 35),
    ],
  };

  return (
    <div className="arena-screen-container">
      <h1 className="arena-screen-title">Digital Arena</h1>
      <div className="arena-tournament-list">
        {tournamentRanks.map((rank) => (
          <div key={rank} className="arena-tournament-item">
            <div className="arena-rank-banner">
              <h2 className="arena-rank-title">Rank {rank}</h2>
              <span className="arena-difficulty">
                {rank === 'S' ? 'Ultimate Challenge' : `Difficulty: ${'★'.repeat(tournamentRanks.indexOf(rank) + 1)}`}
              </span>
            </div>
            <div className="arena-enemy-team">
              {enemyTeams[rank].map((digimon, index) => (
                <div key={index} className="arena-enemy-digimon">
                  <DigimonSprite name={digimon.name} />
                  <div className="arena-digimon-info">
                    <p className="arena-digimon-name">{digimon.displayName}</p>
                    <p className="arena-digimon-level">Lv. {digimon.level}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="arena-tournament-button"
              onClick={() => onSelectTournament(rank, enemyTeams[rank])}
            >
              Challenge Rank {rank}
            </button>
          </div>
        ))}
      </div>
      <button className="arena-close-button" onClick={onClose}>Exit Arena</button>
    </div>
  );
};

export default ArenaScreen;
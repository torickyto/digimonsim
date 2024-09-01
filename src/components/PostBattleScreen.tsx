import React, { useState, useEffect, useCallback } from 'react';
import { Digimon } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import './PostBattleScreen.css';

interface PostBattleScreenProps {
  playerTeam: Digimon[];
  expGained: number[];
  onContinue: () => void;
}

const PostBattleScreen: React.FC<PostBattleScreenProps> = ({ playerTeam, expGained, onContinue }) => {
  const [expBarWidths, setExpBarWidths] = useState<number[]>(new Array(playerTeam.length).fill(0));
  const [levelUps, setLevelUps] = useState<number[]>(new Array(playerTeam.length).fill(0));
  const [isAnimating, setIsAnimating] = useState(true);

  const animateExpBars = useCallback(() => {
    const totalExpNeeded = playerTeam.map(digimon => digimon.expToNextLevel);
    const startExp = playerTeam.map((digimon, index) => digimon.exp - expGained[index]);
    const endExp = playerTeam.map(digimon => digimon.exp);
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const updateExpBars = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newWidths = playerTeam.map((_, index) => {
        const currentExp = startExp[index] + progress * expGained[index];
        return (currentExp / totalExpNeeded[index]) * 100;
      });

      setExpBarWidths(newWidths);

      if (progress < 1) {
        requestAnimationFrame(updateExpBars);
      } else {
        setIsAnimating(false);
        // Check for level ups
        const newLevelUps = playerTeam.map((digimon, index) => 
          endExp[index] >= totalExpNeeded[index] ? 1 : 0
        );
        setLevelUps(newLevelUps);
      }
    };

    updateExpBars();
  }, [playerTeam, expGained]);

  useEffect(() => {
    animateExpBars();
  }, [animateExpBars]);

  return (
    <div className="pbs-overlay">
      <div className="pbs-content">
        <div className="pbs-background-element pbs-background-1"></div>
        <div className="pbs-background-element pbs-background-2"></div>
        <h2 className="pbs-header">Battle Results</h2>
        <div className="pbs-results">
          {playerTeam.map((digimon, index) => (
            <div key={`${digimon.id}_${index}`} className="pbs-digimon">
              <div className="pbs-digimon-sprite">
                <DigimonSprite 
                  name={digimon.name} 
                  scale={1.5}
                  isAttacking={false}
                  isOnHit={false}
                  isDead={false}
                />
              </div>
              <div className="pbs-digimon-info">
                <div className="pbs-digimon-name">{digimon.displayName || "Unknown Digimon"}</div>
                <div className="pbs-digimon-level">Level: {digimon.level}</div>
                <div className="pbs-exp-bar">
                  <div className="pbs-exp-fill" style={{ width: `${expBarWidths[index]}%` }}></div>
                </div>
                <div className="pbs-exp-gain">EXP Gained: {expGained[index] || 0}</div>
                {levelUps[index] > 0 && (
                  <div className="pbs-level-up">LEVEL UP!</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {!isAnimating && (
          <button onClick={onContinue} className="pbs-continue">Continue</button>
        )}
      </div>
    </div>
  );
};

export default PostBattleScreen;
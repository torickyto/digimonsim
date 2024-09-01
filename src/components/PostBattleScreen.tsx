import React, { useState, useEffect, useCallback } from 'react';
import { Digimon } from '../shared/types';
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
    <div className="post-battle-screen-overlay">
      <div className="post-battle-screen">
        <h2>Battle Results</h2>
        {playerTeam.map((digimon, index) => (
          <div key={`${digimon.id}_${index}`} className="digimon-exp-container">
            <div className="digimon-info">
              <h3>{digimon.displayName || "Unknown Digimon"}</h3>
            </div>
            <div className="exp-bar-container">
              <div className="exp-bar" style={{ width: `${expBarWidths[index]}%` }}></div>
            </div>
            <div className="exp-gained">
              <p>EXP Gained: {expGained[index] || 0}</p>
              {levelUps[index] > 0 && (
                <p className="level-up-text">Level Up!</p>
              )}
            </div>
          </div>
        ))}
        <div className="continue-button-container">
          {!isAnimating && (
            <button onClick={onContinue} className="continue-button">Continue</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostBattleScreen;
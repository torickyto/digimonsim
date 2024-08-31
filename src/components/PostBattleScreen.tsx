import React, { useState, useEffect, useCallback } from 'react';
import { Digimon } from '../shared/types';
import './PostBattleScreen.css';

interface PostBattleScreenProps {
  playerTeam: Digimon[];
  expGained: number[];
  onContinue: () => void;
}

const PostBattleScreen: React.FC<PostBattleScreenProps> = ({ playerTeam, expGained, onContinue }) => {
  const [currentDigimonIndex, setCurrentDigimonIndex] = useState(0);
  const [expBarWidth, setExpBarWidth] = useState(0);
  const [levelUps, setLevelUps] = useState<number[]>([]);

  useEffect(() => {
    console.log("PostBattleScreen rendered with playerTeam:", playerTeam);
    console.log("expGained:", expGained);
    
    if (playerTeam.length !== expGained.length) {
      console.error("playerTeam and expGained arrays have different lengths");
      return;
    }

    setLevelUps(new Array(playerTeam.length).fill(0));
  }, [playerTeam, expGained]);

  const animateExpBar = useCallback(() => {
    if (!playerTeam || playerTeam.length === 0 || currentDigimonIndex >= playerTeam.length) {
      console.error("Invalid playerTeam or currentDigimonIndex", { playerTeam, currentDigimonIndex });
      return;
    }

    const digimon = playerTeam[currentDigimonIndex];
    if (!digimon) {
      console.error(`No Digimon found at index ${currentDigimonIndex}`);
      return;
    }

    console.log(`Animating exp bar for Digimon:`, digimon);

    const totalExpNeeded = digimon.expToNextLevel;
    const startExp = digimon.exp - (expGained[currentDigimonIndex] || 0);
    const endExp = digimon.exp;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const updateExpBar = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentExp = startExp + progress * (expGained[currentDigimonIndex] || 0);
      const width = (currentExp / totalExpNeeded) * 100;
      setExpBarWidth(width);

      if (progress < 1) {
        requestAnimationFrame(updateExpBar);
      } else {
        // Check for level up
        if (endExp >= totalExpNeeded) {
          setLevelUps(prevLevelUps => {
            const newLevelUps = [...prevLevelUps];
            newLevelUps[currentDigimonIndex] = (newLevelUps[currentDigimonIndex] || 0) + 1;
            return newLevelUps;
          });
        }

        // Move to next Digimon after a short delay
        setTimeout(() => {
          if (currentDigimonIndex < playerTeam.length - 1) {
            setCurrentDigimonIndex(prevIndex => prevIndex + 1);
            setExpBarWidth(0);
          }
        }, 1000);
      }
    };

    updateExpBar();
  }, [currentDigimonIndex, playerTeam, expGained]);

  useEffect(() => {
    console.log("Calling animateExpBar");
    animateExpBar();
  }, [animateExpBar]);

  if (!playerTeam || playerTeam.length === 0) {
    console.error("Invalid playerTeam", playerTeam);
    return <div>Error: No valid Digimon data</div>;
  }

  return (
    <div className="post-battle-screen">
      <h2>Battle Results</h2>
      {playerTeam.map((digimon, index) => (
        <div key={`${digimon.id}_${index}`} className="digimon-exp-container" style={{display: index === currentDigimonIndex ? 'block' : 'none'}}>
          <h3>{digimon.displayName || "Unknown Digimon"}</h3>
          <div className="exp-bar-container">
            <div className="exp-bar" style={{ width: `${index === currentDigimonIndex ? expBarWidth : 0}%` }}></div>
          </div>
          <p>EXP Gained: {expGained[index] || 0}</p>
          {(levelUps[index] || 0) > 0 && (
            <p className="level-up-text">Level Up! +{levelUps[index]}</p>
          )}
        </div>
      ))}
      {currentDigimonIndex === playerTeam.length - 1 && (
        <button onClick={onContinue} className="continue-button">Continue</button>
      )}
    </div>
  );
};

export default PostBattleScreen;
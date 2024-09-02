import React, { useState, useRef, useEffect } from 'react';
import { Digimon, Card, DigimonTemplate } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import './ZoneMap.css';
import { generateEnemyTeam } from '../data/enemyManager';
import NodeEvent from './NodeEvent';
import { checkDigivolutionConditions } from '../data/digivolutionConditions';
import { getDigimonTemplate } from '../data/DigimonTemplate';
import { calculateBaseStat } from '../shared/statCalculations';
import { v4 as uuidv4 } from 'uuid';

type NodeType = 'start' | 'monster' | 'chest' | 'event' | 'boss' | 'empty' | 'rest';

interface MapNode {
  type: NodeType;
  connections: number[];
  completed: boolean;
}

interface ZoneMapProps {
  playerTeam: Digimon[];
  onEndDay: () => void;
  onStartBattle: (nodeIndex: number, enemyTeam: Digimon[]) => void;
  zoneName: string;
  zoneDifficulty: number;
  currentNode: number | null;
  map: MapNode[][];
  availableNodes: number[];
  onUpdateMap: (newMap: MapNode[][]) => void;
  onUpdateAvailableNodes: (newAvailableNodes: number[]) => void;
  onUpdateCurrentNode: (newCurrentNode: number) => void;
  onUpdatePlayerTeam: (updatedTeam: Digimon[]) => void;
  onAddEgg: (eggType: string) => void;
  bits: number;
  onUpdateBits: (amount: number) => void;
}

const ZoneMap: React.FC<ZoneMapProps> = ({
  playerTeam,
  onEndDay,
  onStartBattle,
  zoneName,
  zoneDifficulty,
  currentNode,
  map = [],
  availableNodes,
  onUpdateMap,
  onUpdateAvailableNodes,
  onUpdateCurrentNode,
  onUpdatePlayerTeam,
  onAddEgg,
  bits,
  onUpdateBits
}) => {
  const ROWS = 9;
  const COLS = 9;
  const NUM_PATHS = 3;
  const [showNodeEvent, setShowNodeEvent] = useState(false);
  const [currentEventType, setCurrentEventType] = useState<NodeType | null>(null);
  const [showDigivolutionModal, setShowDigivolutionModal] = useState(false);
  const [digivolvingDigimon, setDigivolvingDigimon] = useState<Digimon | null>(null);
  const [newDigimonForm, setNewDigimonForm] = useState<string | null>(null);
  const [digivolutionStage, setDigivolutionStage] = useState(0);

  useEffect(() => {
    if (!map || map.length === 0) {
      generateMap();
    } else if (currentNode !== null) {
      updateAvailableNodes(currentNode);
    }
  }, [zoneDifficulty, map, currentNode]);

  useEffect(() => {
    // Check for digivolution conditions
    playerTeam.forEach((digimon) => {
      const digivolveTarget = checkDigivolutionConditions(digimon);
      if (digivolveTarget) {
        setDigivolvingDigimon(digimon);
        setNewDigimonForm(digivolveTarget);
        setShowDigivolutionModal(true);
      }
    });
  }, [playerTeam]);

  useEffect(() => {
    if (showDigivolutionModal) {
      handleDigivolve();
    }
  }, [showDigivolutionModal]);

  const handleDigivolve = () => {
    if (digivolvingDigimon && newDigimonForm) {
      setDigivolutionStage(1);
      setTimeout(() => {
        setDigivolutionStage(2);
        setTimeout(() => {
          setDigivolutionStage(3);
          setTimeout(() => {
            const newTemplate = getDigimonTemplate(newDigimonForm);
            if (!newTemplate) {
              console.error(`No template found for ${newDigimonForm}`);
              return;
            }

            const newStartingCard: Card = {
              ...newTemplate.startingCard,
              instanceId: uuidv4(),
              ownerDigimonIndex: playerTeam.findIndex(d => d.id === digivolvingDigimon.id)
            };

            const evolvedDigimon: Digimon = {
              ...digivolvingDigimon,
              name: newTemplate.name,
              displayName: newTemplate.displayName,
              type: newTemplate.type,
              digivolutionStage: newTemplate.digivolutionStage,
              hp: calculateBaseStat(newTemplate.baseHp, digivolvingDigimon.level),
              maxHp: calculateBaseStat(newTemplate.baseHp, digivolvingDigimon.level),
              attack: calculateBaseStat(newTemplate.baseAttack, digivolvingDigimon.level),
              healing: calculateBaseStat(newTemplate.baseHealing, digivolvingDigimon.level),
              evasion: newTemplate.baseEvadeChance,
              critChance: newTemplate.baseCritChance,
              accuracy: newTemplate.baseAccuracy,
              corruptionResistance: newTemplate.baseCorruptionResistance,
              buggedResistance: newTemplate.baseBuggedResistance,
              passiveSkill: newTemplate.passiveSkill,
              deck: [
                ...digivolvingDigimon.deck,
                newStartingCard
              ]
            };

            const updatedTeam = playerTeam.map(d => 
              d.id === digivolvingDigimon.id ? evolvedDigimon : d
            );
            setDigivolutionStage(4);
            setTimeout(() => {
              onUpdatePlayerTeam(updatedTeam);
              setShowDigivolutionModal(false);
              setDigivolvingDigimon(null);
              setNewDigimonForm(null);
              setDigivolutionStage(0);
            }, 2000);
          }, 2000);
        }, 2000);
      }, 2000);
    }
  };


  const generateMap = () => {
    let newMap: MapNode[][] = [];

    // Initialize empty map
    for (let i = 0; i < ROWS; i++) {
      const row: MapNode[] = [];
      for (let j = 0; j < COLS; j++) {
        if (i === ROWS - 1) {
          // Make the entire last row boss nodes
          row.push({ type: 'boss', connections: [], completed: false });
        } else {
          row.push({ type: 'empty', connections: [], completed: false });
        }
      }
      newMap.push(row);
    }

    // Set start node
    const startCol = Math.floor(COLS / 2);
    newMap[0][startCol] = { type: 'start', connections: [], completed: true };

    // Generate multiple main paths
    for (let i = 0; i < NUM_PATHS; i++) {
      newMap = generatePath(newMap);
    }

    // Add additional connections between existing nodes
    newMap = addAdditionalConnections(newMap);

    onUpdateMap(newMap);
    onUpdateCurrentNode(startCol);
    updateAvailableNodes(startCol);
  };

  const generatePath = (map: MapNode[][]): MapNode[][] => {
    let currentRow = 0;
    let currentCol = Math.floor(COLS / 2);

    while (currentRow < ROWS - 2) { // Stop one row before the boss row
      const nextRow = currentRow + 1;
      let nextCol: number;

      const direction = Math.floor(Math.random() * 3) - 1;
      nextCol = Math.max(0, Math.min(COLS - 1, currentCol + direction));

      if (map[nextRow][nextCol].type === 'empty') {
        map[nextRow][nextCol].type = chooseNodeType(nextRow, ROWS - 1); // Adjust for boss row
      }

      const currentIndex = currentRow * COLS + currentCol;
      const nextIndex = nextRow * COLS + nextCol;

      if (!map[currentRow][currentCol].connections.includes(nextIndex)) {
        map[currentRow][currentCol].connections.push(nextIndex);
      }
      if (!map[nextRow][nextCol].connections.includes(currentIndex)) {
        map[nextRow][nextCol].connections.push(currentIndex);
      }

      currentRow = nextRow;
      currentCol = nextCol;
    }

    // Connect the last non-boss row to all boss nodes
    const lastNonBossRow = ROWS - 2;
    for (let col = 0; col < COLS; col++) {
      if (map[lastNonBossRow][col].type !== 'empty') {
        for (let bossCol = 0; bossCol < COLS; bossCol++) {
          const currentIndex = lastNonBossRow * COLS + col;
          const bossIndex = (ROWS - 1) * COLS + bossCol;
          map[lastNonBossRow][col].connections.push(bossIndex);
          map[ROWS - 1][bossCol].connections.push(currentIndex);
        }
      }
    }

    return map;
  };


  const addAdditionalConnections = (map: MapNode[][]): MapNode[][] => {
    for (let row = 0; row < ROWS - 1; row++) {
      for (let col = 0; col < COLS; col++) {
        if (map[row][col].type !== 'empty') {
          const currentIndex = row * COLS + col;
          
          for (let nextCol = Math.max(0, col - 1); nextCol <= Math.min(COLS - 1, col + 1); nextCol++) {
            if (map[row + 1][nextCol].type !== 'empty') {
              const nextIndex = (row + 1) * COLS + nextCol;
              if (!map[row][col].connections.includes(nextIndex)) {
                map[row][col].connections.push(nextIndex);
              }
              if (!map[row + 1][nextCol].connections.includes(currentIndex)) {
                map[row + 1][nextCol].connections.push(currentIndex);
              }
            }
          }
        }
      }
    }
    return map;
  };

  const chooseNodeType = (row: number, totalRows: number): NodeType => {
    const progress = row / totalRows;
    const types: NodeType[] = ['monster', 'chest', 'event', 'rest'];
    
    if (progress < 0.3) return 'monster';
    if (progress > 0.7) return types[Math.floor(Math.random() * 3)];
    return types[Math.floor(Math.random() * types.length)];
  };


  const updateAvailableNodes = (nodeIndex: number) => {
    if (map.length === 0) return;

    const [row, col] = getRowColFromIndex(nodeIndex);
    if (!map[row] || !map[row][col]) return;

    const node = map[row][col];
    const newAvailableNodes = node.connections.filter(index => {
      const [r, c] = getRowColFromIndex(index);
      return map[r] && map[r][c] && !map[r][c].completed;
    });
    onUpdateAvailableNodes(newAvailableNodes);
  };

  const getRowColFromIndex = (index: number): [number, number] => {
    return [Math.floor(index / COLS), index % COLS];
  };

  const handleNodeClick = (row: number, col: number) => {
    const nodeIndex = row * COLS + col;
    if (availableNodes.includes(nodeIndex) && !map[row][col].completed) {
      const nodeType = map[row][col].type;
      switch (nodeType) {
        case 'monster':
        case 'boss':
          const playerLevel = Math.max(...playerTeam.map(d => d.level));
          const enemyTeam = generateEnemyTeam(zoneName, nodeType, playerLevel, nodeType === 'boss' ? 1 : 2);
          onStartBattle(nodeIndex, enemyTeam);
          break;
        case 'chest':
        case 'event':
        case 'rest':
        case 'start':
        case 'empty':
          setCurrentEventType(nodeType);
          setShowNodeEvent(true);
          break;
      }
      onUpdateCurrentNode(nodeIndex);
      updateAvailableNodes(nodeIndex);
    }
  };

  const handleCloseNodeEvent = () => {
    setShowNodeEvent(false);
    setCurrentEventType(null);
    if (currentNode !== null) {
      const [row, col] = getRowColFromIndex(currentNode);
      const newMap = map.map(r => r.map(node => ({ ...node })));
      newMap[row][col].completed = true;
      onUpdateMap(newMap);
    }
  };

  const renderNode = (node: MapNode, rowIndex: number, colIndex: number) => {
    if (!map || !map[0]) return null;
    const nodeIndex = rowIndex * map[0].length + colIndex;
    const isAvailable = availableNodes.includes(nodeIndex);
    const isCurrent = currentNode === nodeIndex;
    let nodeClass = 'zm-map-node';
    if (node.type !== 'empty') {
      nodeClass += ` zm-${node.type}`;
      if (node.completed) nodeClass += ' zm-completed';
      if (isAvailable) nodeClass += ' zm-available';
      if (isCurrent) nodeClass += ' zm-current';
    } else {
      nodeClass += ' zm-empty';
    }

    const getNodeIcon = (type: NodeType) => {
      switch (type) {
        case 'start': return '▶️';
        case 'monster': return '👾';
        case 'chest': return '🎁';
        case 'event': return '❓';
        case 'boss': return '💀';
        default: return '';
      }
    };

    if (!map || map.length === 0) {
      return <div>Loading map...</div>;
    }

    return (
      <div
        key={colIndex}
        className={nodeClass}
        data-index={nodeIndex}
        onClick={() => node.type !== 'empty' && handleNodeClick(rowIndex, colIndex)}
      >
        <span className="zm-node-icon">{getNodeIcon(node.type)}</span>
      </div>
    );
  };

  const renderDigimonInfo = (digimon: Digimon) => {
    const healthPercentage = (digimon.hp / digimon.maxHp) * 100;
    return (
      <div className="zm-digimon-container" key={digimon.id}>
        <div className="zm-digimon-sprite">
          <DigimonSprite name={digimon.name} scale={0.8} />
        </div>
        <div className="zm-digimon-info">
          <div className="zm-digimon-name">{digimon.nickname ? digimon.nickname : digimon.displayName}</div>
          <div className="zm-digimon-level">Lv. {digimon.level}</div>
          <div className="zm-health-bar">
            <div 
              className="zm-health-bar-fill" 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

 return (
    <div className="zm-zone-map">
        {showDigivolutionModal && digivolvingDigimon && newDigimonForm && (
        <div className="digivolution-overlay">
          <div className="digivolution-content">
            <h2>{digivolvingDigimon.nickname || digivolvingDigimon.displayName} IS DIGIVOLVING</h2>
            <div className={`digivolution-animation stage-${digivolutionStage}`}>
              <div className="digimon-container original">
                <DigimonSprite name={digivolvingDigimon.name} scale={2} />
              </div>
              <div className="digivolution-effect"></div>
              <div className="digimon-container target">
                <DigimonSprite 
                  name={newDigimonForm} 
                  scale={2} 
                  isAttacking={digivolutionStage === 4}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="zm-zone-header">
        <h2 className="zm-zone-title">{zoneName}</h2>
        <div className="zm-bits-display">Bits: {bits}</div>
        <button className="zm-end-day-button" onClick={onEndDay}>End Day</button>
      </div>
      <div className="zm-zone-content">
        <div className="zm-player-team">
          {playerTeam.map(renderDigimonInfo)}
        </div>
        <div className="zm-map-container">
          <div className="zm-map-grid">
            {map.map((row, rowIndex) => (
              <div key={rowIndex} className="zm-map-row">
                {row.map((node, colIndex) => renderNode(node, rowIndex, colIndex))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {showNodeEvent && currentEventType && (
        <NodeEvent 
          type={currentEventType}
          onClose={handleCloseNodeEvent}
          onUpdatePlayerTeam={onUpdatePlayerTeam}
          playerTeam={playerTeam}
          onAddEgg={onAddEgg}
          onUpdateBits={onUpdateBits}
        />
      )}
    </div>
  );
};

export default ZoneMap;

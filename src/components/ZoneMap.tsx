import React, { useState, useRef, useEffect } from 'react';
import { Digimon } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import './ZoneMap.css';

type NodeType = 'start' | 'monster' | 'chest' | 'event' | 'boss' | 'empty';

interface MapNode {
  type: NodeType;
  connections: number[];
  completed: boolean;
}

interface ZoneMapProps {
  playerTeam: Digimon[];
  onExitZone: () => void;
  onStartBattle: (nodeIndex: number) => void;
  zoneName: string;
  zoneDifficulty: number;
  currentNode: number | null;
  map: MapNode[][];
  availableNodes: number[];
  onUpdateMap: (newMap: MapNode[][]) => void;
  onUpdateAvailableNodes: (newAvailableNodes: number[]) => void;
  onUpdateCurrentNode: (newCurrentNode: number) => void;
}

const ZoneMap: React.FC<ZoneMapProps> = ({
  playerTeam,
  onExitZone,
  onStartBattle,
  zoneName,
  zoneDifficulty,
  currentNode,
  map,
  availableNodes,
  onUpdateMap,
  onUpdateAvailableNodes,
  onUpdateCurrentNode
}) => {
  const ROWS = 9;
  const COLS = 9;
  const NUM_PATHS = 3;

  useEffect(() => {
    if (map.length === 0) {
      generateMap();
    } else if (currentNode !== null) {
      updateAvailableNodes(currentNode);
    }
  }, [zoneDifficulty, map, currentNode]);


  const generateMap = () => {
    let newMap: MapNode[][] = [];

    // Initialize empty map
    for (let i = 0; i < ROWS; i++) {
      const row: MapNode[] = [];
      for (let j = 0; j < COLS; j++) {
        row.push({ type: 'empty', connections: [], completed: false });
      }
      newMap.push(row);
    }

    // Set start and boss nodes
    const startCol = Math.floor(COLS / 2);
    newMap[0][startCol] = { type: 'start', connections: [], completed: true };
    newMap[ROWS - 1][startCol] = { type: 'boss', connections: [], completed: false };

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

    while (currentRow < ROWS - 1) {
      const nextRow = currentRow + 1;
      let nextCol: number;

      if (nextRow === ROWS - 1) {
        nextCol = Math.floor(COLS / 2);
      } else {
        const direction = Math.floor(Math.random() * 3) - 1;
        nextCol = Math.max(0, Math.min(COLS - 1, currentCol + direction));
      }

      if (map[nextRow][nextCol].type === 'empty') {
        map[nextRow][nextCol].type = chooseNodeType(nextRow, ROWS);
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
    const types: NodeType[] = ['monster', 'chest', 'event'];
    
    if (progress < 0.3) return 'monster';
    if (progress > 0.7) return types[Math.floor(Math.random() * 2)];
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
      if (map[row][col].type === 'monster' || map[row][col].type === 'boss') {
        onStartBattle(nodeIndex);
      } else {
        // Handle other node types (chest, event) here
        const newMap = map.map(r => r.map(node => ({ ...node })));
        newMap[row][col].completed = true;
        onUpdateMap(newMap);
      }
      onUpdateCurrentNode(nodeIndex);
      updateAvailableNodes(nodeIndex);
    }
  };

  const renderNode = (node: MapNode, rowIndex: number, colIndex: number) => {
    const nodeIndex = rowIndex * COLS + colIndex;
    const isAvailable = availableNodes.includes(nodeIndex);
    const isCurrent = currentNode === nodeIndex;

    let nodeClass = 'map-node';
    if (node.type !== 'empty') {
      nodeClass += ` ${node.type}`;
      if (node.completed) nodeClass += ' completed';
      if (isAvailable) nodeClass += ' available';
      if (isCurrent) nodeClass += ' current';
    } else {
      nodeClass += ' empty';
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

    return (
      <div
        key={colIndex}
        className={nodeClass}
        data-index={nodeIndex}
        onClick={() => node.type !== 'empty' && handleNodeClick(rowIndex, colIndex)}
      >
        <span className="node-icon">{getNodeIcon(node.type)}</span>
      </div>
    );
  };

  const renderDigimonInfo = (digimon: Digimon) => {
    const healthPercentage = (digimon.hp / digimon.maxHp) * 100;
    return (
      <div className="digimon-container" key={digimon.id}>
        <div className="digimon-sprite">
          <DigimonSprite name={digimon.name} scale={1} />
        </div>
        <div className="digimon-info">
          <div className="digimon-name">{digimon.name}</div>
          <div className="digimon-level">Lv. {digimon.level}</div>
          <div className="health-bar">
            <div 
              className="health-bar-fill" 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="zone-map">
      <div className="zone-header">
        <h2>{zoneName}</h2>
        <button className="exit-button" onClick={onExitZone}>Exit Zone</button>
      </div>
      <div className="zone-content">
        <div className="player-team">
          {playerTeam.map(renderDigimonInfo)}
        </div>
        <div className="map-container">
          <div className="map-grid">
            {map.slice(0, -1).map((row, rowIndex) => (
              <div key={rowIndex} className="map-row">
                {row.map((node, colIndex) => renderNode(node, rowIndex, colIndex))}
              </div>
            ))}
            <div className="map-row boss-row">
              <div className="map-node boss" data-index={(ROWS - 1) * COLS}>
                <span className="node-icon" role="img" aria-label="skull">💀</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneMap;
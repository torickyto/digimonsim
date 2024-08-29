import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Digimon } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import './ZoneMap.css';

type MapNodeTypes = 'start' | 'M' | 'C' | 'Q' | 'E' | 'boss' | '';

interface MapNode {
  id: string;
  type: MapNodeTypes;
  edges: Set<string>;
  didVisit: boolean;
}

type Graph = MapNode[][];
type Move = [number, number];
type Path = Move[];

interface GraphOptions {
  width: number;
  height: number;
  minRooms: number;
  maxRooms: number;
  roomTypes: string;
  zoneDifficulty: number;
}

interface ZoneMapProps {
  playerTeam: Digimon[];
  onExitZone: () => void;
  onStartBattle: () => void;
  zoneName: string;
  zoneDifficulty: number;
}

const defaultOptions: GraphOptions = {
  width: 8,
  height: 8,
  minRooms: 3,
  maxRooms: 6,
  roomTypes: 'MMMMCE',
  zoneDifficulty: 1,
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pick = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const decideNodeType = (nodeTypes: string, floor: number, zoneDifficulty: number): MapNodeTypes => {
  if (floor === 0) return 'start';
  if (floor === defaultOptions.height - 1) return 'boss';
  
  const difficulty = Math.min(zoneDifficulty, 5);
  const normalizedFloor = Math.floor((floor / defaultOptions.height) * 10);
  
  if (normalizedFloor < 2) return 'M';
  if (normalizedFloor < 3) return pick(['M', 'C'] as MapNodeTypes[]);
  if (normalizedFloor > 6) {
    const types: MapNodeTypes[] = ['M', 'M', 'E', 'C'];
    if (difficulty > 3) types.push('E');
    if (difficulty > 4) types.push('Q');
    return pick(types);
  }
  
  return pick(nodeTypes.split('') as MapNodeTypes[]);
};

const generateGraph = (options: GraphOptions = defaultOptions): Graph => {
  const { width, height, minRooms, maxRooms, roomTypes, zoneDifficulty } = options;
  const graph: Graph = [];

  for (let floorNumber = 0; floorNumber < height; floorNumber++) {
    const floor: MapNode[] = [];
    let desiredAmountOfRooms = random(minRooms, maxRooms);
    if (desiredAmountOfRooms > width) desiredAmountOfRooms = width;

    for (let i = 0; i < desiredAmountOfRooms; i++) {
      const nodeType = decideNodeType(roomTypes, floorNumber, zoneDifficulty);
      floor.push({
        id: uuidv4(),
        type: nodeType,
        edges: new Set(),
        didVisit: false,
      });
    }

    while (floor.length < width) {
      floor.push({
        id: uuidv4(),
        type: '',
        edges: new Set(),
        didVisit: false,
      });
    }

    graph.push(shuffle(floor));
  }

  graph[0] = [{
    id: uuidv4(),
    type: 'start',
    edges: new Set(),
    didVisit: true,
  }];
  
  graph[height - 1] = [{
    id: uuidv4(),
    type: 'boss',
    edges: new Set(),
    didVisit: false,
  }];

  return graph;
};

const connectNodes = (graph: Graph): Graph => {
  for (let y = 0; y < graph.length - 1; y++) {
    for (let x = 0; x < graph[y].length; x++) {
      const currentNode = graph[y][x];
      if (currentNode.type) {
        // Connect to the node below
        if (graph[y + 1]?.[x]?.type) {
          currentNode.edges.add(graph[y + 1][x].id);
          graph[y + 1][x].edges.add(currentNode.id);
        }
        // Connect to the node to the right
        if (graph[y]?.[x + 1]?.type) {
          currentNode.edges.add(graph[y][x + 1].id);
          graph[y][x + 1].edges.add(currentNode.id);
        }
      }
    }
  }
  return graph;
};

const generatePaths = (graph: Graph): Path[] => {
  const paths: Path[] = [];

  const dfs = (node: MapNode, path: Move[], visited: Set<string>): boolean => {
    if (node.type === 'boss') {
      paths.push([...path]);
      return true;
    }

    visited.add(node.id);

    for (let y = 0; y < graph.length; y++) {
      for (let x = 0; x < graph[y].length; x++) {
        const nextNode = graph[y][x];
        if (node.edges.has(nextNode.id) && !visited.has(nextNode.id)) {
          path.push([y, x]);
          if (dfs(nextNode, path, new Set(visited))) {
            return true;
          }
          path.pop();
        }
      }
    }

    return false;
  };

  dfs(graph[0][0], [[0, 0]], new Set());

  return paths;
};

const ZoneMap: React.FC<ZoneMapProps> = ({ playerTeam, onExitZone, onStartBattle, zoneName, zoneDifficulty }) => {
  const [graph, setGraph] = useState<Graph>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Move>([0, 0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const options: GraphOptions = {
        ...defaultOptions,
        zoneDifficulty,
      };
      let newGraph = generateGraph(options);
      newGraph = connectNodes(newGraph);
      const newPaths = generatePaths(newGraph);
      setGraph(newGraph);
      setPaths(newPaths);
    } catch (err) {
      setError("Failed to generate map. Please try again.");
      console.error(err);
    }
  }, [zoneDifficulty]);

  const handleNodeClick = useCallback((y: number, x: number) => {
    const node = graph[y]?.[x];
    const currentNode = graph[currentPosition[0]]?.[currentPosition[1]];
    if (node && currentNode && (node.edges.has(currentNode.id) || currentNode.edges.has(node.id))) {
      setCurrentPosition([y, x]);
      const newGraph = graph.map(row => row.map(n => ({...n})));
      newGraph[y][x].didVisit = true;
      setGraph(newGraph);
      if (node.type === 'M' || node.type === 'E' || node.type === 'boss') {
        onStartBattle();
      }
    }
  }, [graph, currentPosition, onStartBattle]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="zone-map">
      <h2>{zoneName}</h2>
      <div className="map-grid">
        {graph.map((row, y) => (
          <div key={y} className="floor">
            {row.map((node, x) => (
              <div
                key={node.id}
                className={`node ${node.type} ${node.didVisit ? 'visited' : ''} ${currentPosition[0] === y && currentPosition[1] === x ? 'current' : ''}`}
                onClick={() => handleNodeClick(y, x)}
              >
                {node.type === 'M' && '👾'}
                {node.type === 'C' && '🏕️'}
                {node.type === 'E' && '👹'}
                {node.type === 'boss' && '🌋'}
                {node.type === 'start' && '👣'}
                {node.type === 'Q' && '❓'}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="player-team">
        {playerTeam.map((digimon, index) => (
          <DigimonSprite key={index} name={digimon.name} scale={0.5} />
        ))}
      </div>
      <button onClick={onExitZone}>Exit Zone</button>
    </div>
  );
};

export default ZoneMap;
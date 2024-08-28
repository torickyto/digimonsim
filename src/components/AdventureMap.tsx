import React, { useState, useEffect } from 'react';
import './AdventureMap.css';

interface Node {
  id: number;
  type: 'battle' | 'event' | 'elite' | 'boss' | 'rest';
  x: number;
  y: number;
  connections: number[];
  level: number;
}

interface AdventureMapProps {
  zone: string;
  onClose: () => void;
  onNodeSelect: (nodeId: number) => void;
}

const AdventureMap: React.FC<AdventureMapProps> = ({ zone, onClose, onNodeSelect }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [currentNode, setCurrentNode] = useState<number>(0);

  useEffect(() => {
    generateMap();
  }, [zone]);

  const generateMap = () => {
    const width = 1000;
    const height = 2000;
    const levels = 13;
    const nodesPerLevel = [1, 2, 3, 3, 4, 4, 4, 3, 3, 2, 2, 2, 1];

    let newNodes: Node[] = [];
    let nodeId = 0;

    // Create nodes for each level
    for (let level = 0; level < levels; level++) {
      for (let i = 0; i < nodesPerLevel[level]; i++) {
        newNodes.push({
          id: nodeId++,
          type: getNodeType(level, levels),
          x: (width / (nodesPerLevel[level] + 1)) * (i + 1),
          y: height - (height / (levels - 1)) * level,
          connections: [],
          level: level
        });
      }
    }

    // Connect nodes
    for (let level = 0; level < levels - 1; level++) {
      const currentLevelNodes = newNodes.filter(n => n.level === level);
      const nextLevelNodes = newNodes.filter(n => n.level === level + 1);

      currentLevelNodes.forEach((node, index) => {
        const connections = Math.floor(Math.random() * 2) + 1; // 1 or 2 connections
        const potentialConnections = nextLevelNodes.filter((_, i) => 
          i >= Math.max(0, index - 1) && i <= Math.min(nextLevelNodes.length - 1, index + 1)
        );

        const selectedConnections = potentialConnections
          .sort(() => 0.5 - Math.random())
          .slice(0, connections);

        node.connections = selectedConnections.map(n => n.id);
      });
    }

    // Ensure no dead ends
    for (let level = levels - 2; level >= 0; level--) {
      const currentLevelNodes = newNodes.filter(n => n.level === level);
      const nextLevelNodes = newNodes.filter(n => n.level === level + 1);

      currentLevelNodes.forEach(node => {
        if (node.connections.length === 0) {
          const closestNode = nextLevelNodes.reduce((prev, curr) =>
            Math.abs(curr.x - node.x) < Math.abs(prev.x - node.x) ? curr : prev
          );
          node.connections.push(closestNode.id);
        }
      });
    }

    // Ensure all nodes are connected
    const connectedNodes = new Set<number>([0]);
    const stack = [0];

    while (stack.length > 0) {
      const nodeId = stack.pop()!;
      const node = newNodes.find(n => n.id === nodeId)!;

      node.connections.forEach(connId => {
        if (!connectedNodes.has(connId)) {
          connectedNodes.add(connId);
          stack.push(connId);
        }
      });
    }

    // Remove any nodes that are not connected
    newNodes = newNodes.filter(node => connectedNodes.has(node.id));

    // Add some randomness to node positions
    newNodes.forEach(node => {
      node.x += Math.random() * 40 - 20;
      node.y += Math.random() * 40 - 20;
    });

    setNodes(newNodes);
    setCurrentNode(0);
  };

  const getNodeType = (level: number, totalLevels: number): Node['type'] => {
    if (level === 0) return 'rest';
    if (level === totalLevels - 1) return 'boss';
    if (level % 4 === 0) return 'elite';
    if (level % 3 === 0) return 'rest';
    const types: Node['type'][] = ['battle', 'event'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const handleNodeClick = (nodeId: number) => {
    if (isNodeAccessible(nodeId)) {
      setCurrentNode(nodeId);
      onNodeSelect(nodeId);
    }
  };

  const isNodeAccessible = (nodeId: number) => {
    const currentNodeObj = nodes.find(n => n.id === currentNode);
    return currentNodeObj?.connections.includes(nodeId) || false;
  };

  const getPath = (start: Node, end: Node) => {
    const midX = (start.x + end.x) / 2;
    const midY = start.y + (end.y - start.y) / 2;
    return `M ${start.x},${start.y} Q ${midX},${midY} ${end.x},${end.y}`;
  };

  return (
    <div className="adventure-map" style={{ backgroundImage: `url('/src/assets/backgrounds/labelforest.png')` }}>
      <h2>{zone}</h2>
      <svg width="1000" height="2000" viewBox="0 0 1000 2000">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {nodes.map(node => (
          <React.Fragment key={node.id}>
            {node.connections.map(connectionId => {
              const endNode = nodes.find(n => n.id === connectionId)!;
              return (
                <path
                  key={`${node.id}-${connectionId}`}
                  d={getPath(node, endNode)}
                  stroke={isNodeAccessible(connectionId) ? "#ffd700" : "rgba(255,255,255,0.2)"}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={isNodeAccessible(connectionId) ? "none" : "5,5"}
                />
              );
            })}
          </React.Fragment>
        ))}
        {nodes.map(node => (
          <g
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            style={{ cursor: isNodeAccessible(node.id) ? 'pointer' : 'default' }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r="25"
              fill={getNodeColor(node.type)}
              stroke={node.id === currentNode ? "#ffd700" : "#000"}
              strokeWidth="3"
              filter="url(#glow)"
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dy=".3em"
              fill="#000"
              fontSize="16"
              fontWeight="bold"
            >
              {getNodeIcon(node.type)}
            </text>
          </g>
        ))}
      </svg>
      <button className="close-button" onClick={onClose}>Close Map</button>
    </div>
  );
};

const getNodeColor = (type: Node['type']) => {
  switch (type) {
    case 'battle': return '#ff9999';
    case 'event': return '#99ff99';
    case 'elite': return '#9999ff';
    case 'boss': return '#ff99ff';
    case 'rest': return '#ffff99';
  }
};

const getNodeIcon = (type: Node['type']) => {
  switch (type) {
    case 'battle': return '⚔️';
    case 'event': return '?';
    case 'elite': return '👑';
    case 'boss': return '💀';
    case 'rest': return '🏕️';
  }
};

export default AdventureMap;
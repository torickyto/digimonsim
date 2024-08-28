import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const svgRef = useRef<SVGSVGElement>(null);

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
          x: (width / (nodesPerLevel[level] + 1)) * (i + 1) + (Math.random() * 60 - 30),
          y: height - (height / (levels - 1)) * level + (Math.random() * 40 - 20),
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
    for (let i = newNodes.length - 2; i >= 0; i--) {
      if (newNodes[i].connections.length === 0) {
        const nextLevelNodes = newNodes.filter(n => n.level === newNodes[i].level + 1);
        const closestNode = nextLevelNodes.reduce((prev, curr) =>
          Math.abs(curr.x - newNodes[i].x) < Math.abs(prev.x - newNodes[i].x) ? curr : prev
        );
        newNodes[i].connections.push(closestNode.id);
      }
    }

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

  const getPath = useMemo(() => (start: Node, end: Node) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const curviness = 0.2;
    const controlX = midX + (Math.random() - 0.5) * 100;
    const controlY = midY + (end.y - start.y) * curviness;
    return `M ${start.x},${start.y} Q ${controlX},${controlY} ${end.x},${end.y}`;
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale * scaleFactor))
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...transform };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setTransform({
        ...startTransform,
        x: startTransform.x + dx,
        y: startTransform.y + dy
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="adventure-map" style={{ backgroundImage: `url('/src/assets/backgrounds/labelforest.png')` }}>
      <h2>{zone}</h2>
      <svg 
        ref={svgRef}
        width="1000" 
        height="2000" 
        viewBox="0 0 1000 2000"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff8c00" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Connections */}
          {nodes.map(node => (
            <React.Fragment key={node.id}>
              {node.connections.map(connectionId => {
                const endNode = nodes.find(n => n.id === connectionId)!;
                return (
                  <path
                    key={`${node.id}-${connectionId}`}
                    d={getPath(node, endNode)}
                    stroke={isNodeAccessible(connectionId) ? "url(#pathGradient)" : "rgba(255,255,255,0.2)"}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={isNodeAccessible(connectionId) ? "5,5" : "5,5"}
                    className={isNodeAccessible(connectionId) ? "path-animation" : ""}
                  />
                );
              })}
            </React.Fragment>
          ))}
          
          {/* Nodes */}
          {nodes.map(node => (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: isNodeAccessible(node.id) ? 'pointer' : 'default' }}
              className={isNodeAccessible(node.id) || node.id === currentNode ? "node-active" : "node-inactive"}
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
              {node.id === currentNode && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="30"
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth="2"
                  opacity="0.5"
                  className="pulse-animation"
                />
              )}
            </g>
          ))}
        </g>
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

export default AdventureMap
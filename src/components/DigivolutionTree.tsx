import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Digimon, DigivolutionStage } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import { getDigivolutionConnections } from './DigivolutionWeb';
import './DigivolutionTree.css';

interface DigivolutionTreeProps {
  currentDigimon: Digimon;
  allDigimon: Digimon[];
}

interface DigimonNode {
  digimon: Digimon;
  x: number;
  y: number;
}

const stageOrder: DigivolutionStage[] = ['In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega'];

const DigivolutionTree: React.FC<DigivolutionTreeProps> = ({ currentDigimon, allDigimon }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<DigimonNode[]>([]);
  const connections = useMemo(() => getDigivolutionConnections(), []);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const digimonByStage = stageOrder.map(stage => 
      allDigimon.filter(d => d.digivolutionStage === stage)
    );

    const totalWidth = window.innerWidth * 0.8;
    const totalHeight = window.innerHeight * 0.8;
    const columnWidth = totalWidth / stageOrder.length;

    const newNodes: DigimonNode[] = [];

    digimonByStage.forEach((stageDigimon, stageIndex) => {
      const columnX = columnWidth * (stageIndex + 0.5) + window.innerWidth * 0.1;
      
      stageDigimon.forEach((digimon, index) => {
        const y = (index + 1) * totalHeight / (stageDigimon.length + 1) + window.innerHeight * 0.1;
        newNodes.push({ digimon, x: columnX, y });
      });
    });

    setNodes(newNodes);
  }, [allDigimon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw connections
    connections.forEach(connection => {
      const startNode = nodes.find(node => node.digimon.name === connection.from);
      const endNode = nodes.find(node => node.digimon.name === connection.to);

      if (startNode && endNode) {
        const gradient = ctx.createLinearGradient(startNode.x, startNode.y, endNode.x, endNode.y);
        gradient.addColorStop(0, 'rgba(244, 244, 244, 0.8)');
        gradient.addColorStop(1, 'rgba(111, 111, 111, 0.8)');

        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);

        // Create a curved line
        const midX = (startNode.x + endNode.x) / 2;
        const midY = (startNode.y + endNode.y) / 2;
        const controlX = midX + (endNode.x - startNode.x) / 4;
        const controlY = midY;

        ctx.quadraticCurveTo(controlX, controlY, endNode.x, endNode.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(endNode.y - controlY, endNode.x - controlX);
        ctx.save();
        ctx.translate(endNode.x, endNode.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.fill();
        ctx.restore();
      }
    });

    ctx.restore();
  }, [nodes, connections, offset, scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - startDragPosition.x,
        y: e.clientY - startDragPosition.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prevScale => Math.max(0.5, Math.min(2, prevScale - e.deltaY * 0.001)));
  };

  return (
    <div 
      className="digivolution-tree"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} />
      {nodes.map((node) => (
        <div
          key={`${node.digimon.id}-${node.digimon.name}`}
          className={`digimon-node ${node.digimon.name === currentDigimon.name ? 'current' : ''}`}
          style={{ 
            left: (node.x + offset.x) * scale - 32, 
            top: (node.y + offset.y) * scale - 88,
            transform: `scale(${scale})`
          }}
        >
          <DigimonSprite name={node.digimon.name} scale={1} />
          <span>{node.digimon.displayName}</span>
        </div>
      ))}
      <div className="stage-labels">
        {stageOrder.map((stage, index) => (
          <div 
            key={stage} 
            className="stage-label"
            style={{left: `${(index + 0.5) * 20}%`}}
          >
            {stage}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigivolutionTree;
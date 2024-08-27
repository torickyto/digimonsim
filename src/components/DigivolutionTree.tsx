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

  console.log('DigivolutionTree rendered', { currentDigimon, allDigimon, connections });

  useEffect(() => {
    console.log('Creating nodes');
    const digimonNames = Array.from(new Set(connections.flatMap(c => [c.from, c.to])));
    console.log('Digimon names:', digimonNames);
    
    const digimonByStage = stageOrder.map(stage => 
      digimonNames.filter(name => {
        const digimon = allDigimon.find(d => d.name === name);
        return digimon && digimon.digivolutionStage === stage;
      })
    );
    console.log('Digimon by stage:', digimonByStage);

    const totalWidth = window.innerWidth * 0.8;
    const totalHeight = window.innerHeight * 0.8;
    const stageWidth = totalWidth / stageOrder.length;

    const newNodes = digimonByStage.flatMap((stageDigimon, stageIndex) => 
      stageDigimon.map((name, index) => {
        const digimon = allDigimon.find(d => d.name === name) || 
                        { id: `placeholder-${name}`, name, displayName: name, digivolutionStage: stageOrder[stageIndex] } as Digimon;
        return {
          digimon,
          x: stageWidth * (stageIndex + 0.5) + window.innerWidth * 0.1,
          y: (index + 1) * totalHeight / (stageDigimon.length + 1) + window.innerHeight * 0.1
        };
      })
    );

    console.log('New nodes:', newNodes);
    setNodes(newNodes);
  }, [allDigimon, connections]);

  useEffect(() => {
    console.log('Drawing connections');
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);

    // Draw connections
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 2;

    connections.forEach(connection => {
      const startNode = nodes.find(node => node.digimon.name === connection.from);
      const endNode = nodes.find(node => node.digimon.name === connection.to);

      if (startNode && endNode) {
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo(endNode.x, endNode.y);
        ctx.stroke();

        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    ctx.restore();
  }, [nodes, connections, offset]);

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

  console.log('Rendering nodes:', nodes);

  return (
    <div 
      className="digivolution-tree"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} />
      {nodes.map((node) => (
        <div
          key={`${node.digimon.id}-${node.digimon.name}`}
          className={`digimon-node ${node.digimon.name === currentDigimon.name ? 'current' : ''}`}
          style={{ 
            left: node.x + offset.x - 32, 
            top: node.y + offset.y - 32 
          }}
        >
          <DigimonSprite name={node.digimon.name} scale={1} />
          <span>{node.digimon.displayName}</span>
        </div>
      ))}
    </div>
  );
};

export default DigivolutionTree;
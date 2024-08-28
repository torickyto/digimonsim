// BattleLog.tsx
import React, { useState, useRef, useEffect } from 'react';
import './BattleLog.css';

interface LogEntry {
  id: number;
  message: string;
}

interface BattleLogProps {
  entries: LogEntry[];
}

const BattleLog: React.FC<BattleLogProps> = ({ entries }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 260, y: window.innerHeight / 2 - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const logRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && logRef.current) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (entriesRef.current) {
      entriesRef.current.scrollTop = entriesRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      className="battle-log"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      ref={logRef}
    >
      <div className="battle-log-header" onMouseDown={handleMouseDown}>
        Battle Log
      </div>
      <div className="battle-log-entries" ref={entriesRef}>
        {entries.map((entry) => (
          <div key={entry.id} className="battle-log-entry">
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleLog;
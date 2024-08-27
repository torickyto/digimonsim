import React from 'react';
import { Digimon } from '../shared/types';

interface DigivolutionConnection {
  from: string;
  to: string;
}

interface DigivolutionWebProps {
  connections: DigivolutionConnection[];
}

export const DigivolutionWeb: React.FC<DigivolutionWebProps> = ({ connections }) => {
  return (
    <div className="digivolution-web">
      {connections.map((connection, index) => (
        <div key={index} className="digivolution-connection">
          {connection.from} → {connection.to}
        </div>
      ))}
    </div>
  );
};

export const getDigivolutionConnections = (): DigivolutionConnection[] => {
  return [
    { from: 'pagumon', to: 'impmon' },
    { from: 'koromon', to: 'agumon' },
    { from: 'impmon', to: 'devimon' },
    { from: 'impmon', to: 'vilemon' },
    { from: 'impmon', to: 'revolmon' },
    { from: 'impmon', to: 'wizardmon' },
    { from: 'goblimon', to: 'vilemon' },
    { from: 'revolmon', to: 'superstarmon' },
    { from: 'devimon', to: 'matadormon' },
    { from: 'devimon', to: 'skullknightmon' },
    { from: 'matadormon', to: 'beelzemon' },
    { from: 'sangloupmon', to: 'matadormon' },

  ];
};

export default DigivolutionWeb;
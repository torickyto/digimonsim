import React from 'react';
import { Digimon } from '../shared/types';

export interface DigivolutionConnection {
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

    //in training
    { from: 'pagumon', to: 'impmon' },
    { from: 'pagumon', to: 'goblimon' },


    { from: 'koromon', to: 'agumon' },
    { from: 'koromon', to: 'kamemon' },


    { from: 'tsunomon', to: 'gabumon' },


    { from: 'tokomon', to: 'patamon' },


    { from: 'minomon', to: 'tentomon' },


    { from: 'gummymon', to: 'terriermon' },

    //rookie
    { from: 'impmon', to: 'devimon' },
    { from: 'impmon', to: 'vilemon' },
    { from: 'impmon', to: 'revolmon' },
    { from: 'impmon', to: 'wizardmon' },


    { from: 'goblimon', to: 'vilemon' },


    { from: 'agumon', to: 'greymon' },


    { from: 'kamemon', to: 'gawappamon' },


    { from: 'gabumon', to: 'garurumon' },


    { from: 'patamon', to: 'angemon' },


    { from: 'terriermon', to: 'gargomon' },


    //champion
    { from: 'devimon', to: 'skullknightmon' },
    { from: 'revolmon', to: 'superstarmon' },

    { from: 'greymon', to: 'metalgreymon' },

    { from: 'gawappamon', to: 'shawujingmon' },

    { from: 'sangloupmon', to: 'matadormon' },

    //ultimate

    { from: 'matadormon', to: 'beelzemon' },

    { from: 'metalgreymon', to: 'kimeramon' },
    { from: 'metalgreymon', to: 'wargreymon' },

    { from: 'shawujingmon', to: 'jumbogamemon' },

  ];
};

export default DigivolutionWeb;
import { DigimonTemplate } from '../shared/types';
import { DigimonTemplates } from './DigimonTemplate';

export interface EggType {
  id: number;
  name: string;
  description: string;
  possibleOutcomes: string[]; 
}

export const EggTypes: EggType[] = [
  {
    id: 0,
    name: "Dragon's Egg",
    description: "A warm egg with a scaly pattern.",
    possibleOutcomes: ['koromon', 'tsunomon', 'agumon', 'gabumon']
  },
  {
    id: 1,
    name: "Beast's Egg",
    description: "A furry egg that occasionally twitches.",
    possibleOutcomes: ['tsunomon', 'pagumon', 'gabumon', 'terriermon']
  },
  {
    id: 2,
    name: "Bird's Egg",
    description: "A lightweight egg with a feathery texture.",
    possibleOutcomes: ['tokomon', 'patamon', 'tentomon']
  },
];

export const getEggType = (id: number): EggType | undefined => {
  return EggTypes.find(egg => egg.id === id);
};

export const getRandomOutcome = (eggType: EggType): DigimonTemplate | undefined => {
  const randomIndex = Math.floor(Math.random() * eggType.possibleOutcomes.length);
  const chosenDigimonName = eggType.possibleOutcomes[randomIndex];
  return DigimonTemplates[chosenDigimonName];
};
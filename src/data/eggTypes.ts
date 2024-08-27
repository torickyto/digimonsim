import { DigimonTemplate } from '../shared/types';
import { DigimonTemplates } from './DigimonTemplate';

export interface EggType {
  id: number;
  name: string;
  possibleOutcomes: string[]; 
}

export const EggTypes: EggType[] = [
  {
    id: 0,
    name: "Red Egg",
    possibleOutcomes: ['koromon', 'tsunomon']
  },
  {
    id: 1,
    name: "Pyro Egg",
    possibleOutcomes: ['tsunomon', 'pagumon', 'gabumon', 'terriermon']
  },
  {
    id: 2,
    name: "Magma Egg",
    possibleOutcomes: ['tokomon', 'patamon', 'tentomon']
  },
  {
    id: 3,
    name: "Nature Egg",
    possibleOutcomes: ['gomamon', 'gabumon', 'elecmon']
  },
  {
    id: 4,
    name: "Striped Egg",
    possibleOutcomes: ['wizardmon', 'salamon', 'gatomon']
  },
  {
    id: 5,
    name: "Legendary Egg",
    possibleOutcomes: ['wizardmon', 'salamon', 'gatomon']
  },
  {
    id: 6,
    name: "Orange Egg",
    possibleOutcomes: ['palmon', 'tentomon', 'mushroomon']
  },
  {
    id: 7,
    name: "Terra Egg",
    possibleOutcomes: ['elecmon', 'tapirmon', 'terriermon']
  },
  {
    id: 8,
    name: "Titan Egg",
    possibleOutcomes: ['agumon', 'veemon', 'monodramon']
  },
  {
    id: 9,
    name: "Cloudy Egg",
    possibleOutcomes: ['gomamon', 'betamon', 'syakomon']
  },
  {
    id: 10,
    name: "Striped Egg",
    possibleOutcomes: ['hagurumon', 'guardromon', 'mekanorimon']
  },
  {
    id: 11,
    name: "Cursed Egg",
    possibleOutcomes: ['devimon', 'impmon', 'keramon']
  },
  {
    id: 12,
    name: "Green Egg",
    possibleOutcomes: ['gatomon', 'salamon', 'angewomon']
  },
  {
    id: 13,
    name: "Verdant Egg",
    possibleOutcomes: ['agumon', 'coronamon', 'flamemon']
  },
  {
    id: 14,
    name: "Gaia Egg",
    possibleOutcomes: ['patamon', 'biyomon', 'hawkmon']
  },
  {
    id: 15,
    name: "Lovely Egg",
    possibleOutcomes: ['kimeramon']
  },
  {
    id: 16,
    name: "Striped Egg",
    possibleOutcomes: ['bakemon', 'phantomon', 'wizardmon']
  },
  {
    id: 17,
    name: "Techno Egg",
    possibleOutcomes: ['hagurumon', 'guardromon', 'andromon']
  },
  {
    id: 18,
    name: "Blue Egg",
    possibleOutcomes: ['palmon', 'lalamon', 'veggimon']
  },
  {
    id: 19,
    name: "Sky Egg",
    possibleOutcomes: ['gomamon', 'syakomon', 'whamon']
  },
  {
    id: 20,
    name: "Stratos Egg",
    possibleOutcomes: ['elecmon', 'thundermon', 'veedramon']
  },
  {
    id: 21,
    name: "Nimbus Egg",
    possibleOutcomes: ['gotsumon', 'ogremon', 'ankylomon']
  },
  {
    id: 22,
    name: "Striped Egg",
    possibleOutcomes: ['keramon', 'tentomon', 'hagurumon']
  },
  {
    id: 23,
    name: "Rune Egg",
    possibleOutcomes: ['flamedramon', 'agumon', 'greymon']
  },
  {
    id: 24,
    name: "Navy Egg",
    possibleOutcomes: ['raidramon', 'garurumon', 'veedramon']
  },
  {
    id: 25,
    name: "Aqua Egg",
    possibleOutcomes: ['garudamon', 'biyomon', 'birdramon']
  },
  {
    id: 26,
    name: "Deep Sea Egg",
    possibleOutcomes: ['togemon', 'lillymon', 'palmon']
  },
  {
    id: 27,
    name: "Happy Egg",
    possibleOutcomes: ['tentomon', 'kabuterimon', 'megakabuterimon']
  },
  {
    id: 28,
    name: "Golden Egg",
    possibleOutcomes: ['submarimon', 'whamon', 'gomamon']
  },
  {
    id: 29,
    name: "Star Egg",
    possibleOutcomes: ['magnamon', 'patamon', 'angemon']
  },
  {
    id: 30,
    name: "Purple Egg",
    possibleOutcomes: ['nanimon', 'gatomon', 'magnadramon']
  },
  {
    id: 31,
    name: "Shadow Egg",
    possibleOutcomes: ['mantaraymon', 'sylphymon', 'shakkoumon']
  },
  {
    id: 32,
    name: "Abyss Egg",
    possibleOutcomes: ['magnamon', 'rapidmon', 'goldramon']
  },
  {
    id: 33,
    name: "Dragon Egg",
    possibleOutcomes: ['icedevimon', 'crystalgatomon', 'crystalkabuterimon']
  },
  {
    id: 34,
    name: "Chrome Egg",
    possibleOutcomes: ['skullgreymon', 'blackwargraymon', 'cresgarurumon']
  },
  {
    id: 35,
    name: "Stamped Egg",
    possibleOutcomes: ['phoenixmon', 'garudamon', 'meramon']
  },
  {
    id: 36,
    name: "Pink Egg",
    possibleOutcomes: ['seraphimon', 'cherubimon', 'ophanimon']
  },
  {
    id: 37,
    name: "Fae Egg",
    possibleOutcomes: ['devimon', 'vamdemon', 'infermon']
  },
  {
    id: 38,
    name: "Void Egg",
    possibleOutcomes: ['icedevimon', 'crystalgatomon', 'crystalkabuterimon']
  },
  {
    id: 39,
    name: "Ancient Egg",
    possibleOutcomes: ['skullgreymon', 'blackwargraymon', 'cresgarurumon']
  },
  {
    id: 40,
    name: "Regal Egg",
    possibleOutcomes: ['phoenixmon', 'garudamon', 'meramon']
  },
  {
    id: 41,
    name: "Spotted Egg",
    possibleOutcomes: ['seraphimon', 'cherubimon', 'ophanimon']
  },
  {
    id: 42,
    name: "Grey Egg",
    possibleOutcomes: ['devimon', 'vamdemon', 'infermon']
  },
  {
    id: 43,
    name: "Weathered Egg",
    possibleOutcomes: ['icedevimon', 'crystalgatomon', 'crystalkabuterimon']
  },
  {
    id: 44,
    name: "Forgotten Egg",
    possibleOutcomes: ['skullgreymon', 'blackwargraymon', 'cresgarurumon']
  },
  {
    id: 45,
    name: "Pandemonium Egg",
    possibleOutcomes: ['phoenixmon', 'garudamon', 'meramon']
  },
  {
    id: 46,
    name: "Rainbow Egg",
    possibleOutcomes: ['seraphimon', 'cherubimon', 'ophanimon']
  },
  {
    id: 47,
    name: "Celebration Egg",
    possibleOutcomes: ['devimon', 'vamdemon', 'infermon']
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
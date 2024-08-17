import { DigimonTemplate, DigimonType } from './types';
import { CardCollection } from './cardCollection';

export const DigimonTemplates: Record<string, DigimonTemplate> = {
  impmon: {
    name: 'impmon',
    displayName: 'Impmon',
    type: 'VIRUS' as DigimonType,
    baseHp: 40,
    startingCard: CardCollection.BADA_BOOM
  },
  beelzemon: {
    name: 'beelzemon',
    displayName: 'Beelzemon',
    type: 'VIRUS' as DigimonType,
    baseHp: 80,
    startingCard: CardCollection.CORONA_DESTROYER
  },
  wizardmon: {
    name: 'wizardmon',
    displayName: 'Wizardmon',
    type: 'DATA' as DigimonType,
    baseHp: 60,
    startingCard: CardCollection.THUNDER_BOMB
  },
  agumon: {
    name: 'agumon',
    displayName: 'Agumon',
    type: 'VACCINE' as DigimonType,
    baseHp: 50,
    startingCard: CardCollection.PEPPER_BREATH
  }
  // Add more Digimon templates as needed
};
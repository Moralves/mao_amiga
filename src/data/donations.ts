import AsyncStorage from '@react-native-async-storage/async-storage';
import { DonationItem } from '../types/types';

const storageKey = (pointId: string) => `donations:point:${pointId}`;

export async function getDonations(pointId: string): Promise<DonationItem[]> {
  const stored = await AsyncStorage.getItem(storageKey(pointId));
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error('Dados de doações inválidos.');
  return parsed as DonationItem[];
}

export async function saveDonation(pointId: string, itemType: string, quantity: number): Promise<void> {
  const donation: DonationItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    pointId,
    itemType: itemType.trim(),
    quantity,
    createdAt: new Date().toISOString(),
  };
  const current = await getDonations(pointId);
  await AsyncStorage.setItem(storageKey(pointId), JSON.stringify([donation, ...current]));
}

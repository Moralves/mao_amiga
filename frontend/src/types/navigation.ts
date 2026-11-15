import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Ponto } from './ponto';
import type { Doacao } from './doacao';

export type RootStackParamList = {
  List: undefined;
  Detail: { pontoId: number; ponto?: Ponto };
  Donation: { ponto?: Ponto | null; returnScreen?: keyof RootStackParamList } | undefined;
  PointItems: { pontoId: number; pontoNome: string };
  MyDonations: undefined;
  DonationDetail: { doacao: Doacao; returnScreen?: keyof RootStackParamList };
};

export type ListScreenProps = NativeStackScreenProps<RootStackParamList, 'List'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;
export type DonationScreenProps = NativeStackScreenProps<RootStackParamList, 'Donation'>;
export type PointItemsScreenProps = NativeStackScreenProps<RootStackParamList, 'PointItems'>;
export type MyDonationsScreenProps = NativeStackScreenProps<RootStackParamList, 'MyDonations'>;
export type DonationDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'DonationDetail'>;

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Ponto } from './ponto';
import type { Doacao } from './doacao';

export type RootStackParamList = {
  List: undefined;
  Detail: { id: string };
  PointForm: { ponto?: Ponto } | undefined;
  Donation:
    | {
        ponto?: Ponto | null;
        doacao?: Doacao;
        returnScreen?: keyof RootStackParamList;
      }
    | undefined;
  PointItems: { pontoId: string; pontoNome: string };
  MyDonations: undefined;
  DonationDetail: { id: string };
};

export type ListScreenProps = NativeStackScreenProps<RootStackParamList, 'List'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;
export type PointFormScreenProps = NativeStackScreenProps<RootStackParamList, 'PointForm'>;
export type DonationScreenProps = NativeStackScreenProps<RootStackParamList, 'Donation'>;
export type PointItemsScreenProps = NativeStackScreenProps<RootStackParamList, 'PointItems'>;
export type MyDonationsScreenProps = NativeStackScreenProps<RootStackParamList, 'MyDonations'>;
export type DonationDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'DonationDetail'>;

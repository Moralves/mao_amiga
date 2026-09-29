import AsyncStorage from '@react-native-async-storage/async-storage';
import { DonationItem } from '../types/types';

const CHAVE_DOACOES = 'doacoes';
const PREFIXO_ANTIGO = 'donations:point:';
let filaDeSalvamento: Promise<void> = Promise.resolve();

type NovaDoacao = Pick<DonationItem, 'pointId' | 'itemType' | 'quantity'>;
type DoacaoAntiga = Omit<DonationItem, 'criadoEm'> & { createdAt: string };

function lerArray<T>(valor: string): T[] {
  const dados: unknown = JSON.parse(valor);
  if (!Array.isArray(dados)) throw new Error('Dados de doações inválidos.');
  return dados as T[];
}

export async function listarDoacoes(): Promise<DonationItem[]> {
  const salvas = await AsyncStorage.getItem(CHAVE_DOACOES);
  if (salvas !== null) return lerArray<DonationItem>(salvas);

  // Os registros da versão anterior ficavam em um array separado por ponto.
  const chavesAntigas = (await AsyncStorage.getAllKeys()).filter((chave) => chave.startsWith(PREFIXO_ANTIGO));
  if (chavesAntigas.length === 0) return [];

  const doacoesAntigas = await Promise.all(chavesAntigas.map(async (chave) => {
    const valor = await AsyncStorage.getItem(chave);
    if (valor === null) return [];
    return lerArray<DoacaoAntiga>(valor).map(({ createdAt, ...doacao }) => ({
      ...doacao,
      criadoEm: createdAt,
    }));
  }));
  const doacoes = doacoesAntigas.flat().sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(doacoes));
  return doacoes;
}

export function salvarDoacao(doacao: NovaDoacao): Promise<DonationItem> {
  // Gravações simultâneas esperam sua vez para não perder registros.
  const salvamento = filaDeSalvamento.then(async () => {
    const doacoes = await listarDoacoes();
    let id: string;
    do {
      id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    } while (doacoes.some((salva) => salva.id === id));

    const novaDoacao: DonationItem = {
      ...doacao,
      itemType: doacao.itemType.trim(),
      id,
      criadoEm: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify([...doacoes, novaDoacao]));
    return novaDoacao;
  });
  filaDeSalvamento = salvamento.then(() => undefined, () => undefined);
  return salvamento;
}

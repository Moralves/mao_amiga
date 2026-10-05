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

/**
 * Remove uma doação do AsyncStorage a partir do seu identificador único (id).
 * Utiliza a mesma fila sequencial (filaDeSalvamento) para evitar condições de corrida (race conditions).
 * 
 * @param id Identificador da doação que deve ser excluída
 */
export function excluirDoacao(id: string): Promise<void> {
  const exclusao = filaDeSalvamento.then(async () => {
    // 1. Carrega todas as doações atuais do AsyncStorage
    const doacoes = await listarDoacoes();
    // 2. Filtra a lista removendo o item com o id especificado
    const doacoesFiltradas = doacoes.filter((salva) => salva.id !== id);
    // 3. Persiste a lista atualizada de volta no AsyncStorage
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(doacoesFiltradas));
  });

  // Atualiza a fila para garantir que próximas operações aguardem esta exclusão
  filaDeSalvamento = exclusao.then(
    () => undefined,
    () => undefined
  );

  return exclusao;
}

/**
 * Atualiza os dados de uma doação existente no AsyncStorage.
 * Utiliza a mesma fila sequencial (filaDeSalvamento) para evitar condições de corrida.
 * 
 * @param doacaoAtualizada Doação contendo os dados modificados (mesmo id)
 */
export function atualizarDoacao(doacaoAtualizada: DonationItem): Promise<DonationItem> {
  const atualizacao = filaDeSalvamento.then(async () => {
    const doacoes = await listarDoacoes();
    const indice = doacoes.findIndex((d) => d.id === doacaoAtualizada.id);
    if (indice === -1) {
      throw new Error(`Doação com id ${doacaoAtualizada.id} não encontrada para atualização.`);
    }
    const novasDoacoes = [...doacoes];
    novasDoacoes[indice] = {
      ...doacaoAtualizada,
      itemType: doacaoAtualizada.itemType.trim(),
    };
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(novasDoacoes));
    return novasDoacoes[indice];
  });

  filaDeSalvamento = atualizacao.then(
    () => undefined,
    () => undefined
  );

  return atualizacao;
}

export const editarDoacao = atualizarDoacao;


import { Doacao, NovaDoacao } from '../types/doacao';
import { lerJSON, salvarJSON } from './storage';

const CHAVE_DOACOES = 'doacoes';
let filaDeSalvamento: Promise<unknown> = Promise.resolve();

interface RegistroLegado {
  id: string;
  itemType?: string;
  tipoItem?: string;
  quantity?: number;
  quantidade?: number;
  pointId?: string;
  pontoDestino?: string;
  createdAt?: string;
  criadoEm?: string;
}

/**
 * Normaliza registros legados para o formato oficial do Projeto N1:
 * { id, tipoItem, quantidade, pontoDestino, criadoEm }
 */
function normalizarRegistro(registro: RegistroLegado): Doacao {
  return {
    id: String(registro.id),
    tipoItem: (registro.tipoItem || registro.itemType || '').trim(),
    quantidade: Number(registro.quantidade ?? registro.quantity ?? 1),
    pontoDestino: (registro.pontoDestino || registro.pointId || 'Ponto Geral').trim(),
    criadoEm: registro.criadoEm || registro.createdAt || new Date().toISOString(),
  };
}

/**
 * Lista todas as doações salvas localmente no aparelho.
 */
export async function listarDoacoes(): Promise<Doacao[]> {
  const dados = await lerJSON<RegistroLegado[]>(CHAVE_DOACOES, []);
  if (!Array.isArray(dados)) {
    return [];
  }
  return dados.map(normalizarRegistro);
}

/**
 * Salva uma nova doação no armazenamento local com id único e data de criação.
 */
export function salvarDoacao(dados: NovaDoacao): Promise<Doacao> {
  const salvamento = filaDeSalvamento.then(async () => {
    const doacoes = await listarDoacoes();
    let id: string;
    do {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    } while (doacoes.some((d) => d.id === id));

    const novaDoacao: Doacao = {
      id,
      tipoItem: dados.tipoItem.trim(),
      quantidade: Number(dados.quantidade),
      pontoDestino: dados.pontoDestino.trim(),
      criadoEm: new Date().toISOString(),
    };

    const atualizadas = [...doacoes, novaDoacao];
    await salvarJSON(CHAVE_DOACOES, atualizadas);
    return novaDoacao;
  });

  filaDeSalvamento = salvamento.then(
    () => undefined,
    () => undefined
  );

  return salvamento;
}

/**
 * Atualiza os dados de uma doação existente.
 */
export function atualizarDoacao(doacaoAtualizada: Doacao): Promise<Doacao> {
  const atualizacao = filaDeSalvamento.then(async () => {
    const doacoes = await listarDoacoes();
    const indice = doacoes.findIndex((d) => d.id === doacaoAtualizada.id);
    if (indice === -1) {
      throw new Error(`Doação com id ${doacaoAtualizada.id} não encontrada para atualização.`);
    }

    const doacaoNormalizada: Doacao = {
      id: doacaoAtualizada.id,
      tipoItem: doacaoAtualizada.tipoItem.trim(),
      quantidade: Number(doacaoAtualizada.quantidade),
      pontoDestino: doacaoAtualizada.pontoDestino.trim(),
      criadoEm: doacaoAtualizada.criadoEm,
    };

    const novasDoacoes = [...doacoes];
    novasDoacoes[indice] = doacaoNormalizada;
    await salvarJSON(CHAVE_DOACOES, novasDoacoes);
    return doacaoNormalizada;
  });

  filaDeSalvamento = atualizacao.then(
    () => undefined,
    () => undefined
  );

  return atualizacao;
}

export const editarDoacao = atualizarDoacao;

/**
 * Remove uma doação pelo seu ID.
 */
export function excluirDoacao(id: string): Promise<void> {
  const exclusao = filaDeSalvamento.then(async () => {
    const doacoes = await listarDoacoes();
    const filtradas = doacoes.filter((d) => d.id !== id);
    await salvarJSON(CHAVE_DOACOES, filtradas);
  });

  filaDeSalvamento = exclusao.then(
    () => undefined,
    () => undefined
  );

  return exclusao;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FiltroMinhasDoacoesDraft, FiltroPontosDraft, RascunhoDoacao } from '../types/types';

const CHAVE_RASCUNHO_DOACAO = '@mao_amiga:rascunho_doacao';
const CHAVE_FILTRO_PONTOS = '@mao_amiga:filtro_pontos';
const CHAVE_FILTRO_MINHAS_DOACOES = '@mao_amiga:filtro_minhas_doacoes';

/**
 * Salva o rascunho da doação em andamento (tipo do item, quantidade e ponto selecionado).
 */
export async function salvarRascunhoDoacao(rascunho: RascunhoDoacao): Promise<void> {
  try {
    const itemTypeClean = rascunho.itemType?.trim() ?? '';
    const quantityClean = rascunho.quantity?.trim() ?? '';

    // Se o rascunho estiver totalmente limpo, remove do storage
    if (!itemTypeClean && !quantityClean && !rascunho.pointId) {
      await limparRascunhoDoacao();
      return;
    }

    const dados: RascunhoDoacao = {
      pointId: rascunho.pointId ?? null,
      itemType: rascunho.itemType ?? '',
      quantity: rascunho.quantity ?? '',
      atualizadoEm: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CHAVE_RASCUNHO_DOACAO, JSON.stringify(dados));
  } catch (error) {
    console.error('Erro ao salvar rascunho de doação:', error);
  }
}

/**
 * Obtém o rascunho de doação em andamento, se existir.
 */
export async function obterRascunhoDoacao(): Promise<RascunhoDoacao | null> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE_RASCUNHO_DOACAO);
    if (!raw) return null;
    return JSON.parse(raw) as RascunhoDoacao;
  } catch (error) {
    console.error('Erro ao carregar rascunho de doação:', error);
    return null;
  }
}

/**
 * Remove o rascunho de doação.
 */
export async function limparRascunhoDoacao(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE_RASCUNHO_DOACAO);
  } catch (error) {
    console.error('Erro ao limpar rascunho de doação:', error);
  }
}

/**
 * Salva o filtro e busca em andamento da lista de pontos de coleta.
 */
export async function salvarFiltroPontos(filtro: FiltroPontosDraft): Promise<void> {
  try {
    if (!filtro.searchQuery.trim() && filtro.selectedCategory === 'Todos') {
      await limparFiltroPontos();
      return;
    }
    await AsyncStorage.setItem(CHAVE_FILTRO_PONTOS, JSON.stringify(filtro));
  } catch (error) {
    console.error('Erro ao salvar filtro de pontos:', error);
  }
}

/**
 * Obtém o filtro e busca em andamento da lista de pontos de coleta.
 */
export async function obterFiltroPontos(): Promise<FiltroPontosDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE_FILTRO_PONTOS);
    if (!raw) return null;
    return JSON.parse(raw) as FiltroPontosDraft;
  } catch (error) {
    console.error('Erro ao carregar filtro de pontos:', error);
    return null;
  }
}

/**
 * Limpa o filtro salvo de pontos de coleta.
 */
export async function limparFiltroPontos(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE_FILTRO_PONTOS);
  } catch (error) {
    console.error('Erro ao limpar filtro de pontos:', error);
  }
}

/**
 * Salva a busca em andamento da tela Minhas Doações.
 */
export async function salvarFiltroMinhasDoacoes(filtro: FiltroMinhasDoacoesDraft): Promise<void> {
  try {
    if (!filtro.searchQuery.trim()) {
      await limparFiltroMinhasDoacoes();
      return;
    }
    await AsyncStorage.setItem(CHAVE_FILTRO_MINHAS_DOACOES, JSON.stringify(filtro));
  } catch (error) {
    console.error('Erro ao salvar filtro de minhas doações:', error);
  }
}

/**
 * Obtém a busca em andamento da tela Minhas Doações.
 */
export async function obterFiltroMinhasDoacoes(): Promise<FiltroMinhasDoacoesDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE_FILTRO_MINHAS_DOACOES);
    if (!raw) return null;
    return JSON.parse(raw) as FiltroMinhasDoacoesDraft;
  } catch (error) {
    console.error('Erro ao carregar filtro de minhas doações:', error);
    return null;
  }
}

/**
 * Limpa a busca salva de minhas doações.
 */
export async function limparFiltroMinhasDoacoes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE_FILTRO_MINHAS_DOACOES);
  } catch (error) {
    console.error('Erro ao limpar filtro de minhas doações:', error);
  }
}

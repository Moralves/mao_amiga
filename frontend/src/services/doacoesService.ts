import { get, post, put, del } from './api';
import { Doacao, NovaDoacao } from '../types/doacao';
import { PagedResponse } from '../types/ponto';

export function listarPagina(
  filtro: string = '',
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<Doacao>> {
  const termo = filtro.trim();
  const query = `filtro=${encodeURIComponent(termo)}&page=${page}&size=${size}`;
  return get<PagedResponse<Doacao>>(`/api/v1/doacoes/filtro?${query}`);
}

export function buscarPorId(id: string): Promise<Doacao> {
  return get<Doacao>(`/api/v1/doacoes/${id}`);
}

export function cadastrar(dados: NovaDoacao): Promise<Doacao> {
  return post<Doacao>('/api/v1/doacoes', dados);
}

export function editar(id: string, dados: NovaDoacao): Promise<Doacao> {
  return put<Doacao>(`/api/v1/doacoes/${id}`, dados);
}

export function excluir(id: string): Promise<void> {
  return del(`/api/v1/doacoes/${id}`);
}

// Aliases auxiliares
export const buscarPaginaDoacoes = listarPagina;
export const buscarDoacaoPorId = buscarPorId;
export const cadastrarDoacao = cadastrar;
export const editarDoacao = editar;
export const excluirDoacao = excluir;

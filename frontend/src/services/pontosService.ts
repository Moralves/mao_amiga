import { get, post, put, del } from './api';
import { PagedResponse, Ponto, PontoInput } from '../types/ponto';

export function listar(): Promise<Ponto[]> {
  return get<Ponto[]>('/api/v1/pontos');
}

export function buscarPagina(
  filtro: string = '',
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<Ponto>> {
  const termo = filtro.trim();
  const query = `filtro=${encodeURIComponent(termo)}&page=${page}&size=${size}`;
  return get<PagedResponse<Ponto>>(`/api/v1/pontos/filtro?${query}`);
}

export function buscarPorId(id: string): Promise<Ponto> {
  return get<Ponto>(`/api/v1/pontos/${id}`);
}

export function cadastrar(dados: PontoInput): Promise<Ponto> {
  return post<Ponto>('/api/v1/pontos', dados);
}

export function editar(id: string, dados: PontoInput): Promise<Ponto> {
  return put<Ponto>(`/api/v1/pontos/${id}`, dados);
}

export function excluir(id: string): Promise<void> {
  return del(`/api/v1/pontos/${id}`);
}

// Aliases auxiliares para compatibilidade
export const listarPontos = listar;
export const buscarPaginaPontos = buscarPagina;
export const buscarPontoPorId = buscarPorId;
export const cadastrarPonto = cadastrar;
export const editarPonto = editar;
export const excluirPonto = excluir;

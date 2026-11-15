import { apiFetch, ApiError } from './api';
import { PagedResponse, Ponto } from '../types/ponto';

export interface ListarPontosParams {
  page?: number;
  size?: number;
  sort?: string;
  bairro?: string;
  tipo?: string;
}

/**
 * Lista os pontos de coleta e distribuição da API Spring Boot com suporte a paginação e filtros.
 */
export async function listarPontos(params?: ListarPontosParams): Promise<PagedResponse<Ponto>> {
  const queryParts: string[] = [];

  if (params?.page !== undefined) {
    queryParts.push(`page=${params.page}`);
  }
  if (params?.size !== undefined) {
    queryParts.push(`size=${params.size}`);
  }
  if (params?.sort) {
    queryParts.push(`sort=${encodeURIComponent(params.sort)}`);
  }
  if (params?.bairro) {
    queryParts.push(`bairro=${encodeURIComponent(params.bairro)}`);
  }
  if (params?.tipo && params.tipo !== 'Todos') {
    queryParts.push(`tipo=${encodeURIComponent(params.tipo)}`);
  }

  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiFetch<PagedResponse<Ponto>>(`/pontos${query}`);
}

/**
 * Busca um ponto específico pelo seu identificador na API Spring Boot.
 * Retorna null quando a API responder com status 404 (não encontrado).
 */
export async function buscarPontoPorId(id: number | string): Promise<Ponto | null> {
  try {
    return await apiFetch<Ponto>(`/pontos/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

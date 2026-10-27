import { Platform } from 'react-native';

// URL base da API Spring Boot
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Função centralizada para requisições HTTP utilizando fetch.
 * Este é o único arquivo do aplicativo autorizado a chamar fetch.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Falha na conexão com o servidor';
    throw new ApiError(`Não foi possível conectar ao servidor: ${errMessage}`, 0);
  }

  if (response.status === 404) {
    throw new ApiError('Recurso não encontrado', 404);
  }

  if (!response.ok) {
    throw new ApiError(`Erro na requisição: ${response.status} ${response.statusText}`, response.status);
  }

  return (await response.json()) as T;
}

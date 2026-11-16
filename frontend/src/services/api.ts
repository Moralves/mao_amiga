// URL do servidor centralizada em um único lugar.
// Ao testar no celular físico pela rede local, troque 'localhost' pelo IP do computador (ex.: 'http://192.168.1.15:8080').
export const API_BASE_URL = 'http://localhost:8080';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Falha de conexão com a API';
    throw new ApiError(`Não foi possível conectar ao servidor (${msg})`, 0);
  }

  if (!response.ok) {
    let errorMessage = `Erro ${response.status}`;
    try {
      const data = await response.json();
      if (data && typeof data.message === 'string' && data.message.trim() !== '') {
        errorMessage = data.message;
      }
    } catch {
      // mantém mensagem padrão com o código HTTP
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

export function post<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function put<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function del(endpoint: string): Promise<void> {
  return request<void>(endpoint, { method: 'DELETE' });
}

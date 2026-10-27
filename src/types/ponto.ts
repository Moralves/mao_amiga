export interface Ponto {
  id: number;
  nome: string;
  endereco: string;
  bairro: string;
  horarioFuncionamento: string;
  tipo: string;
  itens: string;
  telefone: string;
  descricao: string;
  latitude: number;
  longitude: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

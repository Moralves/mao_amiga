export interface Doacao {
  id: string;
  tipoItem: string;
  quantidade: number;
  pontoDestino: string;
  criadoEm: string;
}

export type NovaDoacao = Omit<Doacao, 'id' | 'criadoEm'>;

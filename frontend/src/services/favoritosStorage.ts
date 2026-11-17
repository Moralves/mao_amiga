import { lerJSON, salvarJSON } from './storage';

const CHAVE_FAVORITOS = 'pontos_favoritos_ids';

export async function listarFavoritos(): Promise<string[]> {
  const ids = await lerJSON<string[]>(CHAVE_FAVORITOS, []);
  if (!Array.isArray(ids)) {
    return [];
  }
  return ids.filter((id): id is string => typeof id === 'string' && id.trim() !== '');
}

export async function alternarFavorito(id: string): Promise<string[]> {
  const atuais = await listarFavoritos();
  const jaExiste = atuais.includes(id);
  const atualizados = jaExiste
    ? atuais.filter((item) => item !== id)
    : [...atuais, id];

  await salvarJSON(CHAVE_FAVORITOS, atualizados);
  return atualizados;
}

export async function removerFavorito(id: string): Promise<string[]> {
  const atuais = await listarFavoritos();
  const atualizados = atuais.filter((item) => item !== id);
  await salvarJSON(CHAVE_FAVORITOS, atualizados);
  return atualizados;
}

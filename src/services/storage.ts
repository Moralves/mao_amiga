import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lê e desserializa um valor JSON armazenado no AsyncStorage.
 * Se a chave não existir ou o conteúdo for inválido, retorna o valor padrão.
 */
export async function lerJSON<T>(chave: string, valorPadrao: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(chave);
    if (raw === null) {
      return valorPadrao;
    }
    return JSON.parse(raw) as T;
  } catch {
    return valorPadrao;
  }
}

/**
 * Serializa e persiste um valor no AsyncStorage em formato JSON.
 */
export async function salvarJSON<T>(chave: string, valor: T): Promise<void> {
  const serialized = JSON.stringify(valor);
  await AsyncStorage.setItem(chave, serialized);
}

/**
 * Remove um item do AsyncStorage a partir de sua chave.
 */
export async function removerItem(chave: string): Promise<void> {
  await AsyncStorage.removeItem(chave);
}

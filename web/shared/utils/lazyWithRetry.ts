/**
 * Wrapper para React.lazy que tenta recarregar o módulo em caso de falha.
 * Resolve o problema de "error loading dynamically imported module" que ocorre
 * durante deploys quando chunks antigos são removidos ou por instabilidades de rede.
 *
 * @param importFn Função que retorna a Promise do import dinâmico.
 * @param retries Número máximo de tentativas (padrão 3).
 * @param interval Tempo entre as tentativas em ms (padrão 1000).
 */
export function lazyWithRetry<T>(
  importFn: () => Promise<T>,
  retries = 3,
  interval = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retries > 0) {
          setTimeout(() => {
            lazyWithRetry(importFn, retries - 1, interval).then(resolve).catch(reject)
          }, interval)
        } else {
          reject(error)
        }
      })
  })
}

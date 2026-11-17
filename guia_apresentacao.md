# Guia de Apresentação Técnica — Projeto N2 (Instituto Mão Amiga)

Resumo rápido para consulta durante a apresentação na mesa do professor.

---

## 1. Arquitetura do Projeto

- **`api/` (Spring Boot 3 + Java 21 + H2 em arquivo):**
  - `entity/`: `Ponto` e `Doacao` com identificadores `UUID`.
  - `dto/`: `PontoRequestDTO`, `PontoResponseDTO`, `DoacaoRequestDTO` e `DoacaoResponseDTO` (`record` + Bean Validation).
  - `repository/`: `PontoRepository` e `DoacaoRepository` com `@Query` case-insensitive e paginação.
  - `service/`: `PontoService` e `DoacaoService` (preenchendo `criadoEm` com `LocalDateTime.now()` no servidor e lançando `404` quando inexistente).
  - `controller/`: `PontoController` (`/api/v1/pontos`) e `DoacaoController` (`/api/v1/doacoes`).
  - `config/`: `DataInitializer` (carga inicial de 25 pontos em Goiânia) e `WebConfig` (CORS).
- **`frontend/` (React Native / Expo + TypeScript):**
  - `src/services/api.ts`: único arquivo que chama `fetch`, centralizando `API_BASE_URL` e exportando `get`, `post`, `put` e `del`.
  - `src/services/pontosService.ts` e `src/services/doacoesService.ts`: camada de serviço para todos os endpoints HTTP.
  - `src/services/favoritosStorage.ts`: persiste apenas a lista de `id`s (`string[]`) dos pontos favoritos no `AsyncStorage`.

---

## 2. Perguntas Frequentes da Avaliação

1. **Por que favoritos ficam no aparelho (`AsyncStorage`) e pontos/doações ficam na API?**
   - Pontos de coleta e doações são dados coletivos do Instituto que precisam estar sincronizados para todos. Já os favoritos são uma preferência local de quem usa aquele celular.
2. **Por que salvar só os `id`s dos favoritos no `AsyncStorage` em vez do objeto inteiro do ponto?**
   - Se salvássemos o objeto inteiro localmente e alguém editasse o horário ou excluísse o ponto na API, a tela "Meus pontos" mostraria dados velhos ou inválidos. Salvando apenas o `id` e buscando na API (`GET /api/v1/pontos/{id}`), garantimos dados sempre atualizados e tratamos o retorno `404` ocultando pontos removidos sem quebrar a tela.
3. **Por que `criadoEm` da doação é gerado no `DoacaoService` e não enviado pelo app?**
   - Para garantir integridade: o relógio do celular do usuário pode estar incorreto, e na edição (`PUT`) a data original do registro não pode ser sobrescrita.

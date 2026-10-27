# Guia de Apresentação Técnica - Integração com API Spring Boot e Arquitetura em Camadas (Mão Amiga)

Este guia documenta as melhorias arquiteturais e a integração do aplicativo com a API Spring Boot com banco H2 em memória.

---

## 1. Resumo da Solução
- **Backend Spring Boot**: API REST autônoma (`backend/`), desenvolvida com Spring Web, Spring Data JPA e H2 Database em memória. Não requer configuração externa de SQL e possui carga inicial de 8 pontos reais de Goiânia com coordenadas geográficas.
- **Frontend Expo / React Native**: Reorganizado em camadas (`types/`, `services/`, `screens/`), com TypeScript estrito (`strict: true`), navegação nativa desacoplada e consumo centralizado de API.

---

## 2. Arquitetura em Camadas (`src/`)

```text
mao_amiga/
├── backend/                                  # API Spring Boot (projeto separado)
│   ├── src/main/java/br/com/instituto/
│   │   ├── config/                           # DataInitializer (carga 8 pontos), WebConfig (CORS)
│   │   ├── controller/                       # PontoController (GET /pontos, GET /pontos/{id})
│   │   ├── dto/                              # PontoDTO (record)
│   │   ├── model/                            # Ponto (JPA Entity)
│   │   └── repository/                       # PontoRepository (Spring Data JPA)
│   └── pom.xml                               # Spring Boot 3.4.3, Java 17, H2, Data JPA, Web
├── App.tsx                                   # Apenas monta a navegação (Native Stack)
└── src/
    ├── types/
    │   ├── ponto.ts                          # Interface Ponto (espelha PontoDTO) e PagedResponse<T>
    │   ├── doacao.ts                         # Interface Doacao do Projeto N1
    │   └── navigation.ts                     # RootStackParamList e NativeStackScreenProps
    ├── services/
    │   ├── api.ts                            # ÚNICO arquivo que chama fetch (URL base configurada)
    │   ├── pontosService.ts                  # listarPontos() e buscarPontoPorId()
    │   ├── storage.ts                        # Funções genéricas lerJSON<T> e salvarJSON<T>
    │   └── doacoesStorage.ts                 # Persistência de doações no AsyncStorage via storage.ts
    ├── components/
    │   ├── PointCard.tsx                     # Card de exibição do ponto vindo da API
    │   ├── DonationCard.tsx                  # Card de exibição de doação
    │   └── DonationSummary.tsx               # Resumo dinâmico de doações e quantidades
    └── screens/
        ├── ListScreen.tsx                    # Lista pontos da API com tratamento de erro offline
        ├── DetailScreen.tsx                  # Busca ponto por id e trata 404 (ponto não encontrado)
        ├── DonationScreen.tsx                # Cadastro de doação com pontos vindos da API
        ├── PointItemsScreen.tsx              # Itens cadastrados para um ponto específico
        ├── MyDonationsScreen.tsx             # Histórico geral de doações salvas
        └── DonationDetailScreen.tsx          # Detalhes e exclusão confirmada de doação
```

---

## 3. Endpoints da API Spring Boot
1. `GET /pontos`
   - Retorno paginado (`content` e `page`).
   - Parâmetros aceitos na URL: `page`, `size` (padrão 20, máximo 50), `sort`, `bairro`, `tipo`.
2. `GET /pontos/{id}`
   - Retorna o DTO `record` do ponto.
   - Retorna status `404 Not Found` (e não 500) caso o id não exista.
3. Console H2: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:institutodb`
   - Usuário: `sa`, Senha: em branco.

---

## 4. Critérios de Aceite Atendidos
- [x] API Spring Boot separada com Spring Web, Spring Data JPA e H2.
- [x] Entidade `Ponto` com nome, endereço, bairro, horário de funcionamento, o que recebe/distribui, telefone, descrição, latitude e longitude.
- [x] Carga inicial com 8 pontos reais de Goiânia e coordenadas reais.
- [x] `GET /pontos` paginado no formato `content` e `page`, padrão 20 e teto de 50.
- [x] `GET /pontos/{id}` retorna DTO e responde 404 quando inexistente.
- [x] O controller devolve sempre `record` (DTO), nunca entidade JPA.
- [x] `tsconfig.json` com `strict: true` e `npx tsc --noEmit` rodando sem erros, sem `any` explícito e sem `// @ts-ignore`.
- [x] Estrutura `src/types/`, `src/services/`, `src/screens/`. `App.tsx` apenas monta a navegação.
- [x] Tipos `Ponto` (espelhando a API) e `Doacao` (Projeto N1: `{ id, tipoItem, quantidade, pontoDestino, criadoEm }`).
- [x] Armazenamento de doações em `src/services/doacoesStorage.ts`. Nenhuma tela importa `AsyncStorage`.
- [x] Desafio opcional: `storage.ts` com funções genéricas `lerJSON<T>` e `salvarJSON<T>`, e filtro de pontos por bairro e tipo.
- [x] Rotas tipadas com `RootStackParamList` e telas tipadas com `NativeStackScreenProps`.
- [x] Único arquivo chamando `fetch`: `src/services/api.ts`.
- [x] `pontosService.ts` com funções de listar e buscar por id. Nenhuma tela monta URL ou chama `fetch`.
- [x] Array fixo (`mockPoints.ts`) completamente removido.
- [x] Detalhe busca por id na API e exibe mensagem em caso de 404.
- [x] Escolha do ponto de destino no cadastro de doações usa os pontos da API.
- [x] Com a API desligada, a lista exibe mensagem de erro amigável com opção de tentar novamente, sem travar o app.
- [x] Cadastro com validação, histórico com edição/exclusão, filtros, totais e persistência local continuam funcionando.

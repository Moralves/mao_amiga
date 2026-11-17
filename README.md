# Instituto Mão Amiga — Projeto N2

Aplicativo mobile (Expo / React Native) e API REST (Spring Boot + H2) para gerenciamento de pontos de coleta/distribuição e registro de doações em Goiânia.

## Estrutura do Repositório

- **`api/`**: Projeto Spring Boot com banco de dados H2 gravando em arquivo (`jdbc:h2:file:./data/institutodb`).
- **`frontend/`**: Aplicativo mobile em React Native (Expo).

---

## Como Rodar a API e o Aplicativo

### 1. Como Rodar a API (`api/`)
- **Versão do Java:** Java 17 ou superior (configurado e testado com **Java 21**).
- **Comando para iniciar a API:**
  ```bash
  cd api
  .\mvnw.cmd spring-boot:run
  ```
  *(No Linux/macOS: `./mvnw spring-boot:run`, ou na raiz do repositório: `npm run api`).*
- **Endereços da API:**
  - **URL Base:** `http://localhost:8080`
  - **Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
  - **Console H2:** `http://localhost:8080/h2-console` (`JDBC URL`: `jdbc:h2:file:./data/institutodb`, `User Name`: `sa`, `Password`: em branco).

### 2. Como Rodar o App (`frontend/`) e Onde Trocar o IP
- **Comando para iniciar o app:**
  ```bash
  cd frontend
  npm install
  npx expo start
  ```
- **Onde trocar o IP do servidor:**
  - Abra o arquivo **`frontend/src/services/api.ts`** e altere a constante `API_BASE_URL`:
    ```ts
    export const API_BASE_URL = 'http://localhost:8080';
    ```
  - **No Navegador Web (`w` no terminal do Expo):** mantenha `http://localhost:8080` (os testes de integração foram realizados no navegador).
  - **No Celular Físico (Expo Go na mesma rede Wi-Fi):** substitua `localhost` pelo IP local do computador (ex.: `http://192.168.1.15:8080`).

---

## Endpoints de Pontos de Coleta (`[N2-1]` e `[N2-2]`)

| Método | URL Completa | Descrição | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:8080/api/v1/pontos` | Lista todos os pontos cadastrados | `200 OK` |
| `GET` | `http://localhost:8080/api/v1/pontos/filtro?filtro=...&page=0&size=10` | Busca paginada por nome ou bairro | `200 OK` |
| `GET` | `http://localhost:8080/api/v1/pontos/{id}` | Busca um ponto pelo seu `id` (`UUID`) | `200 OK` / `404 Not Found` |
| `POST` | `http://localhost:8080/api/v1/pontos` | Cadastra um novo ponto (`@Valid`) | `201 Created` / `400 Bad Request` |
| `PUT` | `http://localhost:8080/api/v1/pontos/{id}` | Atualiza os dados de um ponto existente | `200 OK` / `400` / `404` |
| `DELETE` | `http://localhost:8080/api/v1/pontos/{id}` | Remove um ponto pelo seu `id` | `204 No Content` / `404 Not Found` |

### Exemplos de Busca Paginada de Pontos (`[N2-2]`)

#### 1. Chamada sem filtro (padrão: 10 itens ordenados por `nome`)
```http
GET http://localhost:8080/api/v1/pontos/filtro
```
```json
{
  "content": [
    {
      "id": "e41f891a-12b0-4c9a-9f31-10a2b3c4d501",
      "nome": "Base Comunitária Setor Oeste",
      "endereco": "Av. Assis Chateaubriand, 620 - Setor Oeste, Goiânia - GO",
      "bairro": "Setor Oeste",
      "horario": "Seg a Sex, 8h às 18h",
      "tipo": "coleta"
    }
  ],
  "page": {
    "size": 10,
    "number": 0,
    "totalElements": 25,
    "totalPages": 3
  }
}
```

#### 2. Chamada filtrando por bairro
```http
GET http://localhost:8080/api/v1/pontos/filtro?filtro=bueno&page=0&size=10
```
```json
{
  "content": [
    {
      "id": "e41f891a-12b0-4c9a-9f31-10a2b3c4d503",
      "nome": "Centro de Arrecadação Bueno",
      "endereco": "Av. T-4, 1400 - Setor Bueno, Goiânia - GO",
      "bairro": "Setor Bueno",
      "horario": "Seg a Sáb, 9h às 19h",
      "tipo": "coleta"
    }
  ],
  "page": {
    "size": 10,
    "number": 0,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### 3. Chamada pedindo a segunda página (`page=1`) e ordenando por bairro (`sort=bairro,asc`)
```http
GET http://localhost:8080/api/v1/pontos/filtro?page=1&size=10&sort=bairro,asc
```
```json
{
  "content": [
    {
      "id": "e41f891a-12b0-4c9a-9f31-10a2b3c4d511",
      "nome": "Ponto de Coleta Campinas",
      "endereco": "Praça Joaquim Lúcio, s/n - Setor Campinas, Goiânia - GO",
      "bairro": "Setor Campinas",
      "horario": "Seg a Sex, 8h às 17h",
      "tipo": "coleta"
    }
  ],
  "page": {
    "size": 10,
    "number": 1,
    "totalElements": 25,
    "totalPages": 3
  }
}
```

---

## Endpoints de Doações (`[N2-5]`)

| Método | URL Completa | Descrição | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:8080/api/v1/doacoes/filtro?filtro=...&page=0&size=10` | Busca paginada por tipo de item (`criadoEm,DESC`) | `200 OK` |
| `GET` | `http://localhost:8080/api/v1/doacoes/{id}` | Busca uma doação pelo seu `id` (`UUID`) | `200 OK` / `404 Not Found` |
| `POST` | `http://localhost:8080/api/v1/doacoes` | Cadastra uma doação (`criadoEm` gerado no service) | `201 Created` / `400 Bad Request` |
| `PUT` | `http://localhost:8080/api/v1/doacoes/{id}` | Edita uma doação mantendo `id` e `criadoEm` | `200 OK` / `400` / `404` |
| `DELETE` | `http://localhost:8080/api/v1/doacoes/{id}` | Exclui uma doação pelo seu `id` | `204 No Content` / `404 Not Found` |

---

## Roteiro de Demonstração (Até 3 Minutos — `[N2-8]`)

1. **Buscar, cadastrar, editar e excluir um ponto (1 min):**
   - Na tela inicial, rolar a lista mostrando a paginação (`onEndReached`) e digitar `"Bueno"` na busca para filtrar pela API.
   - Tocar em **"+ Novo ponto"**, preencher nome, endereço, bairro, horário, escolher `"coleta"` nos botões de tipo e salvar (`POST`).
   - Abrir o ponto recém-criado na lista, tocar em **"Editar ponto"**, alterar o tipo para `"distribuição"` no mesmo formulário e tocar em **"Salvar alterações"** (`PUT`), mostrando o detalhe e a lista atualizados.
   - Abrir novamente o ponto, tocar em **"Excluir ponto"** e confirmar a exclusão (`DELETE`).
2. **Favoritar pontos e tela "Meus pontos" (30s):**
   - Tocar no ícone de coração (`♡` → `♥`) em dois pontos da lista.
   - Abrir a tela **"♥ Meus pontos"** no cabeçalho (que busca cada ponto na API pelo `id` salvo no `AsyncStorage`).
   - Desmarcar um ponto diretamente na tela **"Meus pontos"** (`♥`), mostrando que ele sai da tela na hora e persiste ao reabrir o app.
3. **Cadastrar, editar e excluir uma doação (1 min):**
   - Tocar em **"Minhas doações"** → **"+ Nova doação"**, preencher o tipo do item (`"Cesta Básica"`), quantidade (`5`), escolher o ponto de destino nos `TouchableOpacity` vindos da API e salvar (`POST`).
   - Verificar a doação nova no topo do histórico, filtrar pelo tipo de item no campo de busca e tocar na doação para abrir o detalhe (buscado por `id` na API).
   - Tocar em **"Editar doação"**, alterar a quantidade para `10` e tocar em **"Salvar alterações"** (`PUT`), confirmando que `id` e data de cadastro foram mantidos.
   - Tocar em **"Excluir esta doação"** e confirmar (`DELETE`), voltando ao histórico atualizado.
4. **Mostrar erros `400` e `404` na API pelo Swagger (30s):**
   - No Swagger (`http://localhost:8080/swagger-ui/index.html`), enviar um `POST /api/v1/pontos` com `"nome": ""` ou `POST /api/v1/doacoes` com `"quantidade": 0` para demonstrar o `400 Bad Request`.
   - Consultar `GET /api/v1/pontos/{id}` com um UUID inexistente para demonstrar o `404 Not Found`.

---

## Decisão Técnica da Semana

**Por que os favoritos ficam no `AsyncStorage` do aparelho (guardando apenas os `id`s) enquanto pontos e doações ficam no servidor?**
- **Pontos de coleta e doações** são dados compartilhados da instituição: se um ponto mudar de horário ou uma nova doação for registrada, todos os usuários e voluntários precisam enxergar a mesma informação centralizada no banco de dados da API.
- **Pontos favoritos**, por outro lado, são uma preferência individual de cada aparelho (quando ainda não há sistema de login por usuário). Além disso, guardar **apenas os `id`s** no `AsyncStorage` e buscar os dados atualizados na API ao abrir a tela *"Meus pontos"* evita exibir dados desatualizados caso um ponto tenha seu endereço editado e permite ignorar de forma segura (`404`) pontos que tenham sido excluídos no servidor.

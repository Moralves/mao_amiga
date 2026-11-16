# Instituto Mão Amiga

Aplicativo mobile (Expo / React Native) e API REST (Spring Boot + H2) para gerenciamento de pontos de coleta/distribuição e registro de doações em Goiânia.

## Estrutura do Repositório

- **`api/`**: Projeto Spring Boot com persistência em arquivo no banco H2 (`jdbc:h2:file:./data/institutodb`).
- **`frontend/`**: Aplicativo mobile em React Native (Expo).

---

## Como Rodar a API (`api/`)

### Pré-requisitos
- **Java 17+** (testado com Java 21)

### Executando pelo terminal
Na raiz do projeto:
```bash
npm run api
```
Ou diretamente dentro da pasta `api/`:
```bash
cd api
.\mvnw.cmd spring-boot:run
```

- **Servidor Base**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **Console H2**: `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:file:./data/institutodb`
  - **User Name**: `sa`
  - **Password**: *(em branco)*

---

## Endpoints de Pontos de Coleta (`[N2-1]` e `[N2-2]`)

| Método | URL Completa | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:8080/api/v1/pontos` | Lista todos os pontos cadastrados | `200 OK` |
| `GET` | `http://localhost:8080/api/v1/pontos/filtro?filtro=...&page=0&size=10` | Busca paginada de pontos por nome ou bairro | `200 OK` |
| `GET` | `http://localhost:8080/api/v1/pontos/{id}` | Busca um ponto pelo seu `id` (`UUID`) | `200 OK` / `404 Not Found` |
| `POST` | `http://localhost:8080/api/v1/pontos` | Cadastra um novo ponto (campos validados com `@Valid`) | `201 Created` / `400 Bad Request` |
| `PUT` | `http://localhost:8080/api/v1/pontos/{id}` | Atualiza os dados de um ponto existente | `200 OK` / `400` / `404` |
| `DELETE` | `http://localhost:8080/api/v1/pontos/{id}` | Remove um ponto pelo seu `id` | `204 No Content` / `404 Not Found` |

### Exemplos de Requisição e Resposta — CRUD (`[N2-1]`)

#### 1. `GET /api/v1/pontos` (`200 OK`)
Retorna a lista de `PontoResponseDTO` com os pontos da carga inicial em Goiânia:
```json
[
  {
    "id": "a1b2c3d4-e5f6-4789-8012-3456789abcde",
    "nome": "Ponto de Coleta Campinas",
    "endereco": "Praça Joaquim Lúcio, s/n - Setor Campinas, Goiânia - GO",
    "bairro": "Setor Campinas",
    "horario": "Seg a Sex, 8h às 17h",
    "tipo": "coleta"
  }
]
```

#### 2. `GET /api/v1/pontos/{id}` (`200 OK`)
```json
{
  "id": "a1b2c3d4-e5f6-4789-8012-3456789abcde",
  "nome": "Ponto de Coleta Campinas",
  "endereco": "Praça Joaquim Lúcio, s/n - Setor Campinas, Goiânia - GO",
  "bairro": "Setor Campinas",
  "horario": "Seg a Sex, 8h às 17h",
  "tipo": "coleta"
}
```

#### 3. `POST /api/v1/pontos` (`201 Created`)
Corpo enviado (`PontoRequestDTO`):
```json
{
  "nome": "Ponto Solidário Setor Oeste",
  "endereco": "Av. Assis Chateaubriand, 500 - Setor Oeste, Goiânia - GO",
  "bairro": "Setor Oeste",
  "horario": "Seg a Sex, 8h às 17h",
  "tipo": "coleta"
}
```

#### 4. `PUT /api/v1/pontos/{id}` (`200 OK`)
Corpo enviado (`PontoRequestDTO`):
```json
{
  "nome": "Ponto Solidário Setor Oeste",
  "endereco": "Av. Assis Chateaubriand, 500 - Setor Oeste, Goiânia - GO",
  "bairro": "Setor Oeste",
  "horario": "Seg a Sáb, 8h às 18h",
  "tipo": "distribuição"
}
```

#### 5. `DELETE /api/v1/pontos/{id}` (`204 No Content`)
Exclui o registro e responde sem corpo (`204`).

#### 6. Erro de Validação — Campo Obrigatório Vazio (`400 Bad Request`)
Enviando `POST /api/v1/pontos` ou `PUT /api/v1/pontos/{id}` com campo vazio (`"nome": ""`), o Bean Validation rejeita com status `400` sem gravar no banco.

#### 7. Recurso Inexistente (`404 Not Found`)
Consultando `GET /api/v1/pontos/{id}` ou `PUT /api/v1/pontos/{id}` com um UUID que não existe no banco, a API responde com status `404 Not Found`.

---

### Exemplos de Busca Paginada (`[N2-2]`)

#### 1. Chamada sem filtro (padrão: 10 itens ordenados por `nome`)
**Requisição:**
```http
GET http://localhost:8080/api/v1/pontos/filtro
```
**Resposta (`200 OK`):**
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
    },
    {
      "id": "e41f891a-12b0-4c9a-9f31-10a2b3c4d502",
      "nome": "Casa da Esperança Marista",
      "endereco": "Rua 1122, 180 - Setor Marista, Goiânia - GO",
      "bairro": "Setor Marista",
      "horario": "Seg a Sex, 8h30 às 17h30",
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

#### 2. Chamada filtrando por bairro (insensível a maiúsculas/minúsculas)
**Requisição:**
```http
GET http://localhost:8080/api/v1/pontos/filtro?filtro=bueno&page=0&size=10
```
**Resposta (`200 OK`):**
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
**Requisição:**
```http
GET http://localhost:8080/api/v1/pontos/filtro?page=1&size=10&sort=bairro,asc
```
**Resposta (`200 OK`):**
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

## Como Rodar o Aplicativo (`frontend/`)

```bash
cd frontend
npm install
npx expo start
```
- **Teste no Navegador:** Os testes de integração com a API foram realizados no navegador pressionando `w` no terminal do Expo (`http://localhost:8080` configurado em `frontend/src/services/api.ts`).
- **Teste no Celular pela Rede Local:** Ao testar no celular físico via Expo Go, edite a constante `API_BASE_URL` em `frontend/src/services/api.ts` trocando `localhost` pelo IP local do computador na mesma rede Wi-Fi (ex.: `http://192.168.1.15:8080`).

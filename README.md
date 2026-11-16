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

## Endpoints de Pontos de Coleta (`[N2-1]`)

| Método | URL Completa | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:8080/api/v1/pontos` | Lista todos os pontos cadastrados | `200 OK` |
| `GET` | `http://localhost:8080/api/v1/pontos/{id}` | Busca um ponto pelo seu `id` (`UUID`) | `200 OK` / `404 Not Found` |
| `POST` | `http://localhost:8080/api/v1/pontos` | Cadastra um novo ponto (campos validados com `@Valid`) | `201 Created` / `400 Bad Request` |
| `PUT` | `http://localhost:8080/api/v1/pontos/{id}` | Atualiza os dados de um ponto existente | `200 OK` / `400` / `404` |
| `DELETE` | `http://localhost:8080/api/v1/pontos/{id}` | Remove um ponto pelo seu `id` | `204 No Content` / `404 Not Found` |

### Exemplos de Requisição e Resposta (Swagger)

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

## Como Rodar o Aplicativo (`frontend/`)

```bash
cd frontend
npm install
npx expo start
```
- Pressione `w` para abrir no navegador ou escaneie o QR Code no aplicativo **Expo Go**.

package br.com.instituto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class InstitutoApiApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/pontos retorna pelo menos 25 pontos da carga inicial")
    void deveListarPontosIniciais() throws Exception {
        mockMvc.perform(get("/api/v1/pontos")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(25))))
                .andExpect(jsonPath("$[0].id", notNullValue()))
                .andExpect(jsonPath("$[0].nome", notNullValue()))
                .andExpect(jsonPath("$[0].endereco", notNullValue()))
                .andExpect(jsonPath("$[0].bairro", notNullValue()))
                .andExpect(jsonPath("$[0].horario", notNullValue()))
                .andExpect(jsonPath("$[0].tipo", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/pontos/filtro devolve paginação padrão de 10 itens no formato content + page")
    void deveBuscarPontosPaginadosSemFiltro() throws Exception {
        mockMvc.perform(get("/api/v1/pontos/filtro")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.page.size").value(10))
                .andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.page.totalElements", greaterThanOrEqualTo(25)))
                .andExpect(jsonPath("$.page.totalPages", greaterThanOrEqualTo(3)));
    }

    @Test
    @DisplayName("GET /api/v1/pontos/filtro filtra por nome ou bairro sem diferenciar maiúsculas e aceita paginação")
    void deveFiltrarPontosPorNomeOuBairroEPaginar() throws Exception {
        mockMvc.perform(get("/api/v1/pontos/filtro?filtro=bueno&page=0&size=10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].bairro").value("Setor Bueno"));

        mockMvc.perform(get("/api/v1/pontos/filtro?page=1&size=10&sort=bairro,asc")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.page.number").value(1));
    }

    @Test
    @DisplayName("Fluxo CRUD completo: POST, GET por id, PUT e DELETE em /api/v1/pontos")
    void deveExecutarCrudCompletoDePonto() throws Exception {
        String novoPontoJson = """
                {
                  "nome": "Ponto Solidário Setor Oeste Novo",
                  "endereco": "Av. Assis Chateaubriand, 500 - Setor Oeste, Goiânia - GO",
                  "bairro": "Setor Oeste",
                  "horario": "Seg a Sex, 8h às 17h",
                  "tipo": "coleta"
                }
                """;

        MvcResult postResult = mockMvc.perform(post("/api/v1/pontos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(novoPontoJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nome").value("Ponto Solidário Setor Oeste Novo"))
                .andExpect(jsonPath("$.tipo").value("coleta"))
                .andReturn();

        JsonNode criado = objectMapper.readTree(postResult.getResponse().getContentAsString());
        String id = criado.get("id").asText();

        mockMvc.perform(get("/api/v1/pontos/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.bairro").value("Setor Oeste"));

        String edicaoJson = """
                {
                  "nome": "Ponto Solidário Setor Oeste Atualizado",
                  "endereco": "Av. Assis Chateaubriand, 500 - Setor Oeste, Goiânia - GO",
                  "bairro": "Setor Oeste",
                  "horario": "Seg a Sáb, 8h às 18h",
                  "tipo": "distribuição"
                }
                """;

        mockMvc.perform(put("/api/v1/pontos/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(edicaoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ponto Solidário Setor Oeste Atualizado"))
                .andExpect(jsonPath("$.tipo").value("distribuição"));

        mockMvc.perform(delete("/api/v1/pontos/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/pontos/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET e PUT de id inexistente respondem 404")
    void deveResponder404ParaIdInexistente() throws Exception {
        UUID idInexistente = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/pontos/" + idInexistente))
                .andExpect(status().isNotFound());

        String bodyValido = """
                {
                  "nome": "Ponto Teste",
                  "endereco": "Rua 10, Centro",
                  "bairro": "Setor Central",
                  "horario": "Seg a Sex, 8h às 17h",
                  "tipo": "coleta"
                }
                """;

        mockMvc.perform(put("/api/v1/pontos/" + idInexistente)
                .contentType(MediaType.APPLICATION_JSON)
                .content(bodyValido))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Cadastro ou edição com campo obrigatório vazio responde 400")
    void deveResponder400QuandoCampoObrigatorioVazio() throws Exception {
        String bodyInvalido = """
                {
                  "nome": "",
                  "endereco": "Rua 10, Centro",
                  "bairro": "Setor Central",
                  "horario": "Seg a Sex, 8h às 17h",
                  "tipo": "coleta"
                }
                """;

        mockMvc.perform(post("/api/v1/pontos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bodyInvalido))
                .andExpect(status().isBadRequest());
    }
}

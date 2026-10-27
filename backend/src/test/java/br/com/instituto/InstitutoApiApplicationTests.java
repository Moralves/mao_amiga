package br.com.instituto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InstitutoApiApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Contexto carrega normalmente")
    void contextLoads() {
    }

    @Test
    @DisplayName("GET /pontos retorna 200 e resposta paginada com content e page")
    void deveListarPontosPaginados() throws Exception {
        mockMvc.perform(get("/pontos")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()))
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(8))))
                .andExpect(jsonPath("$.content[0].id", notNullValue()))
                .andExpect(jsonPath("$.content[0].nome", notNullValue()))
                .andExpect(jsonPath("$.content[0].endereco", notNullValue()))
                .andExpect(jsonPath("$.content[0].horarioFuncionamento", notNullValue()))
                .andExpect(jsonPath("$.content[0].itens", notNullValue()))
                .andExpect(jsonPath("$.content[0].latitude", notNullValue()))
                .andExpect(jsonPath("$.content[0].longitude", notNullValue()))
                .andExpect(jsonPath("$.page.size").value(20))
                .andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.page.totalElements", greaterThanOrEqualTo(8)));
    }

    @Test
    @DisplayName("GET /pontos/{id} existente retorna 200 com DTO do ponto")
    void deveBuscarPontoPorIdExistente() throws Exception {
        mockMvc.perform(get("/pontos/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Ponto de Coleta Campinas"))
                .andExpect(jsonPath("$.latitude").value(-16.6698))
                .andExpect(jsonPath("$.longitude").value(-49.2882));
    }

    @Test
    @DisplayName("GET /pontos/{id} inexistente responde 404 e não 500")
    void deveRetornar404QuandoPontoNaoExiste() throws Exception {
        mockMvc.perform(get("/pontos/999999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Filtro por bairro funciona via query string")
    void deveFiltrarPontosPorBairro() throws Exception {
        mockMvc.perform(get("/pontos?bairro=Bueno")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].bairro").value("Setor Bueno"));
    }
}

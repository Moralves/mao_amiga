package br.com.instituto.dto;

import jakarta.validation.constraints.NotBlank;

public record PontoRequestDTO(
    @NotBlank(message = "O nome é obrigatório")
    String nome,

    @NotBlank(message = "O endereço é obrigatório")
    String endereco,

    @NotBlank(message = "O bairro é obrigatório")
    String bairro,

    @NotBlank(message = "O horário é obrigatório")
    String horario,

    @NotBlank(message = "O tipo é obrigatório")
    String tipo
) {
}

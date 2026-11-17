package br.com.instituto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DoacaoRequestDTO(
    @NotBlank(message = "O tipo do item é obrigatório")
    String tipoItem,

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    Integer quantidade,

    @NotBlank(message = "O ponto de destino é obrigatório")
    String pontoDestino
) {
}

package br.com.instituto.dto;

import br.com.instituto.model.Ponto;

public record PontoDTO(
    Long id,
    String nome,
    String endereco,
    String bairro,
    String horarioFuncionamento,
    String tipo,
    String itens,
    String telefone,
    String descricao,
    Double latitude,
    Double longitude
) {
    public static PontoDTO fromEntity(Ponto ponto) {
        return new PontoDTO(
            ponto.getId(),
            ponto.getNome(),
            ponto.getEndereco(),
            ponto.getBairro(),
            ponto.getHorarioFuncionamento(),
            ponto.getTipo(),
            ponto.getItens(),
            ponto.getTelefone(),
            ponto.getDescricao(),
            ponto.getLatitude(),
            ponto.getLongitude()
        );
    }
}

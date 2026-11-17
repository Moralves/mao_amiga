package br.com.instituto.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tipoItem;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private String pontoDestino;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    public Doacao(String tipoItem, Integer quantidade, String pontoDestino, LocalDateTime criadoEm) {
        this.tipoItem = tipoItem;
        this.quantidade = quantidade;
        this.pontoDestino = pontoDestino;
        this.criadoEm = criadoEm;
    }
}

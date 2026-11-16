package br.com.instituto.repository;

import br.com.instituto.entity.Ponto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PontoRepository extends JpaRepository<Ponto, UUID> {

    @Query("SELECT p FROM Ponto p WHERE " +
           ":filtro IS NULL OR :filtro = '' OR " +
           "LOWER(p.nome) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(p.bairro) LIKE LOWER(CONCAT('%', :filtro, '%'))")
    Page<Ponto> buscarPorFiltro(@Param("filtro") String filtro, Pageable pageable);
}

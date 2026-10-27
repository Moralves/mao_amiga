package br.com.instituto.repository;

import br.com.instituto.model.Ponto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PontoRepository extends JpaRepository<Ponto, Long> {

    @Query("SELECT p FROM Ponto p WHERE " +
           "(:bairro IS NULL OR LOWER(p.bairro) LIKE LOWER(CONCAT('%', :bairro, '%'))) AND " +
           "(:tipo IS NULL OR LOWER(p.tipo) LIKE LOWER(CONCAT('%', :tipo, '%')))")
    Page<Ponto> findByFiltros(@Param("bairro") String bairro, @Param("tipo") String tipo, Pageable pageable);
}

package br.com.instituto.controller;

import br.com.instituto.dto.PontoDTO;
import br.com.instituto.repository.PontoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pontos")
@CrossOrigin(origins = "*")
public class PontoController {

    private final PontoRepository pontoRepository;

    public PontoController(PontoRepository pontoRepository) {
        this.pontoRepository = pontoRepository;
    }

    @GetMapping
    public Page<PontoDTO> listar(
            @RequestParam(required = false) String bairro,
            @RequestParam(required = false) String tipo,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        int pageSize = Math.min(pageable.getPageSize(), 50);
        Pageable cappedPageable = PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());

        Page<PontoDTO> page = pontoRepository.findByFiltros(bairro, tipo, cappedPageable)
                .map(PontoDTO::fromEntity);

        return page;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PontoDTO> buscarPorId(@PathVariable Long id) {
        return pontoRepository.findById(id)
                .map(PontoDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}

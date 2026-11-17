package br.com.instituto.controller;

import br.com.instituto.dto.PontoRequestDTO;
import br.com.instituto.dto.PontoResponseDTO;
import br.com.instituto.service.PontoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pontos")
@CrossOrigin(origins = "*")
public class PontoController {

    private final PontoService pontoService;

    public PontoController(PontoService pontoService) {
        this.pontoService = pontoService;
    }

    @GetMapping
    public ResponseEntity<List<PontoResponseDTO>> listar() {
        return ResponseEntity.ok(pontoService.listarTodos());
    }

    @GetMapping("/filtro")
    public ResponseEntity<Page<PontoResponseDTO>> filtrar(
            @RequestParam(required = false) String filtro,
            @PageableDefault(size = 10, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(pontoService.buscarPaginado(filtro, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PontoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(pontoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PontoResponseDTO> cadastrar(@Valid @RequestBody PontoRequestDTO dto) {
        PontoResponseDTO criado = pontoService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PontoResponseDTO> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody PontoRequestDTO dto
    ) {
        return ResponseEntity.ok(pontoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        pontoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}

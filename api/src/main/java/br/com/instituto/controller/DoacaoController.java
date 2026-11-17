package br.com.instituto.controller;

import br.com.instituto.dto.DoacaoRequestDTO;
import br.com.instituto.dto.DoacaoResponseDTO;
import br.com.instituto.service.DoacaoService;
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
@RequestMapping("/api/v1/doacoes")
@CrossOrigin(origins = "*")
public class DoacaoController {

    private final DoacaoService doacaoService;

    public DoacaoController(DoacaoService doacaoService) {
        this.doacaoService = doacaoService;
    }

    @GetMapping
    public ResponseEntity<List<DoacaoResponseDTO>> listar() {
        return ResponseEntity.ok(doacaoService.listarTodas());
    }

    @GetMapping("/filtro")
    public ResponseEntity<Page<DoacaoResponseDTO>> filtrar(
            @RequestParam(required = false) String filtro,
            @PageableDefault(size = 10, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(doacaoService.buscarPaginado(filtro, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoacaoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(doacaoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<DoacaoResponseDTO> cadastrar(@Valid @RequestBody DoacaoRequestDTO dto) {
        DoacaoResponseDTO criada = doacaoService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoacaoResponseDTO> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody DoacaoRequestDTO dto
    ) {
        return ResponseEntity.ok(doacaoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        doacaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}

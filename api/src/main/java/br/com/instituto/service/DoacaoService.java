package br.com.instituto.service;

import br.com.instituto.dto.DoacaoRequestDTO;
import br.com.instituto.dto.DoacaoResponseDTO;
import br.com.instituto.entity.Doacao;
import br.com.instituto.repository.DoacaoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DoacaoService {

    private final DoacaoRepository doacaoRepository;

    public DoacaoService(DoacaoRepository doacaoRepository) {
        this.doacaoRepository = doacaoRepository;
    }

    public List<DoacaoResponseDTO> listarTodas() {
        return doacaoRepository.findAll()
                .stream()
                .map(DoacaoResponseDTO::fromEntity)
                .toList();
    }

    public Page<DoacaoResponseDTO> buscarPaginado(String filtro, Pageable pageable) {
        String termo = (filtro == null || filtro.isBlank()) ? null : filtro.trim();
        return doacaoRepository.buscarPorTipoItem(termo, pageable)
                .map(DoacaoResponseDTO::fromEntity);
    }

    public DoacaoResponseDTO buscarPorId(UUID id) {
        Doacao doacao = doacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doação não encontrada"));
        return DoacaoResponseDTO.fromEntity(doacao);
    }

    public DoacaoResponseDTO cadastrar(DoacaoRequestDTO dto) {
        Doacao doacao = new Doacao(
                dto.tipoItem().trim(),
                dto.quantidade(),
                dto.pontoDestino().trim(),
                LocalDateTime.now()
        );
        Doacao salva = doacaoRepository.save(doacao);
        return DoacaoResponseDTO.fromEntity(salva);
    }

    public DoacaoResponseDTO atualizar(UUID id, DoacaoRequestDTO dto) {
        Doacao doacao = doacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doação não encontrada"));

        doacao.setTipoItem(dto.tipoItem().trim());
        doacao.setQuantidade(dto.quantidade());
        doacao.setPontoDestino(dto.pontoDestino().trim());

        Doacao atualizada = doacaoRepository.save(doacao);
        return DoacaoResponseDTO.fromEntity(atualizada);
    }

    public void excluir(UUID id) {
        if (!doacaoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doação não encontrada");
        }
        doacaoRepository.deleteById(id);
    }
}

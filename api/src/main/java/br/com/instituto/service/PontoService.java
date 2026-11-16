package br.com.instituto.service;

import br.com.instituto.dto.PontoRequestDTO;
import br.com.instituto.dto.PontoResponseDTO;
import br.com.instituto.entity.Ponto;
import br.com.instituto.repository.PontoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class PontoService {

    private final PontoRepository pontoRepository;

    public PontoService(PontoRepository pontoRepository) {
        this.pontoRepository = pontoRepository;
    }

    public List<PontoResponseDTO> listarTodos() {
        return pontoRepository.findAll()
                .stream()
                .map(PontoResponseDTO::fromEntity)
                .toList();
    }

    public PontoResponseDTO buscarPorId(UUID id) {
        Ponto ponto = pontoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ponto não encontrado"));
        return PontoResponseDTO.fromEntity(ponto);
    }

    public PontoResponseDTO cadastrar(PontoRequestDTO dto) {
        Ponto ponto = new Ponto(
                dto.nome().trim(),
                dto.endereco().trim(),
                dto.bairro().trim(),
                dto.horario().trim(),
                dto.tipo().trim()
        );
        Ponto salvo = pontoRepository.save(ponto);
        return PontoResponseDTO.fromEntity(salvo);
    }

    public PontoResponseDTO atualizar(UUID id, PontoRequestDTO dto) {
        Ponto ponto = pontoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ponto não encontrado"));

        ponto.setNome(dto.nome().trim());
        ponto.setEndereco(dto.endereco().trim());
        ponto.setBairro(dto.bairro().trim());
        ponto.setHorario(dto.horario().trim());
        ponto.setTipo(dto.tipo().trim());

        Ponto atualizado = pontoRepository.save(ponto);
        return PontoResponseDTO.fromEntity(atualizado);
    }

    public void excluir(UUID id) {
        if (!pontoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ponto não encontrado");
        }
        pontoRepository.deleteById(id);
    }
}

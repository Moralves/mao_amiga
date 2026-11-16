package br.com.instituto.config;

import br.com.instituto.entity.Ponto;
import br.com.instituto.repository.PontoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PontoRepository pontoRepository;

    public DataInitializer(PontoRepository pontoRepository) {
        this.pontoRepository = pontoRepository;
    }

    @Override
    public void run(String... args) {
        if (pontoRepository.count() > 0) {
            return;
        }

        List<Ponto> pontosIniciais = List.of(
            new Ponto(
                "Ponto de Coleta Campinas",
                "Praça Joaquim Lúcio, s/n - Setor Campinas, Goiânia - GO",
                "Setor Campinas",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Núcleo Social Universitário",
                "Praça Universitária, s/n - Setor Leste Universitário, Goiânia - GO",
                "Setor Leste Universitário",
                "Seg a Sex, 8h às 18h",
                "coleta"
            ),
            new Ponto(
                "Centro de Arrecadação Bueno",
                "Av. T-4, 1400 - Setor Bueno, Goiânia - GO",
                "Setor Bueno",
                "Seg a Sáb, 9h às 19h",
                "coleta"
            ),
            new Ponto(
                "Galpão Solidário Jardim Goiás",
                "Av. Dep. Jamel Cecílio, 3300 - Jardim Goiás, Goiânia - GO",
                "Jardim Goiás",
                "Seg a Sáb, 8h às 18h",
                "distribuição"
            ),
            new Ponto(
                "Casa da Esperança Marista",
                "Rua 1122, 180 - Setor Marista, Goiânia - GO",
                "Setor Marista",
                "Seg a Sex, 8h30 às 17h30",
                "coleta"
            ),
            new Ponto(
                "Centro Comunitário Pedro Ludovico",
                "Av. Circular, 420 - Setor Pedro Ludovico, Goiânia - GO",
                "Setor Pedro Ludovico",
                "Seg a Sex, 8h às 16h30",
                "distribuição"
            ),
            new Ponto(
                "Posto Solidário Vila Nova",
                "5ª Avenida, 850 - Setor Leste Vila Nova, Goiânia - GO",
                "Setor Leste Vila Nova",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Ponto de Apoio Central Rodoviária",
                "Rua 44, 399 - Setor Central, Goiânia - GO",
                "Setor Central",
                "Seg a Dom, 7h às 20h",
                "distribuição"
            )
        );

        pontoRepository.saveAll(pontosIniciais);
    }
}

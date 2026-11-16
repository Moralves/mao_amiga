package br.com.instituto.config;

import br.com.instituto.entity.Ponto;
import br.com.instituto.repository.PontoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PontoRepository pontoRepository;

    public DataInitializer(PontoRepository pontoRepository) {
        this.pontoRepository = pontoRepository;
    }

    @Override
    public void run(String... args) {
        if (pontoRepository.count() >= 25) {
            return;
        }

        Set<String> nomesExistentes = pontoRepository.findAll()
                .stream()
                .map(Ponto::getNome)
                .collect(Collectors.toSet());

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
            ),
            new Ponto(
                "Base Comunitária Setor Oeste",
                "Av. Assis Chateaubriand, 620 - Setor Oeste, Goiânia - GO",
                "Setor Oeste",
                "Seg a Sex, 8h às 18h",
                "coleta"
            ),
            new Ponto(
                "Centro Solidário Jardim América",
                "Av. C-104, 910 - Jardim América, Goiânia - GO",
                "Jardim América",
                "Seg a Sáb, 8h às 17h",
                "distribuição"
            ),
            new Ponto(
                "Ponto de Coleta Parque Amazônia",
                "Av. Rio Verde, 1500 - Parque Amazônia, Goiânia - GO",
                "Parque Amazônia",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Núcleo de Apoio Setor Sul",
                "Rua 84, 315 - Setor Sul, Goiânia - GO",
                "Setor Sul",
                "Seg a Sex, 8h30 às 17h30",
                "distribuição"
            ),
            new Ponto(
                "Posto de Arrecadação Cidade Jardim",
                "Av. Consolação, 1120 - Cidade Jardim, Goiânia - GO",
                "Cidade Jardim",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Casa de Apoio Setor Coimbra",
                "Av. Castelo Branco, 890 - Setor Coimbra, Goiânia - GO",
                "Setor Coimbra",
                "Seg a Sáb, 8h às 16h",
                "distribuição"
            ),
            new Ponto(
                "Ponto Solidário Bela Vista",
                "Av. T-63, 2100 - Setor Bela Vista, Goiânia - GO",
                "Setor Bela Vista",
                "Seg a Sex, 9h às 18h",
                "coleta"
            ),
            new Ponto(
                "Centro de Doações Nova Suíça",
                "Rua C-255, 410 - Setor Nova Suíça, Goiânia - GO",
                "Setor Nova Suíça",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Ponto Comunitário Setor Aeroporto",
                "Av. República do Líbano, 1050 - Setor Aeroporto, Goiânia - GO",
                "Setor Aeroporto",
                "Seg a Sex, 8h às 18h",
                "distribuição"
            ),
            new Ponto(
                "Espaço Solidário Setor Jaó",
                "Av. Quitandinha, 340 - Setor Jaó, Goiânia - GO",
                "Setor Jaó",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Núcleo Comunitário Criméia Leste",
                "Av. Fuad Rassi, 520 - Setor Criméia Leste, Goiânia - GO",
                "Setor Criméia Leste",
                "Seg a Sáb, 8h às 16h",
                "distribuição"
            ),
            new Ponto(
                "Ponto de Coleta Urias Magalhães",
                "Rua Paranaíba, 280 - Setor Urias Magalhães, Goiânia - GO",
                "Setor Urias Magalhães",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Centro de Distribuição Vila Redenção",
                "Alameda das Rosas, 195 - Vila Redenção, Goiânia - GO",
                "Vila Redenção",
                "Seg a Sex, 8h às 16h",
                "distribuição"
            ),
            new Ponto(
                "Galpão Comunitário Novo Mundo",
                "Av. Nova York, 780 - Jardim Novo Mundo, Goiânia - GO",
                "Jardim Novo Mundo",
                "Seg a Sáb, 8h às 17h",
                "distribuição"
            ),
            new Ponto(
                "Posto Solidário Marechal Rondon",
                "Rua 15, 110 - Setor Marechal Rondon, Goiânia - GO",
                "Setor Marechal Rondon",
                "Seg a Sex, 8h às 17h",
                "coleta"
            ),
            new Ponto(
                "Ponto de Arrecadação Negrão de Lima",
                "Av. Independência, 1800 - Setor Negrão de Lima, Goiânia - GO",
                "Setor Negrão de Lima",
                "Seg a Sex, 8h às 18h",
                "coleta"
            ),
            new Ponto(
                "Centro Solidário Sudoeste",
                "Av. C-12, 640 - Setor Sudoeste, Goiânia - GO",
                "Setor Sudoeste",
                "Seg a Sáb, 8h às 17h",
                "distribuição"
            )
        );

        List<Ponto> novosPontos = pontosIniciais.stream()
                .filter(p -> !nomesExistentes.contains(p.getNome()))
                .toList();

        pontoRepository.saveAll(novosPontos);
    }
}

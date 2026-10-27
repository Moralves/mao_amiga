package br.com.instituto.config;

import br.com.instituto.model.Ponto;
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
                null,
                "Ponto de Coleta Campinas",
                "Praça Joaquim Lúcio, s/n - Setor Campinas, Goiânia - GO",
                "Setor Campinas",
                "Segunda a Sexta: 08:00 às 17:00 | Sábado: 08:00 às 12:00",
                "AMBOS",
                "Alimentos não perecíveis, agasalhos, cobertores e calçados",
                "(62) 3524-1000",
                "Ponto comunitário tradicional de apoio e arrecadação de mantimentos no bairro histórico de Campinas.",
                -16.6698,
                -49.2882
            ),
            new Ponto(
                null,
                "Núcleo Social Universitário",
                "Praça Universitária, s/n - Setor Leste Universitário, Goiânia - GO",
                "Setor Leste Universitário",
                "Segunda a Sexta: 08:00 às 18:00",
                "RECEBE",
                "Livros, materiais escolares, agasalhos e alimentos não perecíveis",
                "(62) 3209-6000",
                "Espaço comunitário voltado para doações estudantis e apoio a famílias em vulnerabilidade social.",
                -16.6805,
                -49.2443
            ),
            new Ponto(
                null,
                "Centro de Arrecadação Bueno",
                "Av. T-4, 1400 - Setor Bueno, Goiânia - GO",
                "Setor Bueno",
                "Segunda a Sexta: 09:00 às 19:00 | Sábado: 09:00 às 13:00",
                "RECEBE",
                "Roupas, calçados, cobertores e leite em pó",
                "(62) 3945-8000",
                "Ponto de arrecadação central com foco em campanhas do agasalho e apoio a lares de idosos.",
                -16.7112,
                -49.2635
            ),
            new Ponto(
                null,
                "Galpão Solidário Jardim Goiás",
                "Av. Dep. Jamel Cecílio, 3300 - Jardim Goiás, Goiânia - GO",
                "Jardim Goiás",
                "Segunda a Sábado: 08:00 às 18:00",
                "AMBOS",
                "Cestas básicas, alimentos não perecíveis, produtos de limpeza e kits de higiene",
                "(62) 3922-4500",
                "Centro logístico para triagem, armazenamento e distribuição de cestas básicas e itens de primeira necessidade.",
                -16.7028,
                -49.2372
            ),
            new Ponto(
                null,
                "Casa da Esperança Marista",
                "Rua 1122, 180 - Setor Marista, Goiânia - GO",
                "Setor Marista",
                "Segunda a Sexta: 08:30 às 17:30",
                "RECEBE",
                "Alimentos infantis, fraldas geriátricas e pediátricas, brinquedos e agasalhos",
                "(62) 3281-2233",
                "Instituição dedicada ao acolhimento de crianças e famílias em tratamento médico na capital.",
                -16.6967,
                -49.2604
            ),
            new Ponto(
                null,
                "Centro Comunitário Pedro Ludovico",
                "Av. Circular, 420 - Setor Pedro Ludovico, Goiânia - GO",
                "Setor Pedro Ludovico",
                "Segunda a Sexta: 08:00 às 16:30",
                "DISTRIBUI",
                "Cestas básicas, marmitas solidárias e vestuário",
                "(62) 3524-2200",
                "Distribuição direta de alimentação e assistência a famílias cadastradas em programas sociais da região sul.",
                -16.7180,
                -49.2558
            ),
            new Ponto(
                null,
                "Posto Solidário Vila Nova",
                "5ª Avenida, 850 - Setor Leste Vila Nova, Goiânia - GO",
                "Setor Leste Vila Nova",
                "Segunda a Sexta: 08:00 às 17:00",
                "AMBOS",
                "Alimentos não perecíveis, água mineral, itens de higiene e agasalhos",
                "(62) 3202-7100",
                "Ponto comunitário ativo no acolhimento de doações de vizinhos e distribuição local.",
                -16.6664,
                -49.2398
            ),
            new Ponto(
                null,
                "Ponto de Apoio Central Rodoviária",
                "Rua 44, 399 - Setor Central, Goiânia - GO",
                "Setor Central",
                "Segunda a Domingo: 07:00 às 20:00",
                "AMBOS",
                "Cobertores, roupas de frio, lanches, marmitas e garrafas de água",
                "(62) 3213-9090",
                "Ponto estratégico no centro de Goiânia para atendimento humanitário a pessoas em trânsito e vulnerabilidade.",
                -16.6631,
                -49.2573
            )
        );

        pontoRepository.saveAll(pontosIniciais);
    }
}

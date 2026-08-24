import { CollectionPoint } from '../types/types';

export const mockCollectionPoints: CollectionPoint[] = [
  {
    id: '1',
    name: 'EcoPonto Centro',
    shortDescription: 'Ponto especializado no descarte correto de aparelhos eletrônicos e baterias.',
    description: 'O EcoPonto Centro é uma iniciativa focada na redução do lixo eletrônico. Recebemos desde pilhas usadas até grandes eletrodomésticos de forma gratuita e garantimos que todo o material seja encaminhado para reciclagem e reaproveitamento de componentes nobres, evitando a contaminação do solo e da água com metais pesados.',
    category: 'Eletrônicos',
    address: 'Av. Central, 1200 - Centro, Cidade Verde',
    hours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00',
    phone: '(11) 98765-4321',
    rating: 4.8,
    acceptedMaterials: ['Pilhas', 'Baterias', 'Celulares', 'Computadores', 'Monitores', 'Eletrodomésticos', 'Cabos e Carregadores']
  },
  {
    id: '2',
    name: 'Associação Recicla Mais',
    shortDescription: 'Cooperativa de reciclagem focada em papel, plástico, metais e papelão.',
    description: 'A Associação Recicla Mais une a preservação ambiental com o desenvolvimento social. Coletamos materiais recicláveis comuns gerados em residências e escritórios. Todo o material é triado e processado, gerando renda e sustento direto para dezenas de famílias de cooperados locais.',
    category: 'Recicláveis',
    address: 'Rua das Oliveiras, 450 - Bairro Industrial',
    hours: 'Segunda a Sexta: 07:00 às 17:00',
    phone: '(11) 91234-5678',
    rating: 4.6,
    acceptedMaterials: ['Papelão', 'Plástico PET', 'Latas de Alumínio', 'Papel de Escritório', 'Embalagens Longa Vida', 'Metais Diversos']
  },
  {
    id: '3',
    name: 'Ciclo Orgânico',
    shortDescription: 'Transformação de resíduos orgânicos residenciais em adubo de alta qualidade.',
    description: 'O Ciclo Orgânico incentiva a compostagem doméstica e urbana. Você nos traz seus resíduos de comida (cascas de frutas, vegetais, borra de café) e nós os transformamos em adubo orgânico de altíssima qualidade através de processos biológicos controlados. Em troca, você recebe mensalmente uma porção do adubo para suas plantas!',
    category: 'Orgânicos',
    address: 'Alameda das Flores, 88 - Jardim Primavera',
    hours: 'Quarta a Domingo: 09:00 às 16:00',
    phone: '(11) 97777-8888',
    rating: 4.9,
    acceptedMaterials: ['Restos de Frutas', 'Cascas de Legumes', 'Borra de Café', 'Folhas Secas', 'Cascas de Ovo', 'Serragem de Madeira']
  },
  {
    id: '4',
    name: 'Ponto Verde Vidros',
    shortDescription: 'Ponto especializado na coleta e destinação de garrafas e potes de vidro.',
    description: 'O vidro é 100% reciclável e pode ser reutilizado infinitamente sem perda de qualidade. No Ponto Verde, coletamos garrafas, potes de conserva, frascos e vidros planos quebras de forma segura. Solicitamos apenas que os materiais sejam devidamente limpos para evitar vetores de contaminação.',
    category: 'Vidros',
    address: 'Rua do Cristal, 305 - Vila Esperança',
    hours: 'Segunda a Sábado: 08:00 às 17:00',
    phone: '(11) 9654-2109',
    rating: 4.5,
    acceptedMaterials: ['Garrafas de Vidro', 'Potes de Conserva', 'Copos e Pratos de Vidro', 'Frascos de Perfume', 'Cacos de Vidro']
  },
  {
    id: '5',
    name: 'EcoÓleo Soluções',
    shortDescription: 'Coleta de óleo de cozinha usado para fabricação de sabão e biodiesel.',
    description: 'O descarte inadequado de óleo na pia entope as tubulações domésticas e polui rios e oceanos. O EcoÓleo oferece um destino sustentável: armazene seu óleo de fritura usado em garrafas PET e nos entregue. Nós o filtramos e transformamos em biodiesel e sabão ecológico de alta eficiência.',
    category: 'Óleo Usado',
    address: 'Av. das Nações, 1500 - Galpão B, Novo Horizonte',
    hours: 'Segunda a Sexta: 08:00 às 18:00',
    phone: '(11) 94444-5555',
    rating: 4.7,
    acceptedMaterials: ['Óleo de Cozinha Usado', 'Azeite de Oliva Usado', 'Gordura Vegetal Derretida']
  },
  {
    id: '6',
    name: 'Renova Baterias',
    shortDescription: 'Descarte de baterias de veículos, pilhas recarregáveis e chumbo.',
    description: 'Especializados no descarte e neutralização de componentes químicos perigosos provenientes de acumuladores elétricos, baterias automotivas e industriais. Trabalhamos conforme rígidas diretrizes ambientais para reprocessamento de componentes químicos sem riscos ao meio ambiente.',
    category: 'Eletrônicos',
    address: 'Rua Metalúrgica, 77 - Setor Industrial Norte',
    hours: 'Segunda a Sexta: 08:00 às 17:30',
    phone: '(11) 93333-2222',
    rating: 4.4,
    acceptedMaterials: ['Baterias Automotivas', 'Baterias de Nobreak', 'Pilhas Recarregáveis', 'Baterias de Lítio (Smartphones/Laptops)']
  }
];

export const categories = ['Todos', 'Eletrônicos', 'Recicláveis', 'Orgânicos', 'Vidros', 'Óleo Usado'];

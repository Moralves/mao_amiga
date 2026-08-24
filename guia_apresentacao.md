# Guia de Apresentação Técnica - Pontos de Coleta (Mão Amiga)

Este guia foi elaborado para ajudar no estudo e na apresentação técnica da nova funcionalidade desenvolvida no aplicativo.

---

## 1. Resumo Geral
Foi implementada uma funcionalidade completa para listagem, busca e detalhamento de pontos de coleta ecológicos fictícios para o projeto **Mão Amiga**:
- **Tela de Listagem**: Apresenta os pontos de coleta em formato de cards interativos com filtro dinâmico de texto e de categorias.
- **Tela de Detalhes**: Exibe informações aprofundadas como materiais específicos aceitos, endereço completo, horário de funcionamento e botões para ações de rotas ou ligações nativas.

---

## 2. Organização e Arquitetura do Código
A estrutura de arquivos foi organizada em pastas semânticas dentro do diretório `src/`:

```text
mao_amiga/
├── App.tsx                 # Gerencia o estado de navegação (Listagem <-> Detalhes)
├── index.ts                # Inicializador de entrada do Expo
└── src/
    ├── styles/
    │   └── theme.ts        # Design System (Cores padronizadas, sombras e espaçamentos)
    ├── types/
    │   └── types.ts        # Interfaces e modelos TypeScript de dados
    ├── data/
    │   └── mockPoints.ts   # Banco de dados mock de pontos de coleta e categorias
    ├── components/
    │   └── PointCard.tsx   # Card em formato buttoncard com efeitos visuais e feedbacks
    └── screens/
        ├── ListScreen.tsx  # Tela principal com input de pesquisa e listagem (FlatList)
        └── DetailScreen.tsx# Tela de detalhes estruturada com ScrollView e ações nativas
```

---

## 3. Fluxo de Navegação e Estados (Sem dependências externas)
O fluxo de transição entre as telas é gerenciado via controle de estados (`useState`) no componente principal `App.tsx`:

- **Estados no `App.tsx`**:
  - `currentScreen`: Controla se o aplicativo está exibindo `'list'` ou `'detail'`.
  - `selectedPoint`: Guarda o objeto do ponto que foi selecionado.
- **Ida**: Ao clicar no card, a tela de listagem chama `onSelectPoint` enviando os dados do ponto de coleta. O estado é modificado no `App.tsx`, remontando a tela para exibir o `DetailScreen`.
- **Retorno**: Ao clicar no botão "Voltar", a tela de detalhes aciona o callback `onBack`, limpando o ponto selecionado e voltando a exibir o `ListScreen`.

---

## 4. Lógica de Busca e Filtragem
Os filtros da tela principal são processados de forma otimizada usando `useMemo`:

- **Filtro Combinado**: A busca processa e combina simultaneamente a busca textual digitada (`searchQuery`) com a categoria rápida ativa (`selectedCategory`).
- **Abrangência da Busca**: O filtro de texto analisa e busca correspondências no:
  1. Nome do ponto de coleta.
  2. Descrição simplificada profissional.
  3. Categoria principal.
  4. Lista detalhada de materiais aceitos (permitindo pesquisar "pilhas" ou "papelão").
- **Visualização Otimizada**: Utiliza uma `FlatList` com `ListEmptyComponent` inteligente que exibe um feedback visual limpo e amigável com um botão para restaurar os filtros caso nenhum item corresponda à busca.

---

## 5. Diferenciais de Qualidade de Software
- **Design System Centralizado**: As cores e temas estão declarados no arquivo `theme.ts`, garantindo padronização global e fácil manutenção estética.
- **Tipagem Estrita**: Total segurança em tempo de compilação do TypeScript garantindo propriedades consistentes.
- **Ações Integradas com o Dispositivo**: Integração nativa com APIs do aparelho através do `Linking` para iniciar chamadas telefônicas ou abrir rotas no aplicativo de mapas do smartphone.
- **Componentes Interativos**: Cartões usando `Pressable` que respondem ao toque com transformações dinâmicas de escala e coloração de fundo para melhor experiência do usuário (UX).

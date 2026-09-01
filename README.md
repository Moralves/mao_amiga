# Mão Amiga

## Sobre o Projeto
O projeto Mão Amiga é um sistema desenvolvido para gerenciar a arrecadação, o controle de estoque e a distribuição de alimentos em pontos de coleta. O objetivo principal é garantir que as doações cheguem de forma justa e organizada a quem precisa, otimizando a logística de entrada e saída de mantimentos.

## Funcionalidades Principais
- Arrecadação de Alimentos: Registro da entrada de mantimentos recebidos por meio de doações.
- Controle de Estoque: Gerenciamento transparente da quantidade de alimentos disponíveis, monitorando de perto o fluxo de entradas e saídas.
- Distribuição Organizada: Controle do processo de entrega de alimentos aos beneficiários cadastrados.

## Visão de Futuro: Validação Global de Beneficiários
Para garantir uma distribuição justa e evitar o acúmulo indevido de recursos por uma única pessoa, o sistema contará com uma validação global de controle de retiradas.

A regra de negócio estabelece que, quando um usuário realizar a retirada de alimentos em um determinado ponto de coleta, essa ação será registrada globalmente no sistema. Caso esse mesmo usuário tente realizar uma nova retirada em qualquer outro ponto de coleta vinculado à rede, o sistema identificará o registro anterior e bloqueará a nova solicitação. Essa medida de segurança e controle assegura que as doações alcancem o maior número possível de famílias, mantendo a equidade do projeto.

---

## 🚀 Como Configurar e Rodar o Projeto

Siga o passo a passo abaixo para configurar seu ambiente de desenvolvimento e executar o aplicativo em qualquer computador, especialmente no ambiente Windows.

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

1. **[Node.js](https://nodejs.org/):** Necessário para gerenciar os pacotes e rodar o servidor do projeto. Recomendamos baixar a versão **LTS (Long Term Support)**. Ao instalar no Windows, deixe marcada a opção que adiciona o Node ao "PATH".
2. **[Git](https://git-scm.com/):** Para clonar o código do repositório para a sua máquina.
3. *(Opcional, mas recomendado)* **[Expo Go](https://expo.dev/go):** Um aplicativo para o seu smartphone (Android ou iOS) que permite testar o app físico facilmente sem precisar instalar pesados emuladores.
4. *(Opcional)* **Android Studio:** Caso queira rodar o aplicativo em um emulador Android direto no computador.

### 💻 Passo a Passo da Instalação

**1. Clone o repositório**
Abra o terminal (Prompt de Comando, PowerShell ou terminal do VS Code) e execute o comando abaixo para baixar o projeto:
```bash
git clone <URL_DO_REPOSITORIO>
```
*(Substitua `<URL_DO_REPOSITORIO>` pelo link deste repositório).*

**2. Acesse a pasta do projeto**
No mesmo terminal, entre na pasta que acabou de ser criada:
```bash
cd mao_amiga
```

**3. Instale as dependências**
Com o Node.js devidamente instalado, execute o comando a seguir. Ele baixará todos os pacotes e bibliotecas que o projeto utiliza (como o Expo e o React Native):
```bash
npm install
```

### ▶️ Como Rodar a Aplicação

Após a conclusão da instalação das dependências, você está pronto para iniciar o servidor de desenvolvimento.

**1. Inicie o servidor do Expo**
Execute o comando abaixo no terminal:
```bash
npm start
```
Isso iniciará o Metro Bundler e exibirá um **QR Code** no terminal (e possivelmente abrirá uma aba no seu navegador).

**2. Escolha como visualizar o app:**

- 📱 **No seu Celular Físico (Recomendado):** 
  - Instale o app **Expo Go** no seu celular.
  - Abra o Expo Go e escaneie o QR Code exibido no terminal do computador.
  - *Importante: O seu celular e o computador precisam estar conectados exatamente na mesma rede Wi-Fi.*

- 💻 **No Emulador Android (Computador):**
  - Se você tiver o Android Studio configurado com um dispositivo virtual (AVD) rodando, pressione a tecla `a` no terminal onde o Expo está executando.

- 🌐 **No Navegador Web:**
  - Pressione a tecla `w` no terminal para visualizar o aplicativo diretamente no navegador do seu PC.

### 🛠️ Possíveis Problemas no Windows (Troubleshooting)

Caso enfrente dificuldades no Windows, aqui estão as soluções mais comuns:

- **Erro de Execução de Scripts (PowerShell):** 
  Se ao rodar algum comando (`npm`, `expo`) você receber um erro vermelho dizendo que *a execução de scripts está desabilitada neste sistema*, abra o PowerShell como **Administrador**, cole o comando abaixo e pressione Enter:
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
  Digite `Y` (ou `S` para Sim) quando solicitado. Feche e reabra o terminal e tente novamente.

- **Comandos não reconhecidos:**
  Se o terminal disser que `'npm' não é reconhecido como um comando interno ou externo`, significa que o Node.js não foi instalado corretamente ou as variáveis de ambiente não foram atualizadas. Reinstale o Node.js certificando-se de marcar a opção "Add to PATH" e reinicie o computador.

- **App não carrega no celular via Wi-Fi:**
  Mude as propriedades da sua rede Wi-Fi no Windows de "Pública" para "Privada" para que o firewall não bloqueie a conexão do Expo.

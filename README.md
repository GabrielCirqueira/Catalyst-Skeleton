# Skeleton Symfony + React + Vite + Chakra UI

![image](https://github.com/user-attachments/assets/879c752c-fc46-4581-9761-df564a551129)

Este é um skeleton que integra o framework Symfony com React, usando o Vite como bundler e Chakra UI para estilização. Esse esqueleto foi projetado para fornecer uma estrutura inicial simples e eficiente para desenvolvimento de aplicações web modernas.

## Tecnologias

*   **Symfony:** Framework PHP robusto para construção de aplicações web.
*   **React:** Biblioteca JavaScript para criação de interfaces de usuário dinâmicas.
*   **Vite:** Bundler ultra-rápido para aplicações JavaScript e React.
*   **Chakra UI:** Biblioteca de componentes React para estilização com foco em acessibilidade e simplicidade.

## Instalação

### Pré-requisitos

Certifique-se de que você tenha o Composer (para o Symfony) e o Node.js (para o React e Vite) instalados no seu sistema.

*   [Instalar o Composer](https://getcomposer.org/download/)
*   [Instalar o Node.js](https://nodejs.org/)

### Passo 1: Instalar Dependências do PHP (Symfony)

No diretório raiz do projeto, execute o seguinte comando para instalar as dependências do PHP com o Composer:

```bash
composer install
 ```

Este comando irá ler o arquivo `composer.json` e instalar as dependências necessárias para o Symfony funcionar corretamente.

### Passo 2: Instalar Dependências do Node.js (React + Vite + Chakra UI)

Após instalar as dependências do PHP, vamos instalar as dependências do Node.js para o React, Vite, Chakra UI e outros pacotes.

1.  Navegue até o diretório do projeto onde está o `package.json` (geralmente na raiz do projeto).
2.  Execute o seguinte comando para instalar os pacotes:

 ```bash
 npm install
 ```

Esse comando irá ler o `package.json` e instalar todos os pacotes necessários, incluindo o React, Vite, Chakra UI, e outros módulos que seu projeto pode depender.

### Passo 3: Inicializar o Symfony

Com as dependências do Composer instaladas, inicie o servidor local do Symfony para rodar a parte backend da aplicação:

 ```bash
 symfony server:start
 ```

Isso irá iniciar o servidor de desenvolvimento do Symfony.

### Passo 4: Inicializar o Vite para React

Agora, inicie o Vite para rodar a aplicação React com hot-reloading. Execute o seguinte comando para iniciar o servidor de desenvolvimento:

 ```bash
 npm run dev
 ```

Este comando vai iniciar o Vite, que irá servir a aplicação React no endereço `http://localhost:5173` (ou o endereço configurado no `vite.config.js`).

### Passo 5: Acessar a Aplicação

*   Acesse o Symfony pelo endereço padrão: `http://localhost:8000`.
*   Acesse o frontend React servido pelo Vite: `http://localhost:5173`.

## Estrutura do Projeto

A estrutura do projeto está organizada da seguinte maneira:

```
/public
│── index.php                # Arquivo de entrada do Symfony
│
/assets
│── /js
│   │── index.tsx            # Arquivo principal do React
│   │
│   └── /components
│       └── HelloWorld.tsx   # Componente HelloWorld
│
│── /styles
│   └── style.css            # Arquivo de estilos principais (se necessário)
│
/templates
│── base.html.twig           # Template base do Symfony
│
/config
│── /packages
│   └── pentatrion_vite.yaml # Configuração do Vite no Symfony
│
vite.config.js               # Configuração do Vite
composer.json                # Dependências do Symfony (PHP)
package.json                 # Dependências do Node.js (React, Vite, Chakra UI)

```

## Como Funciona

*   O Symfony serve como backend e fornece as rotas para renderizar o frontend.
*   O React é utilizado para criar a interface de usuário interativa.
*   O Vite serve como bundler e servidor de desenvolvimento para a aplicação React.
*   Chakra UI é utilizado para estilizar o frontend de maneira simples e acessível.


## Como Usar

Este esqueleto foi projetado para servir como ponto de partida para o desenvolvimento de aplicações web modernas, combinando o poder do backend com Symfony e a flexibilidade do frontend com React, Vite e Chakra UI.

**Fluxo de Desenvolvimento:**

1.  **Backend (Symfony):**
    *   Desenvolva a lógica de negócios, APIs e rotas no Symfony.
    *   Crie os endpoints necessários para o frontend consumir dados e realizar ações.
    *   Utilize o sistema de templates do Symfony (Twig) para renderizar o HTML inicial e integrar o frontend React.

2.  **Frontend (React, Vite, Chakra UI):**
    *   Construa a interface de usuário com React, utilizando componentes reutilizáveis e gerenciamento de estado.
    *   Faça requisições para os endpoints do backend Symfony para obter dados e executar ações.
    *   Utilize o Vite para otimizar o processo de desenvolvimento, com hot-reloading e build rápido.
    *   Estilize a aplicação com Chakra UI, aproveitando seus componentes acessíveis e personalizáveis.

**Passos para Começar:**

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/GabrielCirqueira/Skeleton-Symfony-React.git
    ```

2.  **Instale as dependências:**
    *   Siga os passos de instalação descritos anteriormente para configurar o Symfony e o ambiente React.

3.  **Desenvolva:**
    *   Comece pelo backend, criando as rotas e controladores necessários no Symfony.
    *   Em seguida, desenvolva os componentes React e conecte-os aos endpoints do backend.
    *   Utilize o Vite para visualizar as alterações em tempo real durante o desenvolvimento.

4.  **Teste:**
    *   Certifique-se de testar tanto o backend (com testes unitários e de integração) quanto o frontend (com testes unitários e de componentes).

5.  **Implante:**
    *   Após finalizar o desenvolvimento e testes, prepare a aplicação para implantação em um servidor.
    *   Consulte a documentação do Symfony e do Vite para obter instruções sobre como realizar a implantação.



Este modelo oferece uma base sólida para construir aplicações web modernas e eficientes, explorando o melhor dos dois mundos: a robustez do Symfony no backend e a interatividade do React no frontend.

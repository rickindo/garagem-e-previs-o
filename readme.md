# Garagem Conectada: APIs Veiculares (Simulada) e Previsão de Viagem (Real) - B2.P1.A2

Esta versão da Garagem Inteligente Unificada evolui o projeto anterior ("Checkpoint Garagem Inteligente") integrando-o com duas fontes de dados externas: uma API simulada para obter detalhes extras dos veículos e uma API real (OpenWeatherMap) para fornecer previsão do tempo, auxiliando no planejamento de viagens.

**Objetivo:** Aprender e aplicar requisições assíncronas (`fetch`), manipular dados JSON de diferentes fontes (local e externa), atualizar a interface dinamicamente e entender o processo (e os cuidados) de uso de chaves de API reais.

## Funcionalidades Principais

*   **Gerenciamento da Garagem:** Adicionar diferentes tipos de veículos (Carro, Carro Esportivo, Caminhão), visualizar a lista, interagir com os veículos (ligar, desligar, acelerar, buzinar, funções específicas como turbo e carga/descarga).
*   **Manutenção:** Registrar histórico, visualizar agendamentos futuros e agendar novas manutenções para cada veículo.
*   **Persistência:** Os dados da garagem e o estado dos veículos são salvos no LocalStorage.

## Novas Funcionalidades (B2.P1.A2)

1.  **Detalhes Extras do Veículo (API Simulada):**
    *   Ao visualizar os detalhes de um veículo na garagem, um botão "Ver Detalhes Extras" foi adicionado.
    *   Ao clicar neste botão, a aplicação utiliza `fetch` para buscar informações adicionais (como Valor FIPE, Recalls Pendentes, Dicas de Manutenção, Última Localização Simulada) a partir do arquivo local `dados_veiculos_api.json`.
    *   A interface é atualizada dinamicamente para exibir esses detalhes ou mensagens de carregamento/erro/não encontrado.
    *   Demonstra o uso de `async/await` e `fetch` para recursos locais e manipulação de JSON.

2.  **Planejador de Viagem (API Real - OpenWeatherMap):**
    *   Uma nova seção "Planejar Viagem" foi adicionada à interface principal.
    *   O usuário pode digitar o nome de uma cidade de destino e clicar em "Verificar Clima".
    *   A aplicação faz uma requisição `fetch` real para a API OpenWeatherMap, usando uma chave de API (API Key).
    *   Busca e exibe a previsão do tempo atual para a cidade informada (temperatura, sensação térmica, descrição do tempo, umidade, etc.).
    *   Implementa tratamento básico de erros para cenários como cidade não encontrada, chave de API inválida ou problemas de rede.
    *   Demonstra o uso de `fetch` para APIs externas, construção de URLs de API, manipulação de JSON de resposta e gerenciamento (com ressalvas) de chaves de API.

## Configuração Necessária

### 1. API Simulada (dados_veiculos_api.json)

*   O arquivo `dados_veiculos_api.json` localizado na raiz do projeto contém dados de exemplo para a API simulada.
*   Você pode editar este arquivo para adicionar ou modificar detalhes de veículos.
*   **Importante:** Certifique-se de que cada objeto de veículo no JSON tenha um campo `placa` (ou `identificador`) que corresponda exatamente à placa do veículo cadastrado na garagem para que os detalhes possam ser encontrados.

### 2. API Real (OpenWeatherMap - Previsão do Tempo)

*   **Passo 1: Obtenha sua Chave de API (API Key)**
    1.  Acesse o site [OpenWeatherMap](https://openweathermap.org/).
    2.  Crie uma conta gratuita (geralmente requer confirmação por e-mail) e faça login.
    3.  Navegue até a seção "API keys" (Chaves de API) no seu painel de usuário (geralmente clicando no seu nome de usuário/perfil).
    4.  Copie sua chave de API padrão ("Default" key). Ela será uma longa sequência de caracteres hexadecimais.

*   **Passo 2: Configure a Chave no Código (MUITO IMPORTANTE - LEIA COM ATENÇÃO!)**
    *   **Método Utilizado Neste Projeto (Didático - INSEGURO):** Para os fins específicos deste exercício de aprendizado, onde estamos focados no JavaScript *frontend* puro, a chave da API OpenWeatherMap **foi colocada diretamente dentro do arquivo `js/main.js`**, na seguinte constante:
        ```javascript
        // DENTRO de js/main.js
        const OPENWEATHER_API_KEY = "SUA_CHAVE_COPIADA_DO_OPENWEATHERMAP_AQUI";
        ```
        *(Nota: No código do projeto, uma chave de exemplo ou a chave fornecida pelo usuário já deve estar inserida neste local).*
    *   **!!! ALERTA DE SEGURANÇA CRÍTICO !!!**
        **NUNCA, JAMAIS FAÇA ISSO EM UMA APLICAÇÃO REAL OU EM AMBIENTE DE PRODUÇÃO!** Colocar sua chave de API diretamente no código JavaScript do lado do cliente (frontend) significa que **qualquer pessoa** que visitar seu site pode facilmente encontrar sua chave inspecionando o código-fonte da página no navegador. Isso expõe sua chave a roubo e uso indevido, o que pode resultar em custos inesperados na sua conta da API ou até mesmo no bloqueio do seu acesso.
    *   **Método Seguro (Recomendado para Produção):** A maneira correta e segura de proteger chaves de API é utilizando um **backend (servidor)** como intermediário (conhecido como *proxy*). Seu código frontend faria uma requisição para o *seu próprio* backend. O backend, então (onde a chave estaria armazenada de forma segura, por exemplo, em variáveis de ambiente carregadas de um arquivo `.env`), faria a requisição real para a API externa (OpenWeatherMap) e devolveria os dados para o frontend. Desta forma, a chave nunca fica exposta no navegador do usuário.
    *   **Sobre o Arquivo `.env`:** Embora você possa ver um arquivo `.env` mencionado em alguns contextos ou mesmo presente na estrutura de pastas (e idealmente listado no `.gitignore`), ele **não foi utilizado** para carregar a chave do OpenWeatherMap nesta implementação específica de frontend puro. Isso ocorre porque variáveis de ambiente (`process.env`) não são diretamente acessíveis pelo JavaScript que roda no navegador sem o uso de ferramentas de build (como Webpack, Parcel, Vite) ou um backend. A menção a `.env` serve principalmente para ilustrar onde chaves *deveriam* ser guardadas em um cenário de produção mais robusto e a importância de usar o `.gitignore` para proteger arquivos que contenham segredos.

## Como Usar a Aplicação

1.  Clone ou baixe este repositório.
2.  (Opcional) Edite o arquivo `dados_veiculos_api.json` para personalizar os detalhes extras dos veículos simulados.
3.  **Certifique-se** de que a constante `OPENWEATHER_API_KEY` dentro do arquivo `js/main.js` contém a sua chave de API válida do OpenWeatherMap (lembrando sempre do aviso de segurança acima).
4.  Abra o arquivo `index.html` diretamente no seu navegador web.
5.  Use o formulário "Adicionar Veículo" para popular sua garagem.
6.  Clique no botão "Detalhes / Interagir" de um veículo na lista da garagem para ver a tela de detalhes.
7.  Na tela de detalhes:
    *   Use os botões de interação (Ligar, Acelerar, etc.).
    *   Agende ou veja o histórico de manutenção.
    *   Clique no botão **"Ver Detalhes Extras"** para carregar e exibir os dados da API simulada (`dados_veiculos_api.json`).
8.  Volte para a visualização principal da garagem.
9.  Na seção **"Planejar Viagem"**:
    *   Digite o nome de uma cidade no campo "Cidade de Destino".
    *   Clique no botão **"Verificar Clima"**.
    *   Aguarde enquanto a aplicação busca os dados da API OpenWeatherMap.
    *   Veja a previsão do tempo atual exibida na área de resultados. Teste com cidades válidas e inválidas para ver o tratamento de erro.

## Tecnologias e Conceitos Aprendidos/Testados

*   HTML5 Semântico
*   CSS3 para estilização e layout responsivo básico
*   JavaScript (ES6+)
    *   Manipulação do DOM (Document Object Model)
    *   Programação Orientada a Objetos (Classes: `Veiculo`, `Carro`, `CarroEsportivo`, `Caminhao`, `Manutencao`)
    *   Herança de classes
    *   Módulos JavaScript (separação em arquivos: `main.js`, `ui.js`, `storage.js`, `veiculo.js`, `manuntencao.js`)
    *   **Requisições HTTP Assíncronas:** `fetch` API
    *   **JavaScript Assíncrono:** `async / await` para lidar com Promises
    *   **Manipulação de JSON:** `JSON.parse()` (implícito no `response.json()`), `JSON.stringify()`
    *   Tratamento de Erros (`try...catch`) em operações assíncronas e validações
    *   Uso do `LocalStorage` para persistência de dados
    *   Event Listeners e manipulação de eventos
*   **APIs:**
    *   Consumo de API simulada (arquivo JSON local)
    *   Consumo de API externa real (OpenWeatherMap)
    *   Obtenção e uso de Chave de API (com ênfase nas implicações de segurança)
    *   Construção de URLs de requisição com parâmetros
*   **Documentação:**
    *   Uso de JSDoc para comentar funções e classes no código JavaScript.
    *   Criação de `README.md` detalhado.
*   **Controle de Versão:** Uso de Git e GitHub (e importância do `.gitignore` para arquivos como `.env`).

## Estrutura do Projeto
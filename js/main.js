// js/main.js

// --- Estado da Aplicação ---
let garagem = []; // Array principal de veículos
let veiculoAtualPlaca = null; // Guarda a placa do veículo sendo visto nos detalhes

// --- Referências de Elementos ---
const btnVoltarGaragem = document.getElementById('btn-voltar-garagem');
const formAddVeiculo = document.getElementById('form-add-veiculo'); // Added missing ref
const formAgendamento = document.getElementById('form-agendamento'); // Added missing ref
const listaGaragemElement = document.getElementById('lista-garagem'); // Added missing ref
const veiculoTipoSelect = document.getElementById('veiculo-tipo'); // Added missing ref
// Added for API features
const detalhesExtrasApiElement = document.getElementById('detalhes-extras-api');
const btnVerDetalhesExtras = document.getElementById('btn-ver-detalhes-extras'); // Button within details view
const destinoViagemInput = document.getElementById('destino-viagem');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const previsaoTempoResultadoElement = document.getElementById('previsao-tempo-resultado');

// --- Objetos de Áudio ---
// Certifique-se de ter os arquivos mp3 na mesma pasta ou fornecer o caminho correto
const somLigar = new Audio("som_ligar.mp3");
const somDesligar = new Audio("som_desligar.mp3");
const somBuzina = new Audio("som_buzina.mp3");
const somAcelerar = new Audio("som_acelerar.mp3"); // Opcional
const somTurbo = new Audio("som_turbo.mp3"); // Opcional
const somCarga = new Audio("som_carga.mp3"); // Opcional


// --- Constantes ---
// !!! INSECURE: API Key directly in code for DEMO ONLY !!!
// Sua chave OpenWeatherMap foi inserida aqui.
// Lembre-se do aviso de segurança: NÃO FAÇA ISSO EM PRODUÇÃO REAL!
const OPENWEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608"; // <<< SUA CHAVE INSERIDA AQUI
const DADOS_VEICULOS_API_URL = './dados_veiculos_api.json'; // Path to your JSON file

// --- Funções de Lógica ---

/** Encontra veículo pela placa. */
function encontrarVeiculo(placa) {
    return garagem.find(v => v.placa === placa);
}

/** Adiciona veículo (Atualizado para CarroEsportivo e Caminhao com capacidade) */
function handleAddVeiculo(event) {
    event.preventDefault();
    const tipo = document.getElementById('veiculo-tipo').value;
    const placa = document.getElementById('veiculo-placa').value.trim().toUpperCase();
    const modelo = document.getElementById('veiculo-modelo').value.trim();
    const cor = document.getElementById('veiculo-cor').value.trim();

    if (!placa || !modelo || !cor) {
        exibirNotificacao("Placa, modelo e cor são obrigatórios.", "error"); return;
    }
    if (encontrarVeiculo(placa)) {
        exibirNotificacao(`Placa ${placa} já existe.`, "error"); return;
    }

    let novoVeiculo = null;
    try {
        switch (tipo) {
            case 'Carro':
                const numPortasCarro = document.getElementById('carro-portas').value;
                novoVeiculo = new Carro(placa, modelo, cor, numPortasCarro);
                break;
            case 'CarroEsportivo': // Novo
                const numPortasEsportivo = document.getElementById('carroesportivo-portas').value;
                novoVeiculo = new CarroEsportivo(placa, modelo, cor, numPortasEsportivo);
                break;
            case 'Caminhao':
                const numEixos = document.getElementById('caminhao-eixos').value;
                const capacidade = document.getElementById('caminhao-capacidade').value; // Pega capacidade
                novoVeiculo = new Caminhao(placa, modelo, cor, numEixos, capacidade);
                break;
            default:
                exibirNotificacao("Tipo de veículo inválido.", "error"); return;
        }

        garagem.push(novoVeiculo);
        salvarGaragem(garagem);
        exibirVeiculos(garagem);
        exibirNotificacao(`${tipo} ${placa} adicionado com sucesso!`, "success");
        limparFormulario('form-add-veiculo');

    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        exibirNotificacao(`Erro ao adicionar: ${error.message}`, "error");
    }
}

/** Adiciona agendamento de manutenção */
function handleAgendarManutencao(event) {
    event.preventDefault();
    const placa = document.getElementById('agendamento-veiculo-placa').value;
    const data = document.getElementById('agenda-data').value;
    const tipo = document.getElementById('agenda-tipo').value.trim();
    const custo = document.getElementById('agenda-custo').value;
    const descricao = document.getElementById('agenda-descricao').value.trim();

    if (!placa || !data || !tipo || custo === '') {
        exibirNotificacao("Preencha Data, Tipo e Custo.", "error"); return;
    }
    if (parseFloat(custo) < 0) {
        exibirNotificacao("Custo não pode ser negativo.", "error"); return;
    }

    const veiculo = encontrarVeiculo(placa);
    if (!veiculo) {
        exibirNotificacao(`Veículo ${placa} não encontrado.`, "error"); return;
    }

    try {
        const novaManutencao = new Manutencao(data, tipo, parseFloat(custo), descricao);
        if (!novaManutencao.validar()) {
            exibirNotificacao("Dados da manutenção inválidos.", "error"); return;
        }
        if (veiculo.adicionarManutencao(novaManutencao)) {
            salvarGaragem(garagem);
            exibirDetalhesCompletos(veiculo); // Reexibe detalhes atualizados
            exibirNotificacao(`Manutenção para ${placa} agendada!`, "success");
            limparFormulario('form-agendamento');
        } else {
            exibirNotificacao("Não foi possível adicionar a manutenção.", "error");
        }
    } catch(error) {
        console.error("Erro ao agendar:", error);
        exibirNotificacao(`Erro ao agendar: ${error.message}`, "error");
    }
}

/** Verifica e exibe lembretes de agendamento */
function verificarAgendamentos() {
    const hoje = new Date(); const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    hoje.setHours(0, 0, 0, 0); amanha.setHours(0, 0, 0, 0);

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            const dataManutencao = new Date(manutencao.data);
            dataManutencao.setHours(0, 0, 0, 0);
            if (dataManutencao.getTime() === hoje.getTime()) {
                exibirNotificacao(`Lembrete HOJE: ${manutencao.formatar()} p/ ${veiculo.placa}`, 'warning', 10000);
            } else if (dataManutencao.getTime() === amanha.getTime()) {
                exibirNotificacao(`Lembrete AMANHÃ: ${manutencao.formatar()} p/ ${veiculo.placa}`, 'info', 10000);
            }
        });
    });
}

/** Manipula clique nos botões de detalhes na lista da garagem */
function handleClickDetalhesGaragem(event) {
    if (event.target.classList.contains('btn-detalhes')) {
        const placa = event.target.dataset.placa;
        const veiculo = encontrarVeiculo(placa);
        if (veiculo) {
            veiculoAtualPlaca = placa; // Guarda a placa do veículo atual
            exibirDetalhesCompletos(veiculo); // Chama a função que mostra tudo
        } else {
            exibirNotificacao(`Veículo ${placa} não encontrado.`, "error");
            veiculoAtualPlaca = null;
        }
    }
}


// --- Funções de API (NEW) ---

/**
 * Busca detalhes extras de um veículo na API simulada (JSON local).
 * @param {string} identificadorVeiculo - A placa ou identificador único.
 * @returns {Promise<object|null>} Os dados do veículo ou null se não encontrado/erro.
 * @throws {Error} Lança erro se a requisição falhar ou JSON for inválido.
 * @async
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    try {
        const response = await fetch(DADOS_VEICULOS_API_URL);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        // Assume 'identificador' or 'placa' field exists in the JSON objects
        const detalhes = data.find(v => v.identificador === identificadorVeiculo || v.placa === identificadorVeiculo);
        return detalhes || null; // Retorna null se não encontrar
    } catch (error) {
        console.error("Erro ao buscar detalhes do veículo na API simulada:", error);
        // Lança o erro para ser tratado por quem chamou
        throw new Error(`Falha ao carregar detalhes extras: ${error.message}`);
    }
}

/**
 * Busca a previsão do tempo atual para uma cidade usando a API OpenWeatherMap.
 * @param {string} nomeCidade - O nome da cidade.
 * @returns {Promise<object>} Objeto com dados formatados da previsão.
 * @throws {Error} Lança erro se a cidade não for encontrada, chave inválida, ou erro de rede/API.
 * @async
 */
async function buscarPrevisaoTempo(nomeCidade) {
    // A chave já está definida na constante OPENWEATHER_API_KEY
    if (!OPENWEATHER_API_KEY) { // Verificação básica
         throw new Error("Chave da API OpenWeatherMap não configurada!");
    }
    if (!nomeCidade) {
        throw new Error("Nome da cidade não pode ser vazio.");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);
        const data = await response.json(); // Tenta ler JSON mesmo se não ok, para pegar msg de erro da API

        if (!response.ok) {
            // OpenWeatherMap geralmente retorna uma mensagem no 'data.message' em caso de erro
            // Erros comuns: 'city not found' (404), 'Invalid API key' (401)
            throw new Error(data.message || `Erro HTTP ${response.status}`);
        }

        // Verifica se os dados esperados existem (pode variar um pouco com a API)
        if (!data.main || !data.weather || !data.weather[0]) {
             throw new Error("Resposta da API inválida ou incompleta.");
        }

        // Extrai e formata os dados relevantes
        const previsaoFormatada = {
            temperatura: data.main.temp,
            sensacao: data.main.feels_like,
            tempMin: data.main.temp_min,
            tempMax: data.main.temp_max,
            umidade: data.main.humidity,
            descricao: data.weather[0].description,
            icone: data.weather[0].icon, // Código do ícone
            ventoVelocidade: data.wind.speed,
            // Adicionar mais dados se necessário (ex: pressão, visibilidade)
        };
        return previsaoFormatada;

    } catch (error) {
        console.error("Erro ao buscar previsão do tempo:", error);
        // Propaga o erro com uma mensagem mais genérica ou específica da API se disponível
        // Mantém a mensagem original que pode ser 'city not found', 'Invalid API key', etc.
        throw new Error(`Falha ao buscar clima: ${error.message}`);
    }
}


// --- Handlers de Eventos para API (NEW) ---

/**
 * Manipula o clique no botão "Ver Detalhes Extras" dentro da seção de detalhes.
 * @async
 */
async function handleVerDetalhesExtras() {
    if (!veiculoAtualPlaca) {
         exibirNotificacao("Nenhum veículo selecionado nos detalhes.", "warning");
         return;
    }
    const placa = veiculoAtualPlaca; // Usa a placa do veículo atualmente em detalhes

    // Verifica se o elemento existe antes de usá-lo
    if (!detalhesExtrasApiElement) {
        console.error("Elemento #detalhes-extras-api não encontrado no DOM.");
        return;
    }

    exibirLoading(detalhesExtrasApiElement, "Buscando detalhes extras..."); // Show loading in the specific div

    try {
        const detalhes = await buscarDetalhesVeiculoAPI(placa);
        exibirDetalhesExtrasAPI(detalhes); // Update UI with data or 'not found' message
    } catch (error) {
        console.error(`Erro no handler handleVerDetalhesExtras para ${placa}:`, error);
        exibirNotificacao(error.message, "error"); // Show error notification
        detalhesExtrasApiElement.innerHTML = `<p class="notificacao-error">Erro ao carregar detalhes extras.</p>`; // Show error in the div
    }
}


/**
 * Manipula o clique no botão "Verificar Clima".
 * @async
 */
async function handleVerificarClima() {
     // Verifica se os elementos existem
    if (!destinoViagemInput || !previsaoTempoResultadoElement) {
        console.error("Elementos do formulário de clima não encontrados no DOM.");
        return;
    }

    const nomeCidade = destinoViagemInput.value.trim();
    if (!nomeCidade) {
        exibirNotificacao("Por favor, digite o nome da cidade de destino.", "warning");
        return;
    }

    exibirLoading(previsaoTempoResultadoElement, `Buscando previsão para ${nomeCidade}...`);

    try {
        const previsao = await buscarPrevisaoTempo(nomeCidade);
        exibirPrevisaoTempo(previsao, nomeCidade); // Update UI with weather data
    } catch (error) {
        console.error("Erro no handler handleVerificarClima:", error);
        // Exibir a mensagem de erro específica capturada (da API ou de rede)
        exibirErroPrevisao(error.message); // Display specific error in the result area
        // Não precisa de notificação extra, pois o erro já aparece na área de resultado
        // exibirNotificacao(`Erro ao buscar clima: ${error.message}`, "error");
    }
}


// --- Funções de Interação ---
/**
 * Função genérica para lidar com cliques nos botões de interação.
 * @param {'ligar'|'desligar'|'acelerar'|'buzinar'|'turbo'|'carregar'|'descarregar'} acao
 */
function handleInteracao(acao) {
    if (!veiculoAtualPlaca) {
        exibirNotificacao("Nenhum veículo selecionado para interação.", "error");
        return;
    }
    const veiculo = encontrarVeiculo(veiculoAtualPlaca);
    if (!veiculo) {
        exibirNotificacao("Erro: Veículo atual não encontrado.", "error");
        return;
    }

    let resultado = "";
    let somParaTocar = null;

    try {
        switch (acao) {
            case 'ligar':
                resultado = veiculo.ligar();
                if (resultado.includes("ligado!")) somParaTocar = somLigar;
                break;
            case 'desligar':
                resultado = veiculo.desligar();
                if (resultado.includes("desligado!")) somParaTocar = somDesligar;
                break;
            case 'acelerar':
                resultado = veiculo.acelerar(); // Usa incremento padrão da classe
                // somParaTocar = somAcelerar; // Opcional
                break;
            case 'buzinar':
                resultado = veiculo.buzinar();
                somParaTocar = somBuzina;
                break;
            case 'turbo':
                if (veiculo instanceof CarroEsportivo) {
                    resultado = veiculo.turboAtivado ? veiculo.desativarTurbo() : veiculo.ativarTurbo();
                    if (resultado.includes("ativado!")) somParaTocar = somTurbo; // Opcional
                } else { resultado = "Ação não aplicável."; }
                break;
            case 'carregar':
                if (veiculo instanceof Caminhao) {
                    resultado = veiculo.carregar(1000); // Valor fixo para o botão
                    if(resultado.includes("carregado")) somParaTocar = somCarga; // Opcional
                } else { resultado = "Ação não aplicável."; }
                break;
            case 'descarregar':
                if (veiculo instanceof Caminhao) {
                    resultado = veiculo.descarregar(500); // Valor fixo
                    if(resultado.includes("descarregado")) somParaTocar = somCarga; // Opcional
                } else { resultado = "Ação não aplicável."; }
                break;
            // Adicionar case 'frear' se implementar
            default:
                resultado = "Ação desconhecida.";
        }

        // Exibe o resultado da ação
        exibirNotificacao(resultado, resultado.includes("Erro") || resultado.includes("não aplicável") || resultado.includes("Pare o veículo") || resultado.includes("Ligue o veículo") ? "warning" : "info");

        // Toca o som se houver
        if (somParaTocar) {
            somParaTocar.currentTime = 0; // Reinicia caso esteja tocando
            somParaTocar.play().catch(e => console.warn("Erro ao tocar som:", e)); // Evita erro se interação rápida
        }

        // Atualiza a UI de status e botões
        atualizarDetalhesInteracao(veiculo);

        // Salva o estado alterado no LocalStorage
        salvarGaragem(garagem);

    } catch (error) {
        console.error(`Erro durante a ação ${acao}:`, error);
        exibirNotificacao(`Erro inesperado ao ${acao}. Verifique o console.`, "error");
    }
}


// --- Inicialização e Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // --- !! API Key Check !! ---
    // Verifica se a chave parece válida (não vazia e diferente do placeholder)
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "SUA_CHAVE_REAL_DO_OPENWEATHERMAP_AQUI") {
        console.warn("AVISO DE SEGURANÇA E FUNCIONALIDADE: A chave da API OpenWeatherMap não foi definida corretamente em main.js ou ainda é o placeholder. A funcionalidade de previsão do tempo NÃO funcionará. Lembre-se que colocar a chave diretamente no código frontend NÃO é seguro para produção.");
        exibirNotificacao("Chave OpenWeatherMap não configurada ou inválida. Previsão do tempo desativada.", "warning", 10000);
        // Desabilita a seção de clima se a chave não estiver configurada
         if (verificarClimaBtn) verificarClimaBtn.disabled = true;
         if (destinoViagemInput) {
            destinoViagemInput.disabled = true;
            destinoViagemInput.placeholder = "Funcionalidade desativada (sem API key)";
         }
    } else {
         // Garante que os campos estejam habilitados se a chave estiver presente
         if (verificarClimaBtn) verificarClimaBtn.disabled = false;
         if (destinoViagemInput) {
             destinoViagemInput.disabled = false;
             destinoViagemInput.placeholder = "Ex: Rio de Janeiro";
         }
         console.info("Chave OpenWeatherMap encontrada. Funcionalidade de previsão do tempo habilitada.");
    }


    garagem = carregarGaragem();
    exibirVeiculos(garagem);

    // Listeners dos formulários
    if (formAddVeiculo) formAddVeiculo.addEventListener('submit', handleAddVeiculo);
    if (formAgendamento) formAgendamento.addEventListener('submit', handleAgendarManutencao);

    // Listener para botões de detalhes na lista da garagem (delegado)
    if (listaGaragemElement) listaGaragemElement.addEventListener('click', handleClickDetalhesGaragem);

    // Listener para voltar
    if (btnVoltarGaragem) {
        btnVoltarGaragem.addEventListener('click', () => {
            veiculoAtualPlaca = null; // Limpa seleção ao voltar
            mostrarGaragemView();
        });
    }

    // Listeners para os botões de INTERAÇÃO (dentro da seção de detalhes)
    // Adicionar verificações se os elementos existem antes de adicionar listeners
    const btnLigar = document.getElementById('btn-detail-ligar');
    if (btnLigar) btnLigar.addEventListener('click', () => handleInteracao('ligar'));
    const btnDesligar = document.getElementById('btn-detail-desligar');
    if (btnDesligar) btnDesligar.addEventListener('click', () => handleInteracao('desligar'));
    const btnAcelerar = document.getElementById('btn-detail-acelerar');
    if (btnAcelerar) btnAcelerar.addEventListener('click', () => handleInteracao('acelerar'));
    const btnBuzinar = document.getElementById('btn-detail-buzinar');
    if (btnBuzinar) btnBuzinar.addEventListener('click', () => handleInteracao('buzinar'));
    const btnTurbo = document.getElementById('btn-detail-turbo');
    if (btnTurbo) btnTurbo.addEventListener('click', () => handleInteracao('turbo'));
    const btnCarregar = document.getElementById('btn-detail-carregar');
    if (btnCarregar) btnCarregar.addEventListener('click', () => handleInteracao('carregar'));
    const btnDescarregar = document.getElementById('btn-detail-descarregar');
    if (btnDescarregar) btnDescarregar.addEventListener('click', () => handleInteracao('descarregar'));
    // Adicionar listener para Frear se implementar o botão

    // --- Listener para o botão de buscar DETALHES EXTRAS API (dentro dos detalhes) ---
    if (btnVerDetalhesExtras) btnVerDetalhesExtras.addEventListener('click', handleVerDetalhesExtras);

    // --- Listener para o botão de buscar PREVISÃO DO TEMPO ---
    if (verificarClimaBtn) verificarClimaBtn.addEventListener('click', handleVerificarClima);
    // Add listener for Enter key in city input
    if (destinoViagemInput) {
        destinoViagemInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                // Verifica se o botão não está desabilitado antes de chamar
                if (!verificarClimaBtn || !verificarClimaBtn.disabled) {
                    handleVerificarClima();
                }
            }
        });
    }

    // Listener para select de tipo de veículo no form
    if (veiculoTipoSelect) {
        veiculoTipoSelect.addEventListener('change', atualizarCamposEspecificos);
        atualizarCamposEspecificos(); // Estado inicial
    }

    verificarAgendamentos(); // Verifica lembretes

    console.log("Garagem Conectada (com APIs) inicializada.");
});
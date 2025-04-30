

// ... (keep existing references)
const detalhesExtrasApiElement = document.getElementById('detalhes-extras-api');
const btnVerDetalhesExtras = document.getElementById('btn-ver-detalhes-extras'); // Button WITHIN details section
const previsaoTempoResultadoElement = document.getElementById('previsao-tempo-resultado');

/**
 * Exibe a lista de veículos na interface.
 * ADDED: "Ver Detalhes Extras" button.
 * @param {Veiculo[]} veiculos
 */
function exibirVeiculos(veiculos) {
    listaGaragemElement.innerHTML = '';
    if (veiculos.length === 0) {
        listaGaragemElement.innerHTML = '<p>Nenhum veículo na garagem.</p>';
        return;
    }
    veiculos.forEach(veiculo => {
        const li = document.createElement('li');
        // Use getInfo(false) for a cleaner look in the list
        // Wrap buttons in a div for better layout control if needed
        li.innerHTML = `
            <p><strong>${veiculo.placa}</strong> - ${veiculo.modelo} (${veiculo.cor}) - <em>${veiculo.status}</em></p>
            <div class="botoes-container">
                <button class="btn-detalhes" data-placa="${veiculo.placa}">Detalhes / Interagir</button>
                {/* REMOVED: Button moved inside details section
                <button class="btn-ver-extras" data-placa="${veiculo.placa}">Extras API</button>
                */}
            </div>
        `;
        li.classList.add(`veiculo-${veiculo._tipoVeiculo.toLowerCase()}`);
        listaGaragemElement.appendChild(li);
    });
}

// ... (keep atualizarDetalhesInteracao as is)

/**
 * Exibe a seção de detalhes completa (Manutenção + Interação).
 * ADDED: Resets the API details area. Sets listener for the API button inside details.
 * @param {Veiculo} veiculo - O veículo a ser exibido.
 */
function exibirDetalhesCompletos(veiculo) {
    if (!veiculo) return;

    detalhesTituloElement.textContent = `Detalhes - ${veiculo.placa} (${veiculo.modelo})`;
    agendamentoPlacaInput.value = veiculo.placa; // For scheduling form

    // --- Reset API Details Area ---
    detalhesExtrasApiElement.innerHTML = '<p>Clique no botão "Ver Detalhes Extras" para carregar.</p>';
    // Make sure the button for fetching extra details is linked to the current vehicle
    btnVerDetalhesExtras.dataset.placa = veiculo.placa; // Set placa on the button

    // --- Update Interaction ---
    atualizarDetalhesInteracao(veiculo); // Calls the function for status and buttons

    // --- Update Maintenance (existing code) ---
    // ... (keep maintenance update logic as is) ...
    listaHistoricoElement.innerHTML = '';
    listaAgendamentosElement.innerHTML = '';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let historicoCount = 0;
    let agendamentoCount = 0;
    veiculo.historicoManutencao.sort((a, b) => b.data - a.data); // Ensure order
    veiculo.historicoManutencao.forEach(manutencao => {
        const li = document.createElement('li');
        li.textContent = manutencao.formatar();
        const dataManutencao = new Date(manutencao.data);
        dataManutencao.setHours(0,0,0,0);
        if (dataManutencao <= hoje) {
            listaHistoricoElement.appendChild(li); historicoCount++;
        } else {
            listaAgendamentosElement.appendChild(li); agendamentoCount++;
        }
    });
    if (historicoCount === 0) listaHistoricoElement.innerHTML = '<li>Nenhum histórico registrado.</li>';
    if (agendamentoCount === 0) listaAgendamentosElement.innerHTML = '<li>Nenhum agendamento futuro.</li>';


    // --- Show/Hide Sections ---
    detalhesSection.style.display = 'block';
    garagemSection.style.display = 'none';
    addVehicleSection.style.display = 'none';
}

// --- NEW UI Helper Functions ---

/**
 * Displays the fetched extra vehicle details in the designated area.
 * @param {object|null} data - The details object or null if not found.
 */
function exibirDetalhesExtrasAPI(data) {
    if (data) {
        detalhesExtrasApiElement.innerHTML = `
            <p><strong>Valor FIPE:</strong> ${data.valorFipe || 'N/D'}</p>
            <p><strong>Recall Pendente:</strong> ${data.recallPendente || 'N/D'}</p>
            <p><strong>Dica Manutenção:</strong> ${data.dicaManutencao || 'N/D'}</p>
            <p><strong>Última Localização (Simulada):</strong> ${data.ultimaLocalizacao || 'N/D'}</p>
        `;
    } else {
        detalhesExtrasApiElement.innerHTML = '<p>Nenhum detalhe extra encontrado para esta placa na API simulada.</p>';
    }
}

/**
 * Displays the fetched weather forecast in the designated area.
 * @param {object} data - The formatted weather data object.
 * @param {string} nomeCidade - The name of the city.
 */
function exibirPrevisaoTempo(data, nomeCidade) {
    previsaoTempoResultadoElement.innerHTML = `
        <p><strong>Clima em ${nomeCidade}:</strong> ${data.descricao}</p>
        <p><strong>Temperatura:</strong> ${data.temperatura}°C</p>
        <p><strong>Sensação Térmica:</strong> ${data.sensacao}°C</p>
        <p><strong>Umidade:</strong> ${data.umidade}%</p>
        <p><strong>Vento:</strong> ${data.ventoVelocidade} m/s</p> {/* OpenWeatherMap default is m/s */}
    `;
}

/**
 * Displays an error message in the weather forecast area.
 * @param {string} mensagem - The error message.
 */
function exibirErroPrevisao(mensagem) {
    previsaoTempoResultadoElement.innerHTML = `<p class="notificacao-error" style="padding: 5px; color: #721c24; background-color: #f8d7da; border-color: #f5c6cb;">Erro: ${mensagem}</p>`;
}

/**
 * Displays a loading message in a specific element.
 * @param {HTMLElement} element - The DOM element to update.
 * @param {string} message - The loading message.
 */
function exibirLoading(element, message = "Carregando...") {
    element.innerHTML = `<p><em>${message}</em></p>`;
}


// ... (keep mostrarGaragemView, exibirNotificacao, limparFormulario, atualizarCamposEspecificos)
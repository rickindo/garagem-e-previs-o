const GARAGEM_STORAGE_KEY = 'garagemInteligenteData_v3'; // Nova versão pela mudança na estrutura

/**
 * Salva a lista de veículos no LocalStorage.
 * Inclui propriedades de interação (ligado, velocidade, carga, turbo).
 * @param {Veiculo[]} veiculos - O array de objetos Veiculo a ser salvo.
 */
function salvarGaragem(veiculos) {
    try {
        // JSON.stringify vai incluir as novas propriedades automaticamente
        const dataToSave = JSON.stringify(veiculos);
        localStorage.setItem(GARAGEM_STORAGE_KEY, dataToSave);
    } catch (error) {
        console.error("Erro ao salvar dados da garagem no LocalStorage:", error);
        exibirNotificacao("Erro crítico ao salvar dados. Verifique o console.", "error", 0); // Permanente
    }
}

/**
 * Carrega a lista de veículos do LocalStorage.
 * Reconstrói os objetos Veiculo, incluindo CarroEsportivo e propriedades de interação.
 * @returns {Veiculo[]} O array de objetos Veiculo reconstruídos ou vazio.
 */
function carregarGaragem() {
    try {
        const dataJSON = localStorage.getItem(GARAGEM_STORAGE_KEY);
        if (!dataJSON) return [];

        const veiculosPlain = JSON.parse(dataJSON);
        const veiculosReconstruidos = [];

        for (const veiculoPlain of veiculosPlain) {
            let veiculoReal = null;

            // Recria histórico de manutenção ANTES de criar o veículo
            const historicoReconstruido = veiculoPlain.historicoManutencao.map(mPlain =>
                new Manutencao(new Date(mPlain.data), mPlain.tipo, mPlain.custo, mPlain.descricao)
            );

            // Cria instância correta
            switch (veiculoPlain._tipoVeiculo) {
                case 'Carro':
                    veiculoReal = new Carro(veiculoPlain.placa, veiculoPlain.modelo, veiculoPlain.cor, veiculoPlain.numPortas);
                    break;
                case 'CarroEsportivo': // Novo caso
                     veiculoReal = new CarroEsportivo(veiculoPlain.placa, veiculoPlain.modelo, veiculoPlain.cor, veiculoPlain.numPortas);
                     // Atribui estado salvo do turbo
                     veiculoReal.turboAtivado = veiculoPlain.turboAtivado || false;
                     break;
                case 'Caminhao':
                     veiculoReal = new Caminhao(veiculoPlain.placa, veiculoPlain.modelo, veiculoPlain.cor, veiculoPlain.numEixos, veiculoPlain.capacidadeCarga);
                     // Atribui carga salva
                     veiculoReal.cargaAtual = veiculoPlain.cargaAtual || 0;
                     break;
                case 'Veiculo':
                default:
                    console.warn(`Tipo de veículo desconhecido: ${veiculoPlain._tipoVeiculo}. Criando como Veiculo base.`);
                    veiculoReal = new Veiculo(veiculoPlain.placa, veiculoPlain.modelo, veiculoPlain.cor);
                    break;
            }

            // Atribui propriedades comuns e histórico
            if (veiculoReal) {
                veiculoReal.historicoManutencao = historicoReconstruido;
                // Atribui propriedades de interação salvas
                veiculoReal.ligado = veiculoPlain.ligado || false;
                veiculoReal.velocidade = veiculoPlain.velocidade || 0;
                veiculoReal.status = veiculoPlain.status || (veiculoReal.ligado ? "Ligado" : "Na Garagem"); // Restaura status

                veiculosReconstruidos.push(veiculoReal);
            }
        }
        return veiculosReconstruidos;

    } catch (error) {
        console.error("Erro ao carregar/parsear dados da garagem:", error);
        exibirNotificacao("Erro ao carregar dados salvos. Resetando para garagem vazia.", "error");
        localStorage.removeItem(GARAGEM_STORAGE_KEY); // Remove dados corrompidos
        return [];
    }
}
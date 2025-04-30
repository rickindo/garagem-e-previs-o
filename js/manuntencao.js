/**
 * Representa um registro de manutenção de um veículo.
 */
class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {string|Date} data - A data da manutenção (pode ser string 'YYYY-MM-DD' ou objeto Date).
     * @param {string} tipo - O tipo de serviço realizado (ex: "Troca de óleo").
     * @param {number} custo - O custo do serviço.
     * @param {string} [descricao=''] - Uma descrição opcional do serviço.
     */
    constructor(data, tipo, custo, descricao = '') {
        // Garante que a data seja um objeto Date, mesmo que venha como string
        if (!(data instanceof Date)) {
            try {
                // Adiciona T00:00:00 para evitar problemas de fuso ao converter só a data
                this.data = new Date(data + 'T00:00:00');
                if (isNaN(this.data.getTime())) { // Verifica se a data resultante é válida
                   throw new Error('Data inválida fornecida.');
                }
            } catch (e) {
                console.error("Erro ao criar data da manutenção:", e);
                this.data = new Date(); // Usa data atual como fallback em caso de erro
            }
        } else {
            this.data = data;
        }

        this.tipo = tipo || 'Serviço não especificado'; // Valor padrão se tipo for vazio
        this.custo = parseFloat(custo) || 0; // Garante que custo seja número, 0 se inválido
        this.descricao = descricao;

        // Validação básica no construtor
        if (this.custo < 0) {
             console.warn("Custo da manutenção não pode ser negativo. Ajustado para 0.");
             this.custo = 0;
        }
         if (!this.tipo.trim()) {
             console.warn("Tipo de manutenção não pode ser vazio. Usando valor padrão.");
             this.tipo = 'Serviço não especificado';
         }
    }

    /**
     * Retorna uma representação formatada da manutenção.
     * @returns {string} A string formatada.
     */
    formatar() {
        const dataFormatada = this.data.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // UTC para consistência com a entrada
        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let resultado = `${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            resultado += ` (${this.descricao})`;
        }
        return resultado;
    }

    /**
     * Valida os dados da manutenção.
     * @returns {boolean} True se os dados são válidos, False caso contrário.
     */
    validar() {
        const isDataValida = this.data instanceof Date && !isNaN(this.data.getTime());
        const isTipoValido = typeof this.tipo === 'string' && this.tipo.trim().length > 0;
        const isCustoValido = typeof this.custo === 'number' && this.custo >= 0;
        return isDataValida && isTipoValido && isCustoValido;
    }
}
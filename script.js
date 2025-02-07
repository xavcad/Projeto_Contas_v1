class ContaModel {
    constructor(descricao, valor, vencimento, tipo) {
        this.descricao = descricao;
        this.valor = valor;
        this.vencimento = vencimento;
        this.tipo = tipo;
        this.status = 'pendente';
    }

    async salvar() {
        try {
            const response = await fetch('/api/contas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao salvar conta:', error);
            throw error;
        }
    }

    static async buscarCategorias() {
        try {
            const response = await fetch('/api/categorias.php');
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
    }

    static async filtrarContas(filtros) {
        try {
            const response = await fetch('/api/contas.php?' + new URLSearchParams(filtros));
            return await response.json();
        } catch (error) {
            console.error('Erro ao filtrar contas:', error);
            throw error;
        }
    }
}

class ContaView {
    constructor() {
        this.form = document.getElementById('contaForm');
        this.tabelaPagar = document.getElementById('tabelaPagar').getElementsByTagName('tbody')[0];
        this.tabelaReceber = document.getElementById('tabelaReceber').getElementsByTagName('tbody')[0];
        this.totalizadores = {
            pagar: { total: 0, pago: 0, pendente: 0 },
            receber: { total: 0, pago: 0, pendente: 0 }
        };
        this.carregarCategorias();
    }

    async carregarCategorias() {
        try {
            const categorias = await ContaModel.buscarCategorias();
            const selectCategorias = document.getElementById('categoria');
            const selectFiltro = document.getElementById('filtroCategoria');
            
            categorias.forEach(cat => {
                selectCategorias.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
                selectFiltro.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    limparFormulario() {
        this.form.reset();
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    atualizarTotalizadores() {
        document.getElementById('totalPagar').textContent = this.formatarMoeda(this.totalizadores.pagar.total);
        document.getElementById('pagoPagar').textContent = this.formatarMoeda(this.totalizadores.pagar.pago);
        document.getElementById('pendentePagar').textContent = this.formatarMoeda(this.totalizadores.pagar.pendente);

        document.getElementById('totalReceber').textContent = this.formatarMoeda(this.totalizadores.receber.total);
        document.getElementById('pagoReceber').textContent = this.formatarMoeda(this.totalizadores.receber.pago);
        document.getElementById('pendenteReceber').textContent = this.formatarMoeda(this.totalizadores.receber.pendente);
    }

    adicionarConta(conta) {
        const tabela = conta.tipo === 'pagar' ? this.tabelaPagar : this.tabelaReceber;
        const row = tabela.insertRow();
        const valor = parseFloat(conta.valor);
        
        // Atualizar totalizadores
        this.totalizadores[conta.tipo].total += valor;
        this.totalizadores[conta.tipo].pendente += valor;
        this.atualizarTotalizadores();
        
        row.innerHTML = `
            <td>${conta.descricao}</td>
            <td class="valor">${this.formatarMoeda(valor)}</td>
            <td>${new Date(conta.vencimento).toLocaleDateString()}</td>
            <td><span class="status-badge status-pendente">Pendente</span></td>
            <td>
                <button class="btn btn-success" onclick="presenter.alternarStatus(this)">✓</button>
                <button class="btn btn-danger" onclick="presenter.removerConta(this)">✕</button>
            </td>
        `;
    }

    limparTabelas() {
        this.tabelaPagar.innerHTML = '';
        this.tabelaReceber.innerHTML = '';
        this.resetTotalizadores();
    }

    resetTotalizadores() {
        this.totalizadores = {
            pagar: { total: 0, pago: 0, pendente: 0 },
            receber: { total: 0, pago: 0, pendente: 0 }
        };
        this.atualizarTotalizadores();
    }
}

class ContaPresenter {
    constructor() {
        this.view = new ContaView();
        this.inicializarEventos();
    }

    inicializarEventos() {
        this.view.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const conta = new ContaModel(
                document.getElementById('descricao').value,
                document.getElementById('valor').value,
                document.getElementById('vencimento').value,
                document.getElementById('tipo').value
            );

            try {
                await conta.salvar();
                this.view.adicionarConta(conta);
                this.view.limparFormulario();
            } catch (error) {
                alert('Erro ao adicionar conta');
            }
        });
    }

    alternarStatus(button) {
        const row = button.closest('tr');
        const statusCell = row.cells[3].firstChild;
        const valor = parseFloat(row.cells[1].textContent.replace(/[^\d,-]/g, '').replace(',', '.'));
        const tipo = row.closest('table').id === 'tabelaPagar' ? 'pagar' : 'receber';
        
        if (statusCell.classList.contains('status-pendente')) {
            statusCell.textContent = 'Pago';
            statusCell.classList.replace('status-pendente', 'status-pago');
            this.view.totalizadores[tipo].pendente -= valor;
            this.view.totalizadores[tipo].pago += valor;
        } else {
            statusCell.textContent = 'Pendente';
            statusCell.classList.replace('status-pago', 'status-pendente');
            this.view.totalizadores[tipo].pago -= valor;
            this.view.totalizadores[tipo].pendente += valor;
        }
        
        this.view.atualizarTotalizadores();
    }

    removerConta(button) {
        const row = button.closest('tr');
        const valor = parseFloat(row.cells[1].textContent.replace(/[^\d,-]/g, '').replace(',', '.'));
        const tipo = row.closest('table').id === 'tabelaPagar' ? 'pagar' : 'receber';
        const statusCell = row.cells[3].firstChild;
        
        if (statusCell.classList.contains('status-pendente')) {
            this.view.totalizadores[tipo].pendente -= valor;
        } else {
            this.view.totalizadores[tipo].pago -= valor;
        }
        this.view.totalizadores[tipo].total -= valor;
        
        row.remove();
        this.view.atualizarTotalizadores();
    }

    async aplicarFiltros() {
        const filtros = {
            dataInicio: document.getElementById('filtroDataInicio').value,
            dataFim: document.getElementById('filtroDataFim').value,
            categoria: document.getElementById('filtroCategoria').value,
            status: document.getElementById('filtroStatus').value
        };

        try {
            this.view.limparTabelas();
            const contas = await ContaModel.filtrarContas(filtros);
            contas.forEach(conta => this.view.adicionarConta(conta));
        } catch (error) {
            alert('Erro ao filtrar contas');
        }
    }
}

const presenter = new ContaPresenter(); 
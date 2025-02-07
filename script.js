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
        this.dashboard = new DashboardView();
        this.atualizarGraficos();
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

    atualizarGraficos() {
        // Atualizar gráfico de distribuição
        this.dashboard.graficoPizza.data.datasets[0].data = [
            this.totalizadores.pagar.total,
            this.totalizadores.receber.total
        ];
        this.dashboard.graficoPizza.update();

        // Atualizar gráfico de evolução
        const meses = this.obterUltimosMeses(6);
        this.dashboard.graficoLinha.data.labels = meses.map(m => m.nome);
        this.dashboard.graficoLinha.data.datasets[0].data = meses.map(m => m.saldo);
        this.dashboard.graficoLinha.update();

        // Atualizar indicadores
        document.getElementById('saldoAtual').textContent = 
            this.formatarMoeda(this.totalizadores.receber.total - this.totalizadores.pagar.total);
        
        document.getElementById('previsaoMensal').textContent = 
            this.formatarMoeda(this.calcularPrevisaoMensal());
    }

    obterUltimosMeses(quantidade) {
        const meses = [];
        const hoje = new Date();
        
        for (let i = quantidade - 1; i >= 0; i--) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            meses.push({
                nome: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                saldo: Math.random() * 10000 - 5000 // Exemplo: dados aleatórios
            });
        }
        
        return meses;
    }

    calcularPrevisaoMensal() {
        const receitaMedia = this.totalizadores.receber.total / 6; // média últimos 6 meses
        const despesaMedia = this.totalizadores.pagar.total / 6;
        return receitaMedia - despesaMedia;
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
        this.atualizarGraficos();
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
        this.view.atualizarGraficos();
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
        this.view.atualizarGraficos();
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

class DashboardView {
    constructor() {
        Chart.defaults.color = '#cccccc';
        Chart.defaults.font.family = "'Segoe UI', Arial, sans-serif";

        this.graficoPizza = new Chart(
            document.getElementById('graficoDistribuicao'),
            {
                type: 'doughnut',
                data: {
                    labels: ['A Pagar', 'A Receber'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: [
                            'var(--danger-color)',
                            'var(--success-color)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'var(--text-primary)',
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            }
        );

        this.graficoLinha = new Chart(
            document.getElementById('graficoEvolucao'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Fluxo de Caixa',
                        data: [],
                        borderColor: 'var(--accent-color)',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(140, 198, 63, 0.1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                callback: value => this.formatarMoeda(value)
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            }
        );
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            notation: 'compact'
        }).format(valor);
    }
}

class ExportView {
    gerarPDF() {
        const doc = new jsPDF();
        
        // Adicionar cabeçalho
        doc.setFontSize(20);
        doc.text('Relatório Financeiro', 105, 15, { align: 'center' });
        
        // Adicionar data
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
        
        // Adicionar tabelas
        let y = 40;
        ['pagar', 'receber'].forEach(tipo => {
            doc.setFontSize(14);
            doc.text(`Contas a ${tipo}`, 14, y);
            
            // ... lógica para adicionar dados da tabela
            
            y += 80;
        });
        
        doc.save('relatorio-financeiro.pdf');
    }
}

function handleScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', handleScroll);
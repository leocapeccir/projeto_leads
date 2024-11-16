document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos
    const modal = document.getElementById('modal');
    const openModalBtn = document.getElementById('openModalBtn');
    const fecharModalAluno = document.getElementById('consultarAlunosModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const searchInput = document.getElementById('searchInput');
    const filterField = document.getElementById('filterField');
    const leadsListModal = document.getElementById('leadsListModal');
    const leadForm = document.getElementById('leadForm'); // Formulário de cadastro de leads
    const turmaSelect = document.getElementById('turma'); // Select de turmas
    

    
    // Função para abrir o modal e carregar leads
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            fetchLeads(); // Carregar leads ao abrir o modal
        });
    }

    // Função para fechar o modal
    if (closeModalBtn || fecharModalAluno) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';

        });
    }


    
    // Função para fechar o modal
    function fecharModal() {
        consultarAlunosModal.style.display = 'none';
    }

    // Fechar o modal quando clicar fora da área do modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Função de filtro de leads enquanto o usuário digita
    if (searchInput) {
        searchInput.addEventListener('input', async function() {
            const campoFiltro = filterField.value; // Captura o filtro selecionado
            const valorFiltro = searchInput.value.trim(); // Captura o valor da busca

            // Se o campo de busca estiver vazio, exibe todos os leads
            if (valorFiltro.length === 0) {
                fetchLeads();
                return;
            }

            try {
                let url = 'http://localhost:3000/leads?';

                // Para os filtros Nome e Email
                if (campoFiltro === 'nome' || campoFiltro === 'email') {
                    url += `${campoFiltro}=${encodeURIComponent(valorFiltro)}`;
                }
                
                // Para o filtro de Curso, usamos o campo 'cursointeresse'
                if (campoFiltro === 'curso') {
                    url += `cursointeresse=${encodeURIComponent(valorFiltro)}`;
                }

                const response = await fetch(url);
                const leads = await response.json();

                // Exibe os resultados
                displayLeads(leads);
            } catch (err) {
                console.error('Erro ao buscar leads:', err);
            }
        });
    }

    // Função para exibir os leads no modal
    function displayLeads(leads) {
        leadsListModal.innerHTML = ''; // Limpar resultados anteriores

        if (leads.length === 0) {
            leadsListModal.innerHTML = '<p>Nenhum lead encontrado.</p>';
            return;
        }

        const cursosMap = {
            1: " 1-Desenvolvimento Web",
            2: " 2- Desenvolvimento Full Stack",
            3: " 3- Marketing Digital",
            4: " 4- Data Science",
            5: " 5- Gestão de Projetos",
            6: " 6-UX/UI Design",
        };
        leads.forEach(lead => {
            const leadBox = document.createElement('div');
            leadBox.classList.add('lead-box');
            leadBox.innerHTML = `
                <h3><strong>Nome: </strong>${lead.nome}</h3>
                <p><strong>Telefone: </strong> ${lead.telefone}</p>
                <p><strong>Email: </strong> ${lead.email}</p>
                <p><strong>Curso:</strong> ${cursosMap[lead.cursointeresse] || 'Curso não encontrado'}</p>
            `;
            leadsListModal.appendChild(leadBox);
        });
    }

    // Função para buscar e renderizar todos os leads
    async function fetchLeads() {
        try {
            const response = await fetch('http://localhost:3000/get-leads');
            const leads = await response.json();
            displayLeads(leads);
        } catch (error) {
            console.error('Erro ao buscar os leads:', error);
        }
    }

    // Função para verificar se há leads cadastrados ao carregar a página
    checkLeadsExist();

    async function checkLeadsExist() {
        try {
            const response = await fetch('http://localhost:3000/check-leads');
            const data = await response.json();
            console.log('Verificação de leads:', data);
            if (data.hasLeads) {
                openModalBtn.style.display = 'block';
            }
        } catch (err) {
            console.error('Erro ao verificar leads:', err);
        }
    }

    // Função para cadastrar um novo lead
    if (leadForm) {
        leadForm.addEventListener('submit', async function (e) {
            e.preventDefault();  // Impede o comportamento padrão do formulário

            const nome = document.getElementById('nome').value;
            const telefone = document.getElementById('telefone').value;
            const email = document.getElementById('email').value;
            const curso = document.getElementById('curso').value;

            const lead = { nome, telefone, email, cursoInteresse: curso };

            try {
                const response = await fetch('http://localhost:3000/cadastrar-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lead),
                });

                if (response.ok) {
                    alert('Lead cadastrado com sucesso!');
                    leadForm.reset();  // Resetar o formulário
                } else {
                    const errorData = await response.json();
                    alert('Erro ao cadastrar lead: ' + errorData.error);
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                alert('Erro ao enviar os dados');
            }
        });
    }

    // Função para gerar código de matrícula
   
    // Função para buscar e popular as turmas no select
    async function fetchTurmas() {
        try {
            const response = await fetch('http://localhost:3000/api/turmas');
            const turmas = await response.json();

            // Verifica se existem turmas
            if (turmas.length === 0) {
                console.warn('Nenhuma turma disponível.');
                return;
            }

            // Popula o select com as turmas
            if (turmaSelect) {
                turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>'; // Limpar opções anteriores
                turmas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.id;
                    option.textContent = turma.descricao;
                    turmaSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar turmas:', error);
        }
    }

    // Carregar as turmas assim que o DOM for carregado
    fetchTurmas();
});

// Função para cadastrar um aluno
if (leadForm) {
    leadForm.addEventListener('submit', async function (e) {
        e.preventDefault();  // Impede o comportamento padrão do formulário

        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;
        const curso = document.getElementById('curso').value;
        const turma = document.getElementById('turma').value;

        // Verificar se todos os campos estão preenchidos
        if (!nome || !telefone || !email || !curso || !turma) {
            mensagemErro.textContent = 'Todos os campos são obrigatórios!';
            return;
        } else {
            mensagemErro.textContent = ''; // Limpar mensagem de erro
        }

        const lead = { aluno: nome, telefone, email, curso, turma };

        try {
            const response = await fetch('http://localhost:3000/cadastrar-aluno', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Aluno cadastrado com sucesso! Código de matrícula: ' + data.codigomatricula);
                leadForm.reset();  // Resetar o formulário
            } else {
                const errorData = await response.json();
                alert('Erro ao cadastrar aluno: ' + errorData.mensagem);
            }
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            alert('Erro ao enviar os dados');
        }
    });
}
// Função para consultar alunos matriculados
async function consultarAlunos() {
    try {
        const response = await fetch('http://localhost:3000/consultar-alunos');
        const alunos = await response.json();
        
        if (alunos.length === 0) {
            console.log('Nenhum aluno matriculado.');
            return;
        }

        // Exibir os alunos no frontend (por exemplo, em um modal ou tabela)
        alunos.forEach(aluno => {
            const alunoBox = document.createElement('div');
            alunoBox.classList.add('aluno-box');
            alunoBox.innerHTML = `
                <h3><strong>Aluno: </strong>${aluno.aluno}</h3>
                <p><strong>Código Matrícula: </strong>${aluno.codigomatricula}</p>
                <p><strong>Curso: </strong>${aluno.curso}</p>
                <p><strong>Turma: </strong>${aluno.turma}</p>
            `;
            leadsListModal.appendChild(alunoBox);
        });
    } catch (error) {
        console.error('Erro ao consultar alunos:', error);
    }
}

// Chamar a função de consulta ao carregar a página ou ao abrir o modal
consultarAlunos();


// Função para abrir o modal
function abrirModal() {
    const modal = document.getElementById('consultarAlunosModal');
    modal.style.display = 'flex'; // Exibe o modal
    consultarAlunos(); // Carrega os dados dos alunos
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('consultarAlunosModal');
    modal.style.display = 'none'; // Esconde o modal
}

// Função para buscar e exibir os alunos
async function consultarAlunos() {
    try {
        const response = await fetch('http://localhost:3000/consultar-alunos');
        const alunos = await response.json();
        const turmasMap = {
            1: "Turma A",
            2: "Turma B",
            3: "Turma C",
            4: "Turma D",
            5: "Turma E",
            6: "Turma F",
          
        };

        const cursosMatricula = {
            1: " Desenvolvimento Web",
            2: " Desenvolvimento Full Stack",
            3: " Marketing Digital",
            4: " Data Science",
            5: " Gestão de Projetos",
            6: " UX/UI Design",
        };
        const tabelaAlunos = document.getElementById('tabelaAlunos').getElementsByTagName('tbody')[0];
        tabelaAlunos.innerHTML = ''; // Limpa a tabela antes de preencher

        alunos.forEach(aluno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${cursosMatricula[aluno.cursoid]}</td>
                <td>${turmasMap[aluno.turmaid]}</td>
            `;
            tabelaAlunos.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao consultar alunos:', error);
    }
}

// Função para cadastrar o aluno
// Função para matricular o aluno
function matricularAluno(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Pegando os dados do formulário
    const curso = document.getElementById('curso').value;
    const turma = document.getElementById('turma').value;
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;

    // Verificar se todos os campos obrigatórios foram preenchidos
    if (!curso || !turma || !nome || !email || !telefone) {
        alert("Todos os campos são obrigatórios!");
        return;
    }

    // Dados a serem enviados para o servidor
    const aluno = {
        nome,
        email,
        telefone,
        cursoId: curso,
        turmaId: turma
    };

    // Enviar os dados para o servidor via fetch
    fetch('http://localhost:3000/matricular-aluno', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aluno)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Erro: ${data.error}`);
        } else {
            alert('Aluno matriculado com sucesso!');
            document.getElementById('formMatricula').reset(); // Limpa o formulário
        }
    })
    .catch(error => {
        console.error('Erro ao matricular aluno:', error);
        alert('Erro ao matricular aluno. Tente novamente.');
    });
}

// Carregar as turmas quando o curso for selecionado
document.getElementById('curso').addEventListener('change', function() {
    const cursoId = this.value;

    if (!cursoId) return; // Não faz nada se não houver curso selecionado

    // Fazer a requisição para buscar as turmas
    fetch(`http://localhost:3000/api/turmas?cursoId=${cursoId}`)
        .then(response => response.json())
        .then(turmas => {
            const turmaSelect = document.getElementById('turma');
            turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>'; // Resetar as opções
            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = turma.nome;
                turmaSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar turmas:', error);
            alert('Erro ao carregar as turmas.');
        });
});










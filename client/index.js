document.addEventListener("DOMContentLoaded", () => {
  // Seleção de elementos
  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("openModalBtn");
  const fecharModalAluno = document.getElementById("consultarAlunosModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const searchInput = document.getElementById("searchInput");
  const filterField = document.getElementById("filterField");
  const leadsListModal = document.getElementById("leadsListModal");
  const leadForm = document.getElementById("leadForm");
  const turmaSelect = document.getElementById("turma");

  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      modal.style.display = "block";
      fetchLeads();
    });
  }

  if (closeModalBtn || fecharModalAluno) {
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  const hideAllInstructions = () => {
    const allCursos = document.querySelectorAll('[id^="buscarCurso"]');
    allCursos.forEach((curso) => {
      curso.style.display = "none";
    });
  };

  if (filterField) {
    filterField.addEventListener("change", function () {
      const campoFiltro = this.value; // Pega o valor selecionado no filtro
      const searchInput = document.getElementById("searchInput");

      hideAllInstructions();

      if (campoFiltro === "curso") {
        document.getElementById("buscarCurso1").style.display = "block";
        document.getElementById("buscarCurso2").style.display = "block";
        document.getElementById("buscarCurso3").style.display = "block";
        document.getElementById("buscarCurso4").style.display = "block";
        document.getElementById("buscarCurso5").style.display = "block";
        document.getElementById("buscarCurso6").style.display = "block";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", async function () {
      const campoFiltro = filterField.value;
      const valorFiltro = searchInput.value.trim();

      if (valorFiltro.length === 0) {
        fetchLeads();
        return;
      }

      try {
        let url = "http://localhost:3000/leads?";

        if (campoFiltro === "nome" || campoFiltro === "email") {
          url += `${campoFiltro}=${encodeURIComponent(valorFiltro)}`;
        }

        if (campoFiltro === "curso") {
          url += `cursointeresse=${encodeURIComponent(valorFiltro)}`;
        }

        const response = await fetch(url);
        const leads = await response.json();

        displayLeads(leads);
      } catch (err) {
        console.error("Erro ao buscar leads:", err);
      }
    });
  }

  function displayLeads(leads) {
    leadsListModal.innerHTML = "";

    if (leads.length === 0) {
      leadsListModal.innerHTML = "<p>Nenhum lead encontrado.</p>";
      return;
    }

    const cursosMap = {
      1: " Desenvolvimento Web",
      2: " Desenvolvimento Full Stack",
      3: " Marketing Digital",
      4: " Data Science",
      5: " Gestão de Projetos",
      6: " UX/UI Design",
    };

    leads.forEach((lead) => {
      const leadBox = document.createElement("div");
      leadBox.classList.add("lead-box");
      leadBox.innerHTML = `
                <h3><strong>Nome: </strong>${lead.nome}</h3>
                <p><strong>Telefone: </strong> ${lead.telefone}</p>
                <p><strong>Email: </strong> ${lead.email}</p>
                <p><strong>Curso:</strong> ${
                  cursosMap[lead.cursointeresse] || "Curso não encontrado"
                }</p>
            `;
      leadsListModal.appendChild(leadBox);
    });
  }

  async function fetchLeads() {
    try {
      const response = await fetch("http://localhost:3000/get-leads");
      const leads = await response.json();
      displayLeads(leads);
    } catch (error) {
      console.error("Erro ao buscar os leads:", error);
    }
  }

  checkLeadsExist();

  async function checkLeadsExist() {
    try {
      const response = await fetch("http://localhost:3000/check-leads");
      const data = await response.json();
      console.log("Verificação de leads:", data);
      if (data.hasLeads) {
        openModalBtn.style.display = "block";
      }
    } catch (err) {
      console.error("Erro ao verificar leads:", err);
    }
  }

  if (leadForm) {
    leadForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nome = document.getElementById("nome").value;
      const telefone = document.getElementById("telefone").value;
      const email = document.getElementById("email").value;
      const curso = document.getElementById("curso").value;

      const lead = { nome, telefone, email, cursoInteresse: curso };

      try {
        const response = await fetch("http://localhost:3000/cadastrar-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        });

        if (response.ok) {
          alert("Lead cadastrado com sucesso!");
          leadForm.reset();
        } else {
          const errorData = await response.json();
          alert("Erro ao cadastrar lead: " + errorData.error);
        }
      } catch (error) {
        console.error("Erro ao enviar o formulário:", error);
        alert("Erro ao enviar os dados");
      }
    });
  }

  async function fetchTurmas() {
    try {
      const response = await fetch("http://localhost:3000/api/turmas");
      const turmas = await response.json();

      if (turmas.length === 0) {
        console.warn("Nenhuma turma disponível.");
        return;
      }

      if (turmaSelect) {
        turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
        turmas.forEach((turma) => {
          const option = document.createElement("option");
          option.value = turma.id;
          option.textContent = turma.descricao;
          turmaSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    }
  }

  fetchTurmas();
});

if (leadForm) {
  leadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;
    const curso = document.getElementById("curso").value;
    const turma = document.getElementById("turma").value;

    if (!nome || !telefone || !email || !curso || !turma) {
      mensagemErro.textContent = "Todos os campos são obrigatórios!";
      return;
    } else {
      mensagemErro.textContent = "";
    }

    const lead = { aluno: nome, telefone, email, curso, turma };

    try {
      const response = await fetch("http://localhost:3000/cadastrar-aluno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          "Aluno cadastrado com sucesso! Código de matrícula: " +
            data.codigomatricula
        );
        leadForm.reset();
      } else {
        const errorData = await response.json();
        alert("Erro ao cadastrar aluno: " + errorData.mensagem);
      }
    } catch (error) {
      console.error("Erro ao enviar o formulário:", error);
      alert("Erro ao enviar os dados");
    }
  });
}

async function consultarAlunos() {
  try {
    const response = await fetch("http://localhost:3000/consultar-alunos");
    const alunos = await response.json();

    if (alunos.length === 0) {
      console.log("Nenhum aluno matriculado.");
      return;
    }

    alunos.forEach((aluno) => {
      const alunoBox = document.createElement("div");
      alunoBox.classList.add("aluno-box");
      alunoBox.innerHTML = `
                <h3><strong>Aluno: </strong>${aluno.aluno}</h3>
                <p><strong>Código Matrícula: </strong>${aluno.codigomatricula}</p>
                <p><strong>Curso: </strong>${aluno.curso}</p>
                <p><strong>Turma: </strong>${aluno.turma}</p>
            `;
      leadsListModal.appendChild(alunoBox);
    });
  } catch (error) {
    console.error("Erro ao consultar alunos:", error);
  }
}

consultarAlunos();

function abrirModal() {
  const modal = document.getElementById("consultarAlunosModal");
  modal.style.display = "flex";
  consultarAlunos();
}

function fecharModal() {
  const modal = document.getElementById("consultarAlunosModal");
  modal.style.display = "none";
}

async function consultarAlunos() {
  try {
    const response = await fetch("http://localhost:3000/consultar-alunos");
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
    const tabelaAlunos = document
      .getElementById("tabelaAlunos")
      .getElementsByTagName("tbody")[0];
    tabelaAlunos.innerHTML = "";

    alunos.forEach((aluno) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${cursosMatricula[aluno.cursoid]}</td>
                <td>${turmasMap[aluno.turmaid]}</td>
            `;
      tabelaAlunos.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao consultar alunos:", error);
  }
}

function matricularAluno(event) {
  event.preventDefault();

  const curso = document.getElementById("curso").value;
  const turma = document.getElementById("turma").value;
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;

  if (!curso || !turma || !nome || !email || !telefone) {
    alert("Todos os campos são obrigatórios!");
    return;
  }

  const aluno = {
    nome,
    email,
    telefone,
    cursoId: curso,
    turmaId: turma,
  };

  fetch("http://localhost:3000/matricular-aluno", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(aluno),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(`Erro: ${data.error}`);
      } else {
        alert("Aluno matriculado com sucesso!");
        document.getElementById("formMatricula").reset();
      }
    })
    .catch((error) => {
      console.error("Erro ao matricular aluno:", error);
      alert("Erro ao matricular aluno. Tente novamente.");
    });
}

async function atualizarTurmas() {
  const cursoSelecionado = document.getElementById("curso").value;
  const turmaSelect = document.getElementById("turma");

  turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';

  if (!cursoSelecionado) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api-turmas?cursoId=${cursoSelecionado}`
    );
    if (!response.ok) {
      throw new Error("Erro ao carregar turmas");
    }

    const turmas = await response.json();

    turmas.forEach((turma) => {
      const option = document.createElement("option");
      option.value = turma.id;
      option.textContent = turma.descricao;
      turmaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao atualizar turmas:", error);
  }
}

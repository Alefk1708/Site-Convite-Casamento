 // Função para obter os dados de confirmações
 async function fetchConfirmados() {
    try {
        const response = await fetch("https://localhost:5000"); // Altere a URL conforme necessário
        if (!response.ok) {
            throw new Error("Erro ao buscar confirmações.");
        }
        const data = await response.json();
        displayConfirmados(data);
    } catch (error) {
        console.error("Erro:", error);
        alert("Não foi possível carregar os dados.");
    }
}

// Função para exibir os dados de confirmações na página
function displayConfirmados(data) {
    const totalPessoasElement = document.getElementById("total-pessoas");
    const confirmadosTableBody = document.getElementById("confirmados-table").querySelector("tbody");

    // Atualiza o número total de pessoas
    totalPessoasElement.textContent = data.totalPessoas;

    // Limpa a tabela antes de preencher
    confirmadosTableBody.innerHTML = "";

    // Adiciona as confirmações na tabela
    data.confirmacoes.forEach(confirmacao => {
        const row = document.createElement("tr");

        const nomeCell = document.createElement("td");
        nomeCell.textContent = confirmacao.name;
        row.appendChild(nomeCell);

        const acompanhantesCell = document.createElement("td");
        acompanhantesCell.textContent = confirmacao.guests;
        row.appendChild(acompanhantesCell);

        confirmadosTableBody.appendChild(row);
    });
}

// Função para recarregar a página e buscar a lista atualizada
function reloadPage() {
    fetchConfirmados();
}

// Chama a função para carregar as confirmações ao carregar a página
window.onload = fetchConfirmados;
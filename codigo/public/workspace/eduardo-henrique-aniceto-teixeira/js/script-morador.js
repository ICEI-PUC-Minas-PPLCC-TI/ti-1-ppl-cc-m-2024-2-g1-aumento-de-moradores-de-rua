// Função criar cards dinamicamente
async function gerarCards() {
    const container = document.getElementById('cards-container');

    // Fazendo o fetch dos dados do servidor
    try {
        const response = await fetch('/pessoas');
        
        // Caso de sucesso
        if (!response.ok) {
            throw new Error('Erro ao carregar os itens do estoque');
        }

        // Convertendo a resposta para JSON
        const moradores = await response.json();

        // Iterando itens do estoque e criando os cards
        moradores.forEach(pessoa => {
            const card = `
                <div class="col-sm-3 mb-3">
                    <div class="card">
                        <img src="${pessoa.imgPerfil}" class="card-img-top" alt="${pessoa.nome}">
                        <div class="card-body">
                            <h5 class="card-title">${pessoa.nome}</h5>
                            <p class="card-text">${pessoa.tipo}</p>
                            <p><strong>Genero:</strong> ${pessoa.genero}</p>
                            <p><strong>Data de nascimento:</strong> ${pessoa.data_nascimento}</p>
                        </div>
                    </div>
                </div>
            `;
            // Adicionando o card ao container (acumulador)
            container.innerHTML += card;
        });
    } catch (error) {
        // Caso erro, exiba a mensagem
        console.error('Erro ao carregar dados:', error);
        container.innerHTML = '<p>Erro ao carregar os itens do estoque. Tente novamente mais tarde.</p>';
    }
}

// Construtor de eventos para atualizacao da pagina
window.onload = gerarCards;

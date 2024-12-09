// Função criar cards dinamicamente
async function gerarCards() {
    const container = document.getElementById('cards-container');

    // Fazendo o fetch dos dados do servidor
    try {
        const response = await fetch('http://localhost:3000/itens-estoque');
        
        // Caso de sucesso
        if (!response.ok) {
            throw new Error('Erro ao carregar os itens do estoque');
        }

        // Convertendo a resposta para JSON
        const itensEstoque = await response.json();

        // Iterando itens do estoque e criando os cards
        itensEstoque.forEach(item => {
            const card = `
                <div class="col-sm-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${item.nome}</h5>
                            <p class="card-text">${item.descricao}</p>
                            <p><strong>Quantidade:</strong> ${item.quantidade}</p>
                            <p><strong>Validade:</strong> ${item.validade}</p>
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

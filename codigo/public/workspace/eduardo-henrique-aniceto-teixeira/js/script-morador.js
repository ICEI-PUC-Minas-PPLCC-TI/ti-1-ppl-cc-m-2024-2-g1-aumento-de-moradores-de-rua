// Função criar cards dinamicamente
async function gerarCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = ''; // Limpa o container antes de renderizar novamente

    try {
        // Fazendo o fetch dos dados do servidor
        const response = await fetch('/pessoas');
        if (!response.ok) throw new Error('Erro ao carregar os dados.');

        const moradores = await response.json();

        // Iterando sobre os moradores e criando os cards
        moradores.forEach(pessoa => {
            const card = document.createElement('div');
            card.className = 'col-sm-3 mb-3';

            card.innerHTML = `
                <div class="card">
                    <img src="${pessoa.imgPerfil}" class="card-img-top" alt="${pessoa.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${pessoa.nome}</h5>
                        <p class="card-text">${pessoa.tipo}</p>
                        <p><strong>Gênero:</strong> ${pessoa.genero}</p>
                        <p><strong>Data de nascimento:</strong> ${pessoa.data_nascimento}</p>
                        <button class="btn btn-primary btn-edit" data-id="${pessoa.id}">Editar</button>
                        <button class="btn btn-danger btn-delete" data-id="${pessoa.id}">Deletar</button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        // Adiciona os eventos aos botões de editar e deletar
        adicionarEventosBotoes();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        container.innerHTML = '<p>Erro ao carregar os dados. Tente novamente mais tarde.</p>';
    }
}

// Função para adicionar eventos aos botões
function adicionarEventosBotoes() {
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');

    // Evento de editar
    editButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.getAttribute('data-id');
            const novoNome = prompt('Digite o novo nome [ENTER para não alterar]:');
            if (novoNome) {
                try {
                    await fetch(`/pessoas/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nome: novoNome }),
                    });
                    gerarCards(); // Atualiza a lista
                } catch (error) {
                    console.error('Erro ao editar:', error);
                }
            }
            const novoTipo = prompt('Digite o a atual situação da pessoa [Ex: Morador de rua] [ENTER para não alterar]:');
            if (novoTipo) {
                try {
                    await fetch(`/pessoas/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tipo: novoTipo }),
                    });
                    gerarCards(); // Atualiza a lista
                } catch (error) {
                    console.error('Erro ao editar:', error);
                }
            }
            const novoGenero = prompt('Digite o genero da pessoa [ENTER para não alterar]:');
            if (novoGenero) {
                try {
                    await fetch(`/pessoas/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ genero: novoGenero }),
                    });
                    gerarCards(); // Atualiza a lista
                } catch (error) {
                    console.error('Erro ao editar:', error);
                }
            }
            const novaDataNascimento = prompt('Digite o a data de nascimento: [ENTER para não alterar]');
            if (novaDataNascimento) {
                try {
                    await fetch(`/pessoas/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data_nascimento: novaDataNascimento },),
                    });
                    gerarCards(); // Atualiza a lista
                } catch (error) {
                    console.error('Erro ao editar:', error);
                }
            }
        });
    });

    // Evento de deletar
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.getAttribute('data-id');
            if (confirm('Tem certeza que deseja deletar?')) {
                try {
                    await fetch(`/pessoas/${id}`, { method: 'DELETE' });
                    gerarCards(); // Atualiza a lista
                } catch (error) {
                    console.error('Erro ao deletar:', error);
                }
            }
        });
    });
}

// Construtor de eventos para atualização da página
window.onload = gerarCards;

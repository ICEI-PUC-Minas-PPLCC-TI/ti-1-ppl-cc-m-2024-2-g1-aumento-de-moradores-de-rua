const atualizacoes = {};
let moradoresData = [];

async function gerarCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    try {
        const response = await fetch('/pessoas');
        if (!response.ok) throw new Error('Erro ao carregar os dados.');

        const moradores = await response.json();
        moradoresData = moradores.filter(morador => morador.tipo === 'situacao_rua');

        moradoresData.forEach(pessoa => {
            const card = document.createElement('div');
            card.className = 'mb-4';
            const localizacao = pessoa.ultimas_localizacoes[0] || { cidade: 'Não informado', estado: 'Não informado' };

            card.innerHTML = `
                <div class="card h-100 shadow-sm" style="width: 300px !important; max-width: 300px !important">
                    <img src="${pessoa.imgPerfil || './assets/images/home_img.jpg'}" class="card_image" alt="${pessoa.nome}">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-end w-full mb-2">
                            <button class="btn btn-warning btn-xs btn-edit me-2" data-id="${pessoa.id}" title="Editar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-danger btn-xs btn-delete" data-id="${pessoa.id}" title="Deletar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <h5 class="card-title">${pessoa.nome}</h5>
                        <p class="card-text"><strong>Cidade:</strong> ${localizacao.cidade}</p>
                        <p class="card-text"><strong>Estado:</strong> ${localizacao.estado}</p>
                        <p class="card-text"><strong>Gênero:</strong> ${pessoa.genero}</p>
                        <p class="card-text"><strong>Data de Nascimento:</strong> ${new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR')}</p>
                        <div class="mt-auto d-flex flex-column">
                            <button class="btn btn-info btn-sm btn-info-custom" data-id="${pessoa.id}" title="Ver Detalhes">
                                ver detalhes
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        adicionarEventosBotoes();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        container.innerHTML = '<p>Erro ao carregar os dados. Tente novamente mais tarde.</p>';
    }
}

function adicionarEventosBotoes() {
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const infoButtons = document.querySelectorAll('.btn-info');

    infoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            window.location.href = `/modulos/ong/pessoas/pessoas-em-situacao-de-rua.html?id=${id}`;
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            abrirModalEdicao(id);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            confirmarDelecao(id);
        });
    });
}

function abrirModalEdicao(id) {
    const pessoa = moradoresData.find(m => m.id == id);
    if (!pessoa) {
        Swal.fire('Erro', 'Morador não encontrado.', 'error');
        return;
    }

    document.getElementById('edit-id').value = pessoa.id;
    document.getElementById('edit-nome').value = pessoa.nome;
    document.getElementById('edit-genero').value = pessoa.genero;
    document.getElementById('edit-data-nascimento').value = pessoa.data_nascimento.split('T')[0];
    document.getElementById('edit-imgPerfil').value = pessoa.imgPerfil || '';

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

function confirmarDelecao(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter isso!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, deletar!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/pessoas/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erro ao deletar.');

                Swal.fire(
                    'Deletado!',
                    'O morador foi deletado com sucesso.',
                    'success'
                );

                gerarCards();
            } catch (error) {
                console.error('Erro ao deletar:', error);
                Swal.fire(
                    'Erro!',
                    'Ocorreu um erro ao deletar o morador.',
                    'error'
                );
            }
        }
    });
}
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const nome = document.getElementById('edit-nome').value.trim();
    const tipo = document.getElementById('edit-tipo').value.trim();

    const genero = document.getElementById('edit-genero').value.trim();
    const data_nascimento = document.getElementById('edit-data-nascimento').value;
    const imgPerfil = document.getElementById('edit-imgPerfil').value.trim();
    if (!nome || !genero || !data_nascimento) {
        Swal.fire('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
        return;
    }

    try {
        const updateData = {
            nome,
            tipo,
            genero,
            data_nascimento,
            imgPerfil
        };

        const response1 = await fetch(`/pessoas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        if (!response1.ok) throw new Error('Erro ao atualizar informações principais.');
        const pessoa = moradoresData.find(m => m.id == id);
        const localizacoes = pessoa.ultimas_localizacoes || [];

        if (localizacoes.length > 0) {
            const ultimaLocalizacao = { ...localizacoes[localizacoes.length - 1], cidade, estado };
            const updatedLocalizacoes = [...localizacoes.slice(0, -1), ultimaLocalizacao];

            const response2 = await fetch(`/pessoas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ultimas_localizacoes: updatedLocalizacoes }),
            });

            if (!response2.ok) throw new Error('Erro ao atualizar localização.');
        } else {
            const novaLocalizacao = { cidade, estado };
            const updatedLocalizacoes = [...localizacoes, novaLocalizacao];

            const response2 = await fetch(`/pessoas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ultimas_localizacoes: updatedLocalizacoes }),
            });

            if (!response2.ok) throw new Error('Erro ao adicionar nova localização.');
        }

        Swal.fire(
            'Sucesso!',
            'As informações foram atualizadas com sucesso.',
            'success'
        );
        const editModalEl = document.getElementById('editModal');
        const editModal = bootstrap.Modal.getInstance(editModalEl);
        editModal.hide();
        gerarCards();
    } catch (error) {
        console.error('Erro ao editar:', error);
        Swal.fire(
            'Erro!',
            'Ocorreu um erro ao atualizar as informações.',
            'error'
        );
    }
});
window.onload = gerarCards;

let ongId = null;
let currentId = null;

const modalVisualizar = new bootstrap.Modal(document.getElementById('modal-visualizar'));
const modalEditar = new bootstrap.Modal(document.getElementById('modal-editar'));
const modalCadastrar = new bootstrap.Modal(document.getElementById('modal-cadastrar'));

async function gerarTabela() {
  const currentUser = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

  const tbody = document.getElementById('itens-estoque-tbody');
  tbody.innerHTML = '';

  const responseOng = await fetch(`/ongs?responsavel=${currentUser.id}`);
  const ong = await responseOng.json();
  ongId = ong[0].id;

  try {
    const response = await fetch(`/itens-estoque?ongId=${ongId}`);

    if (!response.ok) {
      throw new Error('Erro ao carregar os itens do estoque');
    }

    const itensEstoque = await response.json();

    itensEstoque.forEach(item => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>${item.descricao}</td>
        <td>${item.quantidade}</td>
        <td>${formatarData(item.validade)}</td>
        <td>
          <button class="btn btn-info btn-sm action-btn" onclick="visualizarItem(${item.id})">Visualizar</button>
          <button class="btn btn-warning btn-sm action-btn" onclick="editarItem(${item.id})">Editar</button>
          <button class="btn btn-danger btn-sm action-btn" onclick="deletarItem(${item.id})">Deletar</button>
        </td>
      `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível carregar os itens do estoque.',
    });
  }
}

function formatarData(data) {
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR');
}

async function visualizarItem(id) {
  try {
    const response = await fetch(`/itens-estoque/${id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar os detalhes do item.');
    }

    const item = await response.json();

    document.getElementById('visualizar-id').textContent = item.id;
    document.getElementById('visualizar-nome').textContent = item.nome;
    document.getElementById('visualizar-descricao').textContent = item.descricao;
    document.getElementById('visualizar-quantidade').textContent = item.quantidade;
    document.getElementById('visualizar-validade').textContent = formatarData(item.validade);

    modalVisualizar.show();
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.message || 'Não foi possível visualizar o item.',
    });
  }
}

async function editarItem(id) {
  try {
    const response = await fetch(`/itens-estoque/${id}`);

    const item = await response.json();

    currentId = item.id;

    document.getElementById('editar-nome').value = item.nome;
    document.getElementById('editar-descricao').value = item.descricao;
    document.getElementById('editar-quantidade').value = item.quantidade;
    document.getElementById('editar-validade').value = item.validade;

    modalEditar.show();
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.message || 'Não foi possível carregar os dados para edição.',
    });
  }
}

function deletarItem(id) {
  Swal.fire({
    title: 'Tem certeza?',
    text: "Você não poderá reverter esta ação!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, deletar!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/itens-estoque/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao deletar o item.');
        }

        Swal.fire(
          'Deletado!',
          'O item foi deletado com sucesso.',
          'success'
        );

        gerarTabela();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: error.message || 'Não foi possível deletar o item.',
        });
      }
    }
  });
}
document.getElementById('btn-cadastrar-item').addEventListener('click', () => {
  document.getElementById('form-cadastrar-item').reset();
  modalCadastrar.show();
});

document.getElementById('form-cadastrar-item').addEventListener('submit', async function (event) {
  event.preventDefault();

  const form = this;
  const nome = form['nome'].value.trim();
  const descricao = form['descricao'].value.trim();
  const quantidade = parseInt(form['quantidade'].value, 10);
  const validade = form['validade'].value;

  if (!nome || !descricao || isNaN(quantidade) || !validade) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos Incompletos',
      text: 'Por favor, preencha todos os campos.',
    });
    return;
  }

  const novoItem = {
    ongId: ongId,
    nome,
    descricao,
    quantidade,
    validade,
  };

  try {
    const response = await fetch('/itens-estoque', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoItem)
    });

    if (!response.ok) {
      throw new Error('Erro ao cadastrar o novo item.');
    }

    Swal.fire({
      icon: 'success',
      title: 'Sucesso',
      text: 'Item cadastrado com sucesso!',
    });

    modalCadastrar.hide();
    gerarTabela();
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.message || 'Não foi possível cadastrar o item.',
    });
  }
});

document.getElementById('form-editar-item').addEventListener('submit', async function (event) {
  event.preventDefault();

  const form = this;
  const nome = form['nome'].value.trim();
  const descricao = form['descricao'].value.trim();
  const quantidade = parseInt(form['quantidade'].value, 10);
  const validade = form['validade'].value;

  if (!nome || !descricao || isNaN(quantidade) || !validade) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos Incompletos',
      text: 'Por favor, preencha todos os campos.',
    });
    return;
  }

  const itemAtualizado = {
    nome,
    descricao,
    quantidade,
    validade,
  };

  try {
    const response = await fetch(`/itens-estoque/${currentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemAtualizado)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar o item.');
    }

    Swal.fire({
      icon: 'success',
      title: 'Sucesso',
      text: 'Item atualizado com sucesso!',
    });

    modalEditar.hide();
    gerarTabela();
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.message || 'Não foi possível atualizar o item.',
    });
  }
});
window.onload = gerarTabela;

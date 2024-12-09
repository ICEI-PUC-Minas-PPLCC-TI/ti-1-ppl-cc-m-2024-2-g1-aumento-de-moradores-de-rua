function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getCurrentUser() {
  return {
    id: 3,
    tipo: 'pessoa'
  };
}

async function fetchOngData() {
  const id = getIdFromURL();
  try {
    const response = await fetch(`/ongs/${id}`);
    const data = await response.json();

    preencherDadosONG(data);
    listarObjetivos(data.objetivos);
    listarNecessidades(data.necessidades_especificas);
    adicionarBotoesAcao(data.id);
  } catch (error) {
    console.error("erro ao buscar dados da ong:", error);
  }
}

function preencherDadosONG(data) {
  document.getElementById('ong-foto').src = data.imageUrl || '#';
  document.getElementById('ong-razao-social').textContent = data.razao_social || 'razão social não informada';
  document.getElementById('ong-nome-fantasia').textContent = data.nome_fantasia || 'nome fantasia não informado';
  document.getElementById('ong-cnpj').textContent = data.cnpj ? `cnpj: ${data.cnpj}` : 'cnpj não informado';
  document.getElementById('ong-data-fundacao').textContent = data.data_fundacao
    ? `fundada em: ${new Date(data.data_fundacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    : 'data de fundação não informada';

  document.getElementById('ong-telefone').textContent = data.contatos?.telefone ? `${data.contatos.telefone}` : 'telefone não informado';
  document.getElementById('ong-email').textContent = data.contatos?.email ? `${data.contatos.email}` : 'email não informado';

  if (data.endereco) {
    document.getElementById('ong-logradouro').textContent = data.endereco.logradouro ? `${data.endereco.logradouro}` : '';
    document.getElementById('ong-numero').textContent = data.endereco.numero ? `${data.endereco.numero}` : '';
    document.getElementById('ong-bairro').textContent = data.endereco.bairro ? `${data.endereco.bairro}` : '';
    document.getElementById('ong-cidade').textContent = data.endereco.cidade ? `${data.endereco.cidade}` : '';
    document.getElementById('ong-estado').textContent = data.endereco.estado ? `${data.endereco.estado}` : '';
    document.getElementById('ong-cep').textContent = data.endereco.cep ? `${data.endereco.cep}` : '';
  }

  document.getElementById('ong-descricao').textContent = data.descricao || 'descrição não informada';
}

function listarObjetivos(objetivos) {
  const objetivosContainer = document.getElementById('objetivos');
  objetivosContainer.innerHTML = '';

  if (objetivos && objetivos.length > 0) {
    objetivos.forEach((obj, index) => {
      const p = document.createElement('p');
      p.textContent = `- ${obj}`;
      objetivosContainer.appendChild(p);
    });
  } else {
    objetivosContainer.textContent = 'nenhum objetivo informado.';
  }
}

function listarNecessidades(necessidades) {
  const necessidadesContainer = document.getElementById('necessidades');
  necessidadesContainer.innerHTML = '';

  if (necessidades && necessidades.length > 0) {
    necessidades.forEach((necessidade, index) => {
      const card = document.createElement('div');
      card.classList.add('necessidade-card', 'mb-2', 'p-3', 'border', 'rounded');
      card.innerHTML = `
        <h5>${necessidade.nome}</h5>
        <p><strong>tipo:</strong> ${necessidade.tipo}</p>
        <p><strong>quantidade:</strong> ${necessidade.quantidade}</p>
        <p>${necessidade.descricao}</p>
      `;
      necessidadesContainer.appendChild(card);
    });
  } else {
    necessidadesContainer.textContent = 'nenhuma necessidade específica informada.';
  }
}

async function adicionarBotoesAcao(ongID) {
  const usuario = getCurrentUser();
  if (usuario.tipo === 'pessoa') {
    const acaoPessoa = document.getElementById('acao-pessoa');

    const doacaoBtn = document.createElement('button');
    doacaoBtn.textContent = 'realizar doação';
    doacaoBtn.classList.add('btn', 'btn-doacao', 'btn-gap');
    doacaoBtn.onclick = () => {
      window.location.href = `/modulos/pessoas/realizar-doacao.html?ongID=${ongID}`;
    };

    acaoPessoa.appendChild(doacaoBtn);

    const jaVoluntario = await verificarVoluntariado(ongID, usuario.id);

    if (jaVoluntario) {
      const mensagemVoluntario = document.createElement('span');
      mensagemVoluntario.textContent = 'você é voluntário nessa ong';
      mensagemVoluntario.classList.add('mensagem-voluntario');
      acaoPessoa.appendChild(mensagemVoluntario);
    } else {
      const voluntariarBtn = document.createElement('button');
      voluntariarBtn.textContent = 'se voluntariar';
      voluntariarBtn.classList.add('btn', 'btn-voluntariar');
      voluntariarBtn.onclick = () => {
        Swal.fire({
          title: 'confirmar voluntariado?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'sim',
          cancelButtonText: 'não'
        }).then((result) => {
          if (result.isConfirmed) {
            realizarVoluntariado(ongID, usuario.id);
            window.location.reload();
          }
        });
      };
      acaoPessoa.appendChild(voluntariarBtn);
    }
  }
}

async function verificarVoluntariado(ongID, usuarioID) {
  try {
    const response = await fetch(`/voluntarios?ong=${ongID}&usuario=${usuarioID}`);
    if (response.ok) {
      const voluntarios = await response.json();
      return voluntarios.length > 0;
    } else {
      console.error('erro ao verificar voluntariado');
      return false;
    }
  } catch (error) {
    console.error('erro ao verificar voluntariado:', error);
    return false;
  }
}

function inicializarEventos() {
  const editarOngBtn = document.getElementById('btn-se-voluntariar');
  const editarObjetivosBtn = document.getElementById('btn-editar-objetivos');
  const editarNecessidadesBtn = document.getElementById('btn-editar-necessidades');
  const adicionarNecessidadeBtn = document.getElementById('btn-adicionar-necessidade');

  const idOng = getIdFromURL();
  const usuario = getCurrentUser();

  if (editarOngBtn) {
    editarOngBtn.addEventListener('click', () => {
      if (usuario.tipo === 'pessoa') {
      } else if (usuario.tipo === 'ong') {
        const editarOngModal = new bootstrap.Modal(document.getElementById('editarOngModal'));
        editarOngModal.show();
      } else {
        alert('tipo de usuário desconhecido.');
      }
    });
  }

  if (editarObjetivosBtn) {
    editarObjetivosBtn.addEventListener('click', () => {
      abrirEditarObjetivosModal();
    });
  }

  if (editarNecessidadesBtn) {
    editarNecessidadesBtn.addEventListener('click', () => {
      abrirEditarNecessidadesModal();
    });
  }

  if (adicionarNecessidadeBtn) {
    adicionarNecessidadeBtn.addEventListener('click', () => {
      abrirEditarNecessidadesModal();
    });
  }

  const editarOngForm = document.getElementById('editar-ong-form');
  if (editarOngForm) {
    editarOngForm.addEventListener('submit', (event) => {
      event.preventDefault();
      salvarEdicaoOng(idOng);
    });
  }

  const editarObjetivosForm = document.getElementById('editar-objetivos-form');
  if (editarObjetivosForm) {
    editarObjetivosForm.addEventListener('submit', (event) => {
      event.preventDefault();
      salvarEdicaoObjetivos(idOng);
    });
  }

  const btnAdicionarObjetivo = document.getElementById('btn-adicionar-objetivo');
  if (btnAdicionarObjetivo) {
    btnAdicionarObjetivo.addEventListener('click', () => {
      const novoObjetivoInput = document.getElementById('novo-objetivo');
      const novoObjetivo = novoObjetivoInput.value.trim();
      if (novoObjetivo) {
        adicionarNovoObjetivo(novoObjetivo);
        novoObjetivoInput.value = '';
      }
    });
  }

  const editarNecessidadesForm = document.getElementById('editar-necessidades-form');
  if (editarNecessidadesForm) {
    editarNecessidadesForm.addEventListener('submit', (event) => {
      event.preventDefault();
      salvarEdicaoNecessidades(idOng);
    });
  }

  const btnAdicionarNecessidadeModal = document.getElementById('btn-adicionar-necessidade-modal');
  if (btnAdicionarNecessidadeModal) {
    btnAdicionarNecessidadeModal.addEventListener('click', () => {
      adicionarNovaNecessidade();
    });
  }
}

async function realizarVoluntariado(ongID, usuarioID) {
  const voluntario = {
    ong: parseInt(ongID),
    usuario: parseInt(usuarioID)
  };

  try {
    const response = await fetch('/voluntarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(voluntario)
    });

    if (response.ok) {
      Swal.fire('você se voluntariou com sucesso!', '', 'success').then(() => {
        fetchOngData();
      });
    } else {
      Swal.fire('erro ao se voluntariar. tente novamente.', '', 'error');
    }
  } catch (error) {
    console.error('erro ao realizar voluntariado:', error);
    Swal.fire('erro ao realizar voluntariado.', '', 'error');
  }
}

function abrirEditarObjetivosModal() {
  const editarObjetivosModal = new bootstrap.Modal(document.getElementById('editarObjetivosModal'));
  preencherListaObjetivosParaEdicao();
  editarObjetivosModal.show();
}

function preencherListaObjetivosParaEdicao() {
  const idOng = getIdFromURL();
  const listaObjetivosDiv = document.getElementById('lista-objetivos');
  listaObjetivosDiv.innerHTML = '';

  fetch(`/ongs/${idOng}`)
    .then(response => response.json())
    .then(data => {
      const objetivos = data.objetivos || [];
      objetivos.forEach((obj, index) => {
        const div = document.createElement('div');
        div.classList.add('input-group', 'mb-2');
        div.innerHTML = `
          <input type="text" class="form-control objetivo-input" value="${obj}">
          <button class="btn btn-danger btn-remover-objetivo" data-index="${index}" type="button">remover</button>
        `;
        listaObjetivosDiv.appendChild(div);
      });

      const removerBtns = document.querySelectorAll('.btn-remover-objetivo');
      removerBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
          const index = event.target.getAttribute('data-index');
          removerObjetivo(index);
        });
      });
    })
    .catch(error => {
      console.error('erro ao buscar objetivos:', error);
    });
}

function removerObjetivo(index) {
  const idOng = getIdFromURL();
  fetch(`/ongs/${idOng}`)
    .then(response => response.json())
    .then(data => {
      let objetivos = data.objetivos || [];
      objetivos.splice(index, 1);
      atualizarObjetivosNaOng(idOng, objetivos);
    })
    .catch(error => {
      console.error('erro ao remover objetivo:', error);
    });
}

function adicionarNovoObjetivo(objetivo) {
  const idOng = getIdFromURL();
  fetch(`/ongs/${idOng}`)
    .then(response => response.json())
    .then(data => {
      let objetivos = data.objetivos || [];
      objetivos.push(objetivo);
      atualizarObjetivosNaOng(idOng, objetivos);
    })
    .catch(error => {
      console.error('erro ao adicionar objetivo:', error);
    });
}

function atualizarObjetivosNaOng(idOng, objetivos) {
  fetch(`/ongs/${idOng}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ objetivos: objetivos })
  })
    .then(response => {
      if (response.ok) {
        Swal.fire('objetivos atualizados com sucesso!', '', 'success').then(() => {
          fetchOngData();
          const editarObjetivosModal = bootstrap.Modal.getInstance(document.getElementById('editarObjetivosModal'));
          editarObjetivosModal.hide();
        });
      } else {
        Swal.fire('erro ao atualizar objetivos.', '', 'error');
      }
    })
    .catch(error => {
      console.error('erro ao atualizar objetivos:', error);
    });
}

function salvarEdicaoObjetivos(idOng) {
  const objetivosInputs = document.querySelectorAll('.objetivo-input');
  const novosObjetivos = Array.from(objetivosInputs).map(input => input.value.trim()).filter(val => val !== '');

  atualizarObjetivosNaOng(idOng, novosObjetivos);
}

function abrirEditarNecessidadesModal() {
  const editarNecessidadesModal = new bootstrap.Modal(document.getElementById('editarNecessidadesModal'));
  preencherListaNecessidadesParaEdicao();
  editarNecessidadesModal.show();
}

function preencherListaNecessidadesParaEdicao() {
  const idOng = getIdFromURL();
  const listaNecessidadesDiv = document.getElementById('lista-necessidades');
  listaNecessidadesDiv.innerHTML = '';

  fetch(`/ongs/${idOng}`)
    .then(response => response.json())
    .then(data => {
      const necessidades = data.necessidades_especificas || [];
      necessidades.forEach((nec, index) => {
        const div = document.createElement('div');
        div.classList.add('card', 'mb-2');
        div.innerHTML = `
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">tipo</label>
              <input type="text" class="form-control necessidade-tipo" value="${nec.tipo}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">nome</label>
              <input type="text" class="form-control necessidade-nome" value="${nec.nome}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">quantidade</label>
              <input type="number" class="form-control necessidade-quantidade" value="${nec.quantidade}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">descrição</label>
              <textarea class="form-control necessidade-descricao" rows="2" required>${nec.descricao}</textarea>
            </div>
            <button class="btn btn-danger btn-remover-necessidade" data-index="${index}" type="button">remover</button>
          </div>
        `;
        listaNecessidadesDiv.appendChild(div);
      });

      const removerBtns = document.querySelectorAll('.btn-remover-necessidade');
      removerBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
          const index = event.target.getAttribute('data-index');
          removerNecessidade(index);
        });
      });
    })
    .catch(error => {
      console.error('erro ao buscar necessidades:', error);
    });
}

function removerNecessidade(index) {
  const idOng = getIdFromURL();
  fetch(`/ongs/${idOng}`)
    .then(response => response.json())
    .then(data => {
      let necessidades = data.necessidades_especificas || [];
      necessidades.splice(index, 1);
      atualizarNecessidadesNaOng(idOng, necessidades);
    })
    .catch(error => {
      console.error('erro ao remover necessidade:', error);
    });
}

function adicionarNovaNecessidade() {
  const listaNecessidadesDiv = document.getElementById('lista-necessidades');
  const template = document.getElementById('nova-necessidade-template').innerHTML;
  const newNecessidade = document.createElement('div');
  newNecessidade.innerHTML = template;
  newNecessidade.style.display = 'block';
  listaNecessidadesDiv.appendChild(newNecessidade);

  const btnRemover = newNecessidade.querySelector('.btn-remover-necessidade');
  btnRemover.addEventListener('click', () => {
    newNecessidade.remove();
  });
}

function salvarEdicaoNecessidades(idOng) {
  const listaNecessidadesDiv = document.getElementById('lista-necessidades');
  const cardsNecessidades = listaNecessidadesDiv.querySelectorAll('.card');

  const novasNecessidades = [];

  cardsNecessidades.forEach(card => {
    const tipo = card.querySelector('.necessidade-tipo').value.trim();
    const nome = card.querySelector('.necessidade-nome').value.trim();
    const quantidade = parseInt(card.querySelector('.necessidade-quantidade').value.trim());
    const descricao = card.querySelector('.necessidade-descricao').value.trim();

    if (tipo && nome && quantidade && descricao) {
      novasNecessidades.push({
        tipo,
        nome,
        quantidade,
        descricao
      });
    }
  });

  atualizarNecessidadesNaOng(idOng, novasNecessidades);
}

function atualizarNecessidadesNaOng(idOng, necessidades) {
  fetch(`/ongs/${idOng}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ necessidades_especificas: necessidades })
  })
    .then(response => {
      if (response.ok) {
        Swal.fire('necessidades atualizadas com sucesso!', '', 'success').then(() => {
          fetchOngData();
          const editarNecessidadesModal = bootstrap.Modal.getInstance(document.getElementById('editarNecessidadesModal'));
          editarNecessidadesModal.hide();
        });
      } else {
        Swal.fire('erro ao atualizar necessidades.', '', 'error');
      }
    })
    .catch(error => {
      console.error('erro ao atualizar necessidades:', error);
    });
}

function abrirEditarOngModal(data) {
  document.getElementById('edit-razao-social').value = data.razao_social || '';
  document.getElementById('edit-nome-fantasia').value = data.nome_fantasia || '';
  document.getElementById('edit-cnpj').value = data.cnpj || '';
  document.getElementById('edit-data-fundacao').value = data.data_fundacao || '';
  document.getElementById('edit-descricao').value = data.descricao || '';
}

function salvarEdicaoOng(idOng) {
  const razaoSocial = document.getElementById('edit-razao-social').value.trim();
  const nomeFantasia = document.getElementById('edit-nome-fantasia').value.trim();
  const cnpj = document.getElementById('edit-cnpj').value.trim();
  const dataFundacao = document.getElementById('edit-data-fundacao').value;
  const descricao = document.getElementById('edit-descricao').value.trim();

  const ongAtualizada = {
    razao_social: razaoSocial,
    nome_fantasia: nomeFantasia,
    cnpj: cnpj,
    data_fundacao: dataFundacao,
    descricao: descricao
  };

  fetch(`/ongs/${idOng}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ongAtualizada)
  })
    .then(response => {
      if (response.ok) {
        Swal.fire('ong atualizada com sucesso!', '', 'success').then(() => {
          fetchOngData();
          const editarOngModal = bootstrap.Modal.getInstance(document.getElementById('editarOngModal'));
          editarOngModal.hide();
        });
      } else {
        Swal.fire('erro ao atualizar ong.', '', 'error');
      }
    })
    .catch(error => {
      console.error('erro ao atualizar ong:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchOngData();
  inicializarEventos();
});

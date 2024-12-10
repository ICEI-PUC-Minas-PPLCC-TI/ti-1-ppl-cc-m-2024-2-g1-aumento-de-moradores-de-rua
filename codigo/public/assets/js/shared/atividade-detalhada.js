const user = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

let atividadeId = null;
let atividadeDetalhada = null;
let ongId = null;
let voluntariosData = [];

async function carregarDetalhes() {
  const params = new URLSearchParams(window.location.search);
  atividadeId = params.get('id');

  if (!atividadeId) {
    Swal.fire('erro', 'id da atividade não fornecido.', 'error');
    return;
  }

  try {
    const responseAtividade = await fetch(`/atividades/${atividadeId}`);
    if (!responseAtividade.ok) throw new Error('erro ao carregar atividade');
    atividadeDetalhada = await responseAtividade.json();

    const responseOng = await fetch(`/ongs/${atividadeDetalhada.ong}`);
    if (!responseOng.ok) throw new Error('erro ao carregar ong');
    const ong = await responseOng.json();
    ongId = ong.id;

    document.getElementById('atividadeNome').innerText = `atividade – ${atividadeDetalhada.nome.toLowerCase()}`;
    document.getElementById('ongNome').innerText = ong.nome_fantasia.toLowerCase();
    document.getElementById('ongContato').innerText = `contato: ${ong.contatos.telefone || 'sem telefone'}, ${ong.contatos.email || 'sem email'}`;
    document.getElementById('ongEndereco').innerText = `endereço: ${ong.endereco.logradouro}, ${ong.endereco.numero}, ${ong.endereco.bairro}, ${ong.endereco.cidade} - ${ong.endereco.estado}, cep: ${formatarCEP(ong.endereco.cep)}`;
    document.getElementById('atividadeDescricao').innerText = `descrição: ${atividadeDetalhada.descricao.toLowerCase()}`;
    document.getElementById('atividadeDatasInicio').innerText = formatarData(atividadeDetalhada.data_inicio);
    document.getElementById('atividadeDatasFim').innerText = formatarData(atividadeDetalhada.data_fim);
    document.getElementById('atividadeStatus').innerText = `status: ${atividadeDetalhada.status.toLowerCase()}`;

    await listarVoluntarios();
    if (user.tipo === 'pessoa' && atividadeDetalhada.voluntarios.includes(user.id)) {
      listarDiasTrabalho();
    }

    configurarAcoes();
  } catch (error) {
    console.error(error);
    Swal.fire('erro', 'ocorreu um erro ao carregar os detalhes da atividade.', 'error');
  }
}

async function listarVoluntarios() {
  try {
    const responseVoluntarios = await fetch(`/voluntarios?ong=${ongId}`);
    if (!responseVoluntarios.ok) throw new Error('erro ao carregar voluntários');
    voluntariosData = await responseVoluntarios.json();

    const usuarioIds = voluntariosData.map(v => v.usuario);
    if (usuarioIds.length === 0) {
      document.getElementById('voluntariosList').innerHTML = '<li class="list-group-item text-center">nenhum voluntário inscrito.</li>';
      return;
    }

    const responseUsuarios = await fetch(`/usuarios?id=${usuarioIds.join('&id=')}`);
    if (!responseUsuarios.ok) throw new Error('erro ao carregar usuários');
    const usuarios = await responseUsuarios.json();

    const voluntariosList = document.getElementById('voluntariosList');
    voluntariosList.innerHTML = '';

    usuarios.forEach(usuario => {
      if (atividadeDetalhada.voluntarios.includes(usuario.id)) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
                    <div class="voluntario-item">
                        <div class="voluntario-info">
                            <div class="voluntario-avatar">${usuario.nome.charAt(0).toUpperCase()}</div>
                            <span class="voluntario-nome">${usuario.nome.toLowerCase()}</span>
                        </div>
                        ${user.tipo === 'ong' ? `<button class="btn btn-danger btn-sm" data-id="${usuario.id}" title="remover voluntário"><i class="bi bi-x-circle"></i></button>` : ''}
                    </div>
                `;
        voluntariosList.appendChild(li);
      }
    });

    if (user.tipo === 'ong') {
      voluntariosList.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          removerVoluntario(button.getAttribute('data-id'));
        });
      });
    }
  } catch (error) {
    console.error(error);
    document.getElementById('voluntariosList').innerHTML = '<li class="list-group-item text-center text-danger">erro ao carregar voluntários.</li>';
  }
}

async function removerVoluntario(usuarioId) {
  Swal.fire({
    title: 'tem certeza?',
    text: "você não poderá reverter isso!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'sim, remover!',
    cancelButtonText: 'cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const responseVoluntarios = await fetch(`/voluntarios?ong=${ongId}&usuario=${usuarioId}`);
        if (!responseVoluntarios.ok) throw new Error('erro ao encontrar voluntário');
        const voluntariosData = await responseVoluntarios.json();

        if (voluntariosData.length > 0) {
          const voluntarioId = voluntariosData[0].id;
          const responseDelete = await fetch(`/voluntarios/${voluntarioId}`, { method: 'DELETE' });
          if (!responseDelete.ok) throw new Error('erro ao remover voluntário');

          const novosVoluntarios = atividadeDetalhada.voluntarios.filter(id => id != usuarioId);
          await fetch(`/atividades/${atividadeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voluntarios: novosVoluntarios }),
          });

          Swal.fire(
            'removido!',
            'o voluntário foi removido com sucesso.',
            'success'
          );
          carregarDetalhes();
        } else {
          Swal.fire('erro', 'voluntário não encontrado.', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('erro', 'ocorreu um erro ao remover o voluntário.', 'error');
      }
    }
  });
}

async function listarDiasTrabalho() {
  try {
    const responseDias = await fetch(`/dias_trabalho?atividade=${atividadeId}&voluntario=${user.id}`);
    if (!responseDias.ok) throw new Error('erro ao carregar dias de trabalho');
    const diasTrabalho = await responseDias.json();

    const diasTrabalhoList = document.getElementById('diasTrabalhoList');
    const diasTrabalhoSection = document.getElementById('diasTrabalhoSection');
    diasTrabalhoList.innerHTML = '';

    if (diasTrabalho.length === 0) {
      diasTrabalhoList.innerHTML = '<li class="list-group-item text-center">nenhum dia de trabalho registrado.</li>';
    } else {
      diasTrabalho.forEach(dia => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        const horarios = dia.horarios.map(h => `${h.inicio} - ${h.fim}`).join(', ');
        li.innerText = `${capitalize(dia.dia)}: ${horarios}`;
        diasTrabalhoList.appendChild(li);
      });
    }

    diasTrabalhoSection.classList.remove('d-none');
  } catch (error) {
    console.error(error);
    document.getElementById('diasTrabalhoList').innerHTML = '<li class="list-group-item text-center text-danger">erro ao carregar dias de trabalho.</li>';
  }
}

function configurarAcoes() {
  const editarBtn = document.getElementById('editarAtividadeBtn');
  const deletarBtn = document.getElementById('deletarAtividadeBtn');
  const registrarDiaBtn = document.getElementById('registrarDiaBtn');
  const adicionarVoluntarioBtn = document.getElementById('adicionarVoluntarioBtn');

  if (user.tipo === 'ong' && atividadeDetalhada.ong === user.id) {
    editarBtn.classList.remove('d-none');
    deletarBtn.classList.remove('d-none');
    adicionarVoluntarioBtn.classList.remove('d-none');
  }

  if (user.tipo == 'pessoa' && voluntariosData.includes(user.id) && atividadeDetalhada.voluntarios && atividadeDetalhada.voluntarios.includes(user.id) && atividadeDetalhada.status == "Em andamento") {
    registrarDiaBtn.classList.remove('d-none');
  }

  editarBtn.addEventListener('click', () => abrirModalEdicao(atividadeId));
  deletarBtn.addEventListener('click', () => confirmarDelecao(atividadeId));
  adicionarVoluntarioBtn.addEventListener('click', () => abrirModalAdicionarVoluntario());
  registrarDiaBtn.addEventListener('click', () => abrirModalRegistrarDia());
}

function capitalize(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatarData(dataISO) {
  const data = new Date(dataISO);
  if (isNaN(data)) return 'data inválida';
  return data.toLocaleDateString('pt-BR');
}

function formatarCEP(cep) {
  if (!cep) return 'cep inválido';
  return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

async function abrirModalEdicao(id) {
  try {
    const responseAtividade = await fetch(`/atividades/${id}`);
    if (!responseAtividade.ok) throw new Error('erro ao carregar atividade para edição');
    const atividade = await responseAtividade.json();

    document.getElementById('edit-id').value = atividade.id;
    document.getElementById('edit-nome').value = atividade.nome.toLowerCase();
    document.getElementById('edit-descricao').value = atividade.descricao.toLowerCase();
    document.getElementById('edit-data-inicio').value = atividade.data_inicio.split('T')[0];
    document.getElementById('edit-data-fim').value = atividade.data_fim.split('T')[0];
    document.getElementById('edit-status').value = atividade.status.toLowerCase();

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
  } catch (error) {
    console.error(error);
    Swal.fire('erro', 'ocorreu um erro ao abrir o modal de edição.', 'error');
  }
}

async function confirmarDelecao(id) {
  Swal.fire({
    title: 'tem certeza?',
    text: "você não poderá reverter isso!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'sim, deletar!',
    cancelButtonText: 'cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/atividades/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('erro ao deletar atividade');

        Swal.fire(
          'deletado!',
          'a atividade foi deletada com sucesso.',
          'success'
        );

        window.location.href = 'atividades.html';
      } catch (error) {
        console.error(error);
        Swal.fire('erro', 'ocorreu um erro ao deletar a atividade.', 'error');
      }
    }
  });
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('edit-id').value;
  const nome = document.getElementById('edit-nome').value.trim().toLowerCase();
  const descricao = document.getElementById('edit-descricao').value.trim().toLowerCase();
  const data_inicio = document.getElementById('edit-data-inicio').value;
  const data_fim = document.getElementById('edit-data-fim').value;
  const status = document.getElementById('edit-status').value.toLowerCase();

  if (!nome || !descricao || !data_inicio || !data_fim || !status) {
    Swal.fire('erro', 'por favor, preencha todos os campos obrigatórios.', 'warning');
    return;
  }

  try {
    const updateData = {
      nome,
      descricao,
      data_inicio,
      data_fim,
      status
    };

    const response = await fetch(`/atividades/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) throw new Error('erro ao atualizar atividade');

    Swal.fire(
      'sucesso!',
      'a atividade foi atualizada com sucesso.',
      'success'
    );

    const editModalEl = document.getElementById('editModal');
    const editModal = bootstrap.Modal.getInstance(editModalEl);
    editModal.hide();

    carregarDetalhes();
  } catch (error) {
    console.error(error);
    Swal.fire('erro', 'ocorreu um erro ao atualizar a atividade.', 'error');
  }
});

async function abrirModalAdicionarVoluntario() {
  try {
    const responseVoluntarios = await fetch(`/voluntarios?ong=${ongId}`);
    if (!responseVoluntarios.ok) throw new Error('erro ao carregar voluntários');
    const voluntariosData = await responseVoluntarios.json();

    const usuarioIds = voluntariosData.map(v => v.usuario);
    if (usuarioIds.length === 0) {
      Swal.fire('informação', 'nenhum voluntário disponível para adicionar.', 'info');
      return;
    }

    const responseUsuarios = await fetch(`/usuarios?id=${usuarioIds.join('&id=')}`);
    if (!responseUsuarios.ok) throw new Error('erro ao carregar usuários');
    const usuarios = await responseUsuarios.json();

    const selectVoluntario = document.getElementById('selectVoluntario');
    selectVoluntario.innerHTML = '<option value="" disabled selected>selecione um voluntário</option>';

    usuarios.forEach(usuario => {
      if (!atividadeDetalhada.voluntarios.includes(usuario.id)) {
        const option = document.createElement('option');
        option.value = usuario.id;
        option.textContent = usuario.nome.toLowerCase();
        selectVoluntario.appendChild(option);
      }
    });

    const adicionarVoluntarioModal = new bootstrap.Modal(document.getElementById('adicionarVoluntarioModal'));
    adicionarVoluntarioModal.show();
  } catch (error) {
    console.error(error);
    Swal.fire('erro', 'ocorreu um erro ao carregar os voluntários disponíveis.', 'error');
  }
}

document.getElementById('adicionarVoluntarioForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuarioId = document.getElementById('selectVoluntario').value;

  if (!usuarioId) {
    Swal.fire('erro', 'por favor, selecione um voluntário.', 'warning');
    return;
  }

  try {
    const novosVoluntarios = [...atividadeDetalhada.voluntarios, parseInt(usuarioId)];
    await fetch(`/atividades/${atividadeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voluntarios: novosVoluntarios }),
    });

    const novaVoluntario = {
      ong: ongId,
      usuario: parseInt(usuarioId)
    };
    await fetch('/voluntarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaVoluntario),
    });

    Swal.fire(
      'sucesso!',
      'voluntário adicionado com sucesso.',
      'success'
    );

    const adicionarVoluntarioModalEl = document.getElementById('adicionarVoluntarioModal');
    const adicionarVoluntarioModal = bootstrap.Modal.getInstance(adicionarVoluntarioModalEl);
    adicionarVoluntarioModal.hide();

    carregarDetalhes();
  } catch (error) {
    console.error(error);
    Swal.fire('erro', 'ocorreu um erro ao adicionar o voluntário.', 'error');
  }
});

async function abrirModalRegistrarDia() {
  document.getElementById('registrarDiaForm').reset();
  document.getElementById('dia-atividade-id').value = atividadeId;
  adicionarCampoHorario();
  const registrarDiaModal = new bootstrap.Modal(document.getElementById('registrarDiaModal'));
  registrarDiaModal.show();
}

document.getElementById('adicionarHorarioBtn').addEventListener('click', adicionarCampoHorario);
document.getElementById('horariosContainer').addEventListener('click', function (e) {
  if (e.target && e.target.matches('button.btn-remove-horario')) {
    e.target.closest('.input-group').remove();
  }
});

function adicionarCampoHorario() {
  const container = document.getElementById('horariosContainer');
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
        <input type="time" class="form-control" placeholder="início" required>
        <span class="input-group-text">-</span>
        <input type="time" class="form-control" placeholder="fim" required>
        <button type="button" class="btn btn-danger btn-remove-horario ms-2"><i class="bi bi-x-circle"></i></button>
    `;
  container.appendChild(div);
}

document.getElementById('registrarDiaForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const atividade_id = document.getElementById('dia-atividade-id').value;
  const dia = document.getElementById('dia-semana').value;
  const horariosInputs = document.querySelectorAll('#horariosContainer .input-group');
  const horarios = [];

  horariosInputs.forEach(inputGroup => {
    const inicio = inputGroup.querySelector('input[type="time"]:nth-child(1)').value;
    const fim = inputGroup.querySelector('input[type="time"]:nth-child(3)').value;
    if (inicio && fim) {
      horarios.push({ inicio, fim });
    }
  });

  if (!dia || horarios.length === 0) {
    Swal.fire('erro', 'por favor, selecione um dia e adicione pelo menos um horário.', 'warning');
    return;
  }

  try {
    const novoDia = {
      dia,
      horarios,
      voluntario: user.id,
      atividade: parseInt(atividade_id)
    };

    await fetch('/dias_trabalho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoDia),
    });

    Swal.fire(
      'sucesso!',
      'dia de trabalho registrado com sucesso.',
      'success'
    );

    const registrarDiaModalEl = document.getElementById('registrarDiaModal');
    const registrarDiaModal = bootstrap.Modal.getInstance(registrarDiaModalEl);
    registrarDiaModal.hide();

    listarDiasTrabalho();
  } catch (error) {
    console.error(error);
    Swal.fire('erro', 'ocorreu um erro ao registrar o dia de trabalho.', 'error');
  }
});

window.onload = carregarDetalhes;
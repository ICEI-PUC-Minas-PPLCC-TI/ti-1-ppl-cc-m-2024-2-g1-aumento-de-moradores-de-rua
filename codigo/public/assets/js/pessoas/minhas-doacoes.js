function getCurrentUserId() {
  return JSON.parse(sessionStorage.getItem('usuarioCorrente')).id || {};
}

function formatarData(dataString) {
  const data = new Date(dataString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

async function fetchDoacoes() {
  const userId = getCurrentUserId();

  const btnDonate = document.querySelector('.doar-btn');

  btnDonate.addEventListener('click', () => {
    window.location.href = 'realizar-doacao.html';
  })


  try {
    const response = await fetch(`/doacoes?doador=${userId}`);
    const data = await response.json();

    const responseOngs = await fetch(`/ongs`);
    const dataOngs = await responseOngs.json();

    data.map((d) => {
      d.ong = dataOngs.find((dy) => dy.id === d.ong);
    })
    renderTabelaDoacoes(data);
  } catch (error) {
    console.error("Erro ao buscar doações:", error);
  }
}

function renderTabelaDoacoes(doacoes) {
  const tbody = document.getElementById('doacoes-tbody');
  tbody.innerHTML = '';

  if (doacoes.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Você não realizou nenhuma doação.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  doacoes.forEach((doacao, index) => {
    const tr = document.createElement('tr');

    const ongTd = document.createElement('td');
    ongTd.textContent = `${doacao.ong.nome_fantasia}`;
    tr.appendChild(ongTd);

    const valorTd = document.createElement('td');
    valorTd.textContent = `R$ ${doacao.valor.toFixed(2)}`;
    tr.appendChild(valorTd);

    const dataTd = document.createElement('td');
    dataTd.textContent = formatarData(doacao.data);
    tr.appendChild(dataTd);

    const statusTd = document.createElement('td');
    statusTd.textContent = formatarStatus(doacao.status);
    tr.appendChild(statusTd);

    const pagamentoTd = document.createElement('td');
    pagamentoTd.textContent = doacao.pagamento.tipo.toUpperCase();
    tr.appendChild(pagamentoTd);

    const acoesTd = document.createElement('td');
    const btnVisualizar = document.createElement('button');
    btnVisualizar.textContent = 'Visualizar';
    btnVisualizar.classList.add('acao-btn');
    btnVisualizar.setAttribute('data-index', index);
    btnVisualizar.addEventListener('click', () => abrirModal(doacao));
    acoesTd.appendChild(btnVisualizar);
    tr.appendChild(acoesTd);

    tbody.appendChild(tr);
  });
}

function formatarStatus(status) {
  switch (status) {
    case 'done':
      return 'Concluída';
    case 'pending':
      return 'Pendente';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
}

function abrirModal(doacao) {
  const modal = document.getElementById('modal-doacao');
  modal.style.display = 'block';

  document.getElementById('modal-ong').textContent = `${doacao.ong.nome_fantasia}`;
  document.getElementById('modal-valor').textContent = doacao.valor.toFixed(2);
  document.getElementById('modal-data').textContent = formatarData(doacao.data);
  document.getElementById('modal-status').textContent = formatarStatus(doacao.status);
  document.getElementById('modal-pagamento').textContent = doacao.pagamento.tipo.toUpperCase();
  document.getElementById('modal-descricao').textContent = doacao.descricao || 'Sem descrição.';
}

function fecharModal() {
  const modal = document.getElementById('modal-doacao');
  modal.style.display = 'none';
}

document.querySelector('.close-button').addEventListener('click', fecharModal);

window.addEventListener('click', function (event) {
  const modal = document.getElementById('modal-doacao');
  if (event.target === modal) {
    fecharModal();
  }
});

document.addEventListener('DOMContentLoaded', fetchDoacoes);

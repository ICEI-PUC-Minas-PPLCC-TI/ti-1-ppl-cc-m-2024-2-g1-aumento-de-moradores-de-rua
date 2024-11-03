let currentUser = {};
let ongs = [];
let currentOng = {};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const donationsTotal = (doacoes) => {
  return doacoes.reduce((total, doacao) => total + doacao.valor, 0);
}

const fetchDonations = async () => {
  if (currentUser.tipo !== 'ong') {
    const totalElement = document.querySelector('.donations_geral');
    if (totalElement) {
      totalElement.style.display = 'none';
    }
    return;
  }

  try {
    const response = await fetch(`doacoes?ong=${currentOng.id}`);
    const doacoes = await response.json();
    const total = donationsTotal(doacoes);
    const totalElement = document.querySelector('#totalDonations');
    if (totalElement) {
      totalElement.innerHTML = `${total.toFixed(2)}`;
    }
  } catch (error) {
    console.error('Erro ao buscar os dados das doações:', error);
  }
}

const fetchData = async () => {
  currentUser = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

  const element = document.querySelector('#donations_geral');

  if (element) {
    element.style.display = currentUser.tipo == 'ong' ? 'block' : 'none';
  }

  try {
    const response = await fetch("/ongs");
    ongs = await response.json();

    const ongsList = document.querySelector(".ongs-list");
    if (!ongsList) {
      console.error('Elemento .ongs-list não encontrado.');
      return;
    }

    ongsList.innerHTML = "";

    if (ongs.length === 0) {
      ongsList.innerHTML = "<p>Nenhum registro encontrado.</p>";
      return;
    }

    if (currentUser.tipo === 'ong') {
      currentOng = ongs.find(ong => ong.responsavel === currentUser.id);
      if (currentOng) {
        await fetchDonations();
      }
    }

    ongs.filter((o) => o.status === "accepted").forEach((ong) => {
      const ongElement = `
        <div class="card">
          <img class="card_image" src="${ong.imageUrl || './assets/images/home_img.jpg'}" alt="${ong.nome_fantasia}">
          <p><b>${ong.nome_fantasia}</b></p>
          <p>${ong.endereco.cidade}</p>
          <p>${ong.contatos.telefone || "Sem telefone"}</p>
          <button onclick="verDetalhes(${ong.id})">Detalhes</button>
        </div>`;

      ongsList.innerHTML += ongElement;
    });
  } catch (error) {
    console.error('Erro ao buscar as ONGs:', error);
  }

  try {
    const response = await fetch(`/atividades?voluntario=${currentUser.id}`);
    const atividades = await response.json();

    const atividadesList = document.querySelector(".atividades-list");
  
    if (!atividadesList) {
      console.error('Elemento .atividades-list não encontrado.');
      return;
    }

    atividadesList.innerHTML = "";

    if (atividades.length === 0) {
      atividadesList.innerHTML = "<p>Nenhum registro encontrado.</p>";
      document.querySelector('.atividades_geral').style.display = 'none';
      return;
    }

    countData(atividades);

    atividades.forEach((atividade) => {
      const atividadeElement = `
        <div class="card">
          <img class="card_image" src="${atividade.imageUrl || './assets/images/home_img.jpg'}" alt="${atividade.nome}">
          <p><b>${atividade.nome}</b></p>
          <p>Data Início: ${formatDate(atividade.data_inicio)}</p>
          <p>Data Fim: ${formatDate(atividade.data_fim)}</p>
          <button onclick="verDetalhesAtividade(${atividade.id})">Ver Detalhes</button>
        </div>`;

      atividadesList.innerHTML += atividadeElement;
    });
  } catch (error) {
    console.error('Erro ao buscar os dados das atividades:', error);
    const atividadesList = document.querySelector(".atividades-list");
    if (atividadesList) {
      atividadesList.innerHTML = "<p>Erro ao carregar os registros das atividades.</p>";
    }
  }
};

const countData = (atividades) => {
  const atividadesConcluidas = atividades.filter(v => v.status === 'done').length;
  const atividadesPendentes = atividades.filter(v => v.status === 'waiting').length;
  const atividadesEmAndamento = atividades.filter(v => v.status === 'doing').length;

  const atvConcluidasElement = document.querySelector('.atividades_concluidas');
  if (atvConcluidasElement) {
    atvConcluidasElement.innerHTML = atividadesConcluidas;
  }

  const atvPendentesElement = document.querySelector('.atividades_pendentes');
  if (atvPendentesElement) {
    atvPendentesElement.innerHTML = atividadesPendentes;
  }

  const atvEmAndamentoElement = document.querySelector('.atividades_em_andamento');
  if (atvEmAndamentoElement) {
    atvEmAndamentoElement.innerHTML = atividadesEmAndamento;
  }
}

const initializeData = () => {
  fetchData();
}

window.onload = initializeData;
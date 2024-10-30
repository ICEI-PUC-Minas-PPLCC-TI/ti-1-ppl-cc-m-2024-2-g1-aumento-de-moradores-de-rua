let currentUser = {};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const fetchData = () => {
  currentUser = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

  fetch("/ongs")
    .then((res) => res.json())
    .then((ongs) => {
      const ongsList = document.querySelector(".ongs-list");
      ongsList.innerHTML = "";

      if (ongs.length === 0) {
        ongsList.innerHTML = "<p>Nenhum registro encontrado.</p>";
        return;
      }

      ongs.forEach((ong) => {
        const ongElement = `
          <div class="card">
            <img class="card_image" src="${ong.imageUrl || './assets/images/home_img.jpg'}" alt="${ong.nome_fantasia}">
            <p>${ong.nome_fantasia}</p>
            <p>${ong.endereco.cidade}</p>
            <p>${ong.contatos.telefone}</p>
            <button onclick="verDetalhes(${ong.id})">Detalhes</button>
          </div>`;

        ongsList.innerHTML += ongElement;
      });
    })
    .catch((error) => {
      console.error('Erro ao buscar os dados das ONGs:', error);
      const ongsList = document.querySelector(".ongs-list");
      ongsList.innerHTML = "<p>Erro ao carregar os registros das ONGs.</p>";
    });
    
  console.log('currentUser:', currentUser);

  fetch(`/atividades?voluntario=${currentUser.id}`)
    .then((res) => res.json())
    .then((atividades) => {
      const atividadesList = document.querySelector(".atividades-list");
      atividadesList.innerHTML = "";

      if (atividades.length === 0) {
        atividadesList.innerHTML = "<p>Nenhum registro encontrado.</p>";
        return;
      }

      atividades.forEach((atividade) => {
        const atividadeElement = `
          <div class="card">
            <img class="card_image" src="${atividade.imageUrl || './assets/images/home_img.jpg'}" alt="${atividade.nome_fantasia}">
            <p>${atividade.nome}</p>
            <p>Data Início: ${formatDate(atividade.data_inicio)}</p>
            <p>Data Fim: ${formatDate(atividade.data_fim)}</p>
            <button onclick="verDetalhesAtividade(${atividade.id})">Ver Detalhes</button>
          </div>`;

        atividadesList.innerHTML += atividadeElement;
      });
    })
    .catch((error) => {
      console.error('Erro ao buscar os dados das atividades:', error);
      const atividadesList = document.querySelector(".atividades-list");
      atividadesList.innerHTML = "<p>Erro ao carregar os registros das atividades.</p>";
    });
};

const verDetalhes = (id) => {
  console.log('Ver detalhes da ONG com ID:', id);
};

const verDetalhesAtividade = (id) => {
  console.log('Ver detalhes da Atividade com ID:', id);
};

fetchData();

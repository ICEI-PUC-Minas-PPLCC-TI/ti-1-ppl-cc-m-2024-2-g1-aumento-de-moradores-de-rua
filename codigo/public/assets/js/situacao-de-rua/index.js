function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchPessoaData() {
  const id = getIdFromURL();
  try {
    const response = await fetch(`/pessoas?id=${id}`);
    const dataF = await response.json();
    const data = dataF[0];

    if (data.tipo === "Pessoa em Situação de Rua") {
      preencherDadosMorador(data);
      listarNecessidades(data.necessidades_especificas);
      listarLocalizacoes(data.ultimas_localizacoes);
    } else {
      console.error("Tipo de pessoa não é 'Pessoa em Situação de Rua'.");
    }
  } catch (error) {
    console.error("Erro ao buscar dados da pessoa:", error);
  }
}

function preencherDadosMorador(data) {
  document.getElementById('morador-foto').src = data.imgPerfil || '#';
  document.getElementById('morador-nome').textContent = data.nome;
  document.getElementById('morador-pais').textContent = data.endereco?.pais || 'País não informado';
  document.getElementById('morador-estado').textContent = data.endereco?.estado || 'Estado não informado';
  document.getElementById('morador-cidade').textContent = data.endereco?.cidade || 'Cidade não informada';
  document.getElementById('morador-bairro').textContent = data.endereco?.bairro || 'Bairro não informado';
  document.getElementById('morador-personalidade').textContent = data.personalidade || 'Personalidade não informada';
}

function listarNecessidades(necessidades) {
  const necessidadesContainer = document.getElementById('necessidades');
  necessidades.forEach(necessidade => {
    const card = document.createElement('div');
    card.classList.add('necessidade-card');
    card.innerHTML = `
      <h3>${necessidade.nome}</h3>
      <p>${necessidade.descricao}</p>
    `;
    necessidadesContainer.appendChild(card);
  });
}

function listarLocalizacoes(localizacoes) {
  const localizacoesContainer = document.getElementById('localizacoes');
  localizacoes.forEach((localizacao, index) => {
    const card = document.createElement('div');
    card.classList.add('localizacao-card');
    card.innerHTML = `
      <div class="mapa" id="mapa-${index}"></div>
      <div class="info-localizacao">
        <p><strong>Cidade:</strong> ${localizacao.cidade}</p>
        <p><strong>Estado:</strong> ${localizacao.estado}</p>
        <p><strong>Bairro:</strong> ${localizacao.bairro}</p>
        <p><strong>Rua:</strong> ${localizacao.rua}</p>
        <p><strong>Número:</strong> ${localizacao.numero}</p>
        <p><strong>CEP:</strong> ${localizacao.cep}</p>
        <p><strong>Localizado em:</strong> ${localizacao.localizado_em
        ? new Date(localizacao.localizado_em).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : 'Data não informada'
      }</p>
      `;
    localizacoesContainer.appendChild(card);

    carregarMapa(localizacao, `mapa-${index}`);
  });
}

function carregarMapa(localizacao, mapaId) {
  const endereco = `${localizacao.rua}, ${localizacao.numero}, ${localizacao.bairro}, ${localizacao.cidade}, ${localizacao.estado}`;

  const provider = new window.GeoSearch.OpenStreetMapProvider();

  provider.search({ query: endereco }).then(function (result) {
    if (result && result.length > 0) {
      const { x: lng, y: lat, label } = result[0];

      const mapa = L.map(mapaId).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapa);

      L.marker([lat, lng]).addTo(mapa)
        .bindPopup(endereco)
        .openPopup();
    } else {
      console.error('Endereço não encontrado:', endereco);
    }
  }).catch(function (error) {
    console.error('Erro ao obter coordenadas:', error);
  });
}

document.addEventListener('DOMContentLoaded', fetchPessoaData);

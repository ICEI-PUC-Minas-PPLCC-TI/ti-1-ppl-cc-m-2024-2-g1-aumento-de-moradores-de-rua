let mapaCompletoInstance = null; // Variável global para o mapa completo

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

    if (data.tipo == "situacao_rua") {
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
  const coordenadas = [];

  localizacoes.forEach((localizacao, index) => {
    const card = document.createElement('div');
    card.classList.add('localizacao-card');

    const endereco = `${localizacao.rua}, ${localizacao.numero}, ${localizacao.bairro}, ${localizacao.cidade}, ${localizacao.estado}`;
    coordenadas.push({ endereco, index });

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
        <button>
          <a class="abrir-google-maps" href="https://www.google.com/maps?q=${encodeURIComponent(endereco)}" target="_blank">
              Abrir no Google Maps
          </a>
        </button>
      </div>
    `;
    localizacoesContainer.appendChild(card);

    carregarMapa(localizacao, `mapa-${index}`);
  });

  window.coordenadasMapaCompleto = coordenadas;
}

function carregarMapa(localizacao, mapaId) {
  const mapElement = document.getElementById(mapaId);
  if (!mapElement) {
    console.error(`Contêiner de mapa não encontrado: ${mapaId}`);
    return;
  }

  const endereco = `${localizacao.rua}, ${localizacao.numero}, ${localizacao.bairro}, ${localizacao.cidade}, ${localizacao.estado}`;
  const provider = new window.GeoSearch.OpenStreetMapProvider();

  provider
    .search({ query: endereco })
    .then(function (result) {
      let mapa;
      if (result && result.length > 0) {
        const { x: lng, y: lat } = result[0];

        mapa = L.map(mapaId).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapa);

        L.marker([lat, lng]).addTo(mapa).bindPopup(endereco).openPopup();
      } else {
        mapa = L.map(mapaId).setView([-14.2350, -51.9253], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapa);

        L.marker([-14.2350, -51.9253]).addTo(mapa).bindPopup('Localização não encontrada.').openPopup();
      }
    })
    .catch(function (error) {
      console.error('Erro ao obter coordenadas:', error);

      const mapa = L.map(mapaId).setView([-14.2350, -51.9253], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapa);

      L.marker([-14.2350, -51.9253]).addTo(mapa).bindPopup('Erro ao carregar o mapa.').openPopup();
    });
}

function mostrarMapaCompleto() {
  const modal = document.getElementById('modal-mapa');
  modal.style.display = 'block';

  if (mapaCompletoInstance) {
    mapaCompletoInstance.remove();
    mapaCompletoInstance = null;
  }

  mapaCompletoInstance = L.map('mapa-completo').setView([-15.7942, -47.8822], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapaCompletoInstance);

  const provider = new window.GeoSearch.OpenStreetMapProvider();

  let anyLocationFound = false;
  const geocodePromises = window.coordenadasMapaCompleto.map(({ endereco }) => {
    return provider
      .search({ query: endereco })
      .then(function (result) {
        if (result && result.length > 0) {
          const { x: lng, y: lat } = result[0];
          L.marker([lat, lng]).addTo(mapaCompletoInstance).bindPopup(endereco);
          anyLocationFound = true;
        }
      })
      .catch(function (error) {
        console.error('Erro ao obter coordenadas:', error);
      });
  });

  Promise.all(geocodePromises).then(() => {
    if (!anyLocationFound) {
      mapaCompletoInstance.setView([-14.2350, -51.9253], 4);
    } else {
      const group = new L.featureGroup(
        Object.values(mapaCompletoInstance._layers).filter(
          (layer) => layer instanceof L.Marker
        )
      );
      mapaCompletoInstance.fitBounds(group.getBounds());
    }
  });
}

function fecharMapaCompleto() {
  const modal = document.getElementById('modal-mapa');
  modal.style.display = 'none';

  if (mapaCompletoInstance) {
    mapaCompletoInstance.remove();
    mapaCompletoInstance = null;
  }
}

document.addEventListener('DOMContentLoaded', fetchPessoaData);

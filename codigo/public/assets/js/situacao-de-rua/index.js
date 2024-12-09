let mapaCompletoInstance = null;
let pessoaData = null;

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchPessoaData() {
  const id = getIdFromURL();
  try {
    const response = await fetch(`/pessoas?id=${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar dados da pessoa.');
    }
    const dataF = await response.json();
    pessoaData = dataF[0];

    if (pessoaData.tipo === "situacao_rua") {
      preencherDadosMorador(pessoaData);
      listarNecessidades(pessoaData.necessidades_especificas);
      listarLocalizacoes(pessoaData.ultimas_localizacoes);
    } else {
      console.error("Tipo de pessoa não é 'Pessoa em Situação de Rua'.");
    }
  } catch (error) {
    console.error("Erro ao buscar dados da pessoa:", error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível carregar os dados do morador.',
    });
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
  necessidadesContainer.innerHTML = ''; 
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
  localizacoesContainer.innerHTML = ''; 
  const coordenadas = [];

  localizacoes.forEach((localizacao, index) => {
    const card = document.createElement('div');
    card.classList.add('localizacao-card');

    const endereco = `${localizacao.rua}, ${localizacao.numero}, ${localizacao.bairro}, ${localizacao.cidade}, ${localizacao.estado}`;
    coordenadas.push({ endereco, index });

    card.innerHTML = `
          <div class="mapa" id="mapa-${index}" style="height: 200px;"></div>
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
            <a class="abrir-google-maps" href="https://www.google.com/maps?q=${encodeURIComponent(endereco)}" target="_blank">
              Abrir no Google Maps
            </a>
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
  modal.style.display = 'flex';

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

function abrirModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function fecharModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

document.getElementById('btn-abrir-modal-localizacao').addEventListener('click', () => {
  abrirModal('modal-localizacao');
});

document.getElementById('btn-abrir-modal-necessidades').addEventListener('click', () => {
  abrirModal('modal-necessidades');
  listarNecessidadesEdicao(pessoaData.necessidades_especificas);
});

document.getElementById('fechar-modal-localizacao').addEventListener('click', () => {
  fecharModal('modal-localizacao');
});

document.getElementById('fechar-modal-necessidades').addEventListener('click', () => {
  fecharModal('modal-necessidades');
});

window.onclick = function (event) {
  const modals = document.getElementsByClassName('modal');
  for (let modal of modals) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}

async function buscarEndereco(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) {
      throw new Error('CEP não encontrado.');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

function validarFormularioLocalizacao(formData) {
  let isValid = true;
  document.querySelectorAll('#form-cadastrar-localizacao .error').forEach(el => el.textContent = '');

  const cep = formData.get('cep').replace(/\D/g, '');
  if (!/^\d{8}$/.test(cep)) {
    document.getElementById('erro-cep').textContent = 'CEP inválido.';
    isValid = false;
  }

  const campos = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'localizado_em'];
  campos.forEach(campo => {
    if (!formData.get(campo)) {
      document.getElementById(`erro-${campo}`).textContent = 'Este campo é obrigatório.';
      isValid = false;
    }
  });

  return isValid;
}

document.getElementById('form-cadastrar-localizacao').addEventListener('submit', async function (event) {
  event.preventDefault();
  const formData = new FormData(this);

  if (!validarFormularioLocalizacao(formData)) {
    return;
  }

  const cep = formData.get('cep').replace(/\D/g, '');
  try {
    const endereco = await buscarEndereco(cep);
    document.getElementById('rua').value = endereco.logradouro || '';
    document.getElementById('bairro').value = endereco.bairro || '';
    document.getElementById('cidade').value = endereco.localidade || '';
    document.getElementById('estado').value = endereco.uf || '';

    const novaLocalizacao = {
      cidade: endereco.localidade,
      estado: endereco.uf,
      bairro: endereco.bairro,
      rua: endereco.logradouro,
      numero: formData.get('numero'),
      cep: endereco.cep,
      localizado_em: formData.get('localizado_em')
    };

    pessoaData.ultimas_localizacoes.push(novaLocalizacao);

    const id = getIdFromURL();
    const response = await fetch(`/pessoas/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ultimas_localizacoes: pessoaData.ultimas_localizacoes
      })
    });

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Última localização cadastrada com sucesso!',
      });
      listarLocalizacoes(pessoaData.ultimas_localizacoes);
      fecharModal('modal-localizacao');
      window.coordenadasMapaCompleto.push({
        endereco: `${novaLocalizacao.rua}, ${novaLocalizacao.numero}, ${novaLocalizacao.bairro}, ${novaLocalizacao.cidade}, ${novaLocalizacao.estado}`,
        index: pessoaData.ultimas_localizacoes.length - 1
      });
    } else {
      throw new Error('Erro ao cadastrar localização.');
    }

  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.message || 'Ocorreu um erro ao cadastrar a localização.',
    });
  }
});

document.getElementById('cep').addEventListener('blur', async function () {
  const cep = this.value.replace(/\D/g, '');
  if (cep.length !== 8) {
    document.getElementById('erro-cep').textContent = 'CEP deve conter 8 dígitos.';
    return;
  }

  try {
    const endereco = await buscarEndereco(cep);
    document.getElementById('rua').value = endereco.logradouro || '';
    document.getElementById('bairro').value = endereco.bairro || '';
    document.getElementById('cidade').value = endereco.localidade || '';
    document.getElementById('estado').value = endereco.uf || '';
    document.getElementById('erro-cep').textContent = '';
  } catch (error) {
    document.getElementById('erro-cep').textContent = 'CEP não encontrado.';
  }
});

function listarNecessidadesEdicao(necessidades) {
  const listaContainer = document.getElementById('lista-necessidades');
  listaContainer.innerHTML = ''; 

  necessidades.forEach((necessidade, index) => {
    const div = document.createElement('div');
    div.classList.add('form-group');
    div.innerHTML = `
          <label for="nome-necessidade-${index}">Nome da Necessidade:</label>
          <input type="text" id="nome-necessidade-${index}" name="nome-necessidade-${index}" value="${necessidade.nome}" required>
          <div class="error" id="erro-nome-necessidade-${index}"></div>

          <label for="descricao-necessidade-${index}">Descrição:</label>
          <textarea id="descricao-necessidade-${index}" name="descricao-necessidade-${index}" required>${necessidade.descricao}</textarea>
          <div class="error" id="erro-descricao-necessidade-${index}"></div>

          <button type="button" class="btn" onclick="removerNecessidade(${index})">Remover</button>
          <hr>
        `;
    listaContainer.appendChild(div);
  });
}

function removerNecessidade(index) {
  pessoaData.necessidades_especificas.splice(index, 1);
  listarNecessidadesEdicao(pessoaData.necessidades_especificas);
}

document.getElementById('adicionar-necessidade').addEventListener('click', () => {
  pessoaData.necessidades_especificas.push({
    nome: '',
    tipo: '',
    descricao: ''
  });
  listarNecessidadesEdicao(pessoaData.necessidades_especificas);
});

function validarFormularioNecessidades(form) {
  let isValid = true;
  document.querySelectorAll('#form-editar-necessidades .error').forEach(el => el.textContent = '');

  pessoaData.necessidades_especificas.forEach((necessidade, index) => {
    const nome = form[`nome-necessidade-${index}`]?.value.trim();
    const descricao = form[`descricao-necessidade-${index}`]?.value.trim();

    if (!nome) {
      document.getElementById(`erro-nome-necessidade-${index}`).textContent = 'Nome da necessidade é obrigatório.';
      isValid = false;
    }

    if (!descricao) {
      document.getElementById(`erro-descricao-necessidade-${index}`).textContent = 'Descrição é obrigatória.';
      isValid = false;
    }

    pessoaData.necessidades_especificas[index].nome = nome;
    pessoaData.necessidades_especificas[index].descricao = descricao;
  });

  return isValid;
}

document.getElementById('form-editar-necessidades').addEventListener('submit', async function (event) {
  event.preventDefault();

  const form = this;
  if (!validarFormularioNecessidades(form)) {
    return;
  }

  const id = getIdFromURL();
  try {
    const response = await fetch(`/pessoas/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        necessidades_especificas: pessoaData.necessidades_especificas
      })
    });

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Necessidades atualizadas com sucesso!',
      });
      listarNecessidades(pessoaData.necessidades_especificas);
      fecharModal('modal-necessidades');
    } else {
      throw new Error('Erro ao atualizar necessidades.');
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.message || 'Ocorreu um erro ao atualizar as necessidades.',
    });
  }
});

document.addEventListener('DOMContentLoaded', fetchPessoaData);
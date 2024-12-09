let currentUser = {};
let ongs = [];
let currentOng = {};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const fetchData = async () => {
  currentUser = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

  try {
    const response = await fetch("/ongs");
    const allOngs = await response.json();

    ongs = allOngs.filter(ong => ong.status === 'waiting');

    const validateList = document.querySelector(".validate_list");
    if (!validateList) {
      console.error('Elemento .validate_list não encontrado.');
      return;
    }

    validateList.innerHTML = "";

    if (ongs.length === 0) {
      validateList.innerHTML = "<p>Nenhuma ONG pendente de validação.</p>";
      return;
    }

    ongs.forEach((ong) => {
      const ongElement = document.createElement('div');
      ongElement.classList.add('card');

      ongElement.innerHTML = `
        <img class="card_image" src="${ong.imageUrl || '../../assets/images/home_img.jpg'}" alt="${ong.nome_fantasia}">
        <p><b>${ong.nome_fantasia}</b></p>
        <p>${ong.endereco.cidade}</p>
        <p>${ong.contatos.telefone || "Sem telefone"}</p>
        <button class="validate-btn" data-id="${ong.id}">Validar</button>
        <button class="reject-btn" data-id="${ong.id}">Rejeitar</button>
      `;

      validateList.appendChild(ongElement);
    });

    document.querySelectorAll('.validate-btn').forEach(button => {
      button.addEventListener('click', () => {
        const ongId = button.getAttribute('data-id');
        validateOng(ongId);
      });
    });

    document.querySelectorAll('.reject-btn').forEach(button => {
      button.addEventListener('click', () => {
        const ongId = button.getAttribute('data-id');
        rejectOng(ongId);
      });
    });

  } catch (error) {
    console.error('Erro ao buscar as ONGs:', error);
  }
};

const validateOng = async (ongId) => {
  try {
    const response = await fetch(`/ongs/${ongId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'accepted' })
    });

    if (response.ok) {
      alert('ONG validada com sucesso!');
      fetchData();
    } else {
      alert('Erro ao validar a ONG.');
    }
  } catch (error) {
    console.error('Erro ao validar a ONG:', error);
  }
};

const rejectOng = async (ongId) => {
  try {
    const response = await fetch(`/ongs/${ongId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'rejected' })
    });

    if (response.ok) {
      alert('ONG rejeitada com sucesso!');
      fetchData();
    } else {
      alert('Erro ao rejeitar a ONG.');
    }
  } catch (error) {
    console.error('Erro ao rejeitar a ONG:', error);
  }
};

const initializeData = () => {
  fetchData();
};

initializeData();
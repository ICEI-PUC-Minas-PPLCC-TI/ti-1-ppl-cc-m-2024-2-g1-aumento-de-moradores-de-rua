// JavaScript
const fetchData = () => {
  fetch("/ongs")
    .then((res) => res.json())
    .then((ongs) => {
      const ongsList = document.querySelector(".ongs-list");
      ongsList.innerHTML = "";

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
      console.error('Erro ao buscar os dados:', error);
    });
};

// Função para manipular o clique no botão de detalhes
const verDetalhes = (id) => {
  console.log('Ver detalhes da ONG com ID:', id);
};

// Chamar a função para buscar e renderizar os dados
fetchData();

fetch('http://localhost:3001/ongs')
  .then(response => response.json())
  .then(data => {
    const ongsList = document.querySelector('.ongs-list');
    data.forEach(ong => {
      const ongCard = `
        <div class="ong-container">
          <img src="${ong.img}" alt="${ong.nome_fantasia}" class="ong-img">
          <h3 class="ong-nome-fantasia">${ong.nome_fantasia}</h3>
          <p class="ong-cidade">${ong.endereco.cidade} - ${ong.endereco.estado}</p>
        </div>
      `;
      ongsList.insertAdjacentHTML('beforeend', ongCard);
    });
  })
  .catch(error => console.error('Erro ao buscar dados:', error));

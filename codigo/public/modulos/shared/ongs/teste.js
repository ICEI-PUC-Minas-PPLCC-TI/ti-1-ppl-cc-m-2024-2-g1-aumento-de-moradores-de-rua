const verDetalhes = (id) => {
  window.location.href = `detalhada.html?id=${id}`;
}

const fetchOngs = async () => {
  try {
    const response = await fetch("/ongs");
    ongs = await response.json();

    console.log("ONG's: ", ongs);
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
}

document.addEventListener("DOMContentLoaded", fetchOngs);
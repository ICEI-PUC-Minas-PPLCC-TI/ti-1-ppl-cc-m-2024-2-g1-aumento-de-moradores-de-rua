var usuarioCorrente = {};

function carregarPerfis() {
    fetch('/usuarios') // Insira o caminho correto do arquivo JSON
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data && usuarioCorrente.id) {
                // Encontrar o perfil do usuário com o ID atual
                const perfil = data.find(user => user.id == usuarioCorrente.id);

                console.log("Perfil: " + perfil);

                if (perfil) {
                    // Atualizar o conteúdo do HTML com os dados do perfil
                    document.getElementById('nome').textContent = perfil.nome || "Nome não disponível";
                    document.getElementById('estado').textContent = perfil.endereco.estado || "Estado não disponível";
                    document.getElementById('cidade').textContent = perfil.endereco.cidade || "Cidade não disponível";
                    document.getElementById('telefone').textContent = perfil.contatos.telefone || "Telefone não disponível";
                    document.getElementById('email').textContent = perfil.contatos.email || "Email não disponível";
                    document.getElementById('info-adicional').textContent = perfil.infoAdicional || "Informação adicional não disponível";

                    // Exibir foto do perfil
                    const profilePhoto = document.getElementById('profilePhoto');
                    profilePhoto.innerHTML = `<img src="${perfil.imgPerfil}" alt="Foto de perfil" style="max-width: 250px; max-height: 250px;">`;
                } else {
                    console.error('Perfil não encontrado para o ID especificado.');
                }
            } else {
                console.error('Dados de usuários ou ID de usuário logado não encontrados.');
            }
        })
        .catch(error => console.error('Erro ao carregar os perfis:', error));
}

// Carrega o perfil ao iniciar a página
window.onload = () => {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    }
    carregarPerfis();
};

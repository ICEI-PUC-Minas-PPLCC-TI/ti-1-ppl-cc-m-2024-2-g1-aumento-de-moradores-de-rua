let currentProfileIndex = 0; // Índice do perfil atual
let profiles = []; // Array para armazenar todos os perfis
var usuarioCorrente = {};

function carregarPerfis() {
    fetch('/usuarios') // Insira o caminho correto do arquivo JSON
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar o JSON: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && usuarioCorrente.id) {
                // Encontrar o perfil do usuário com o ID atual
                const perfil = data.find(user => user.id === usuarioCorrente.id);

                if (perfil) {
                    // Atualizar o conteúdo do HTML com os dados do perfil
                    exibirPerfil(perfil);

                    // Exibir foto do perfil
                    const profilePhoto = document.getElementById('profilePhoto');
                    profilePhoto.innerHTML = `<img src="img/${perfil.imgPerfil}" alt="Foto de perfil" style="max-width: 250px; max-height: 270px;">`;
                } else {
                    console.error('Perfil não encontrado para o ID especificado.');
                }
            } else {
                console.error('Dados de usuários ou ID de usuário logado não encontrados.');
            }
        })
        .catch(error => console.error('Erro ao carregar os perfis:', error));
}

// Função para exibir o perfil baseado no índice
function exibirPerfil(perfil) {
        document.getElementById('nome').value = perfil.nome || "Nome não disponível";
        document.getElementById('estado').value = perfil.endereco.estado || "Estado não disponível";
        document.getElementById('cidade').value = perfil.endereco.cidade || "Cidade não disponível";
        document.getElementById('telefone').value = perfil.contatos.telefone || "Telefone não disponível";
        document.getElementById('email').value = perfil.contatos.email || "Email não disponível";
        document.getElementById('info-adicional').value = perfil.infoAdicional["infoAdicional"] || "Informação não disponível";

        const profilePhoto = document.getElementById('profilePhoto');
        profilePhoto.innerHTML = `<img src="${perfil.imgPerfil}" alt="Foto de perfil" style="max-width: 250px; max-height: 250px;">`;
}


function salvarPerfil() {   
    const nome = document.getElementById('nome').value;
    const estado = document.getElementById('estado').value;
    const cidade = document.getElementById('cidade').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const infoAdicional = document.getElementById('info-adicional').value;
    const imgPerfil = document.getElementById('profilePhoto').src;

    const perfil = {
        id: usuarioCorrente.id,
        nome,
        estado,
        cidade,
        telefone,
        email,
        infoAdicional,
        imgPerfil
    };

    fetch(`/usuarios/${usuarioCorrente.id}`, {    
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(perfil)
    })
}

// Carrega perfis ao iniciar a página
window.onload = () => {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    }
    carregarPerfis();
    exibirPerfil();
};

document.querySelector('.nav-button-conf').addEventListener('click', salvarPerfil);

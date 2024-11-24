var usuarioCorrente = {};

function carregarPerfil() {
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
                    document.getElementById('data_nascimento').textContent = perfil.data_nascimento || "Data não disponível";
                    document.getElementById('estado').textContent = perfil.endereco.estado || "Estado não disponível";
                    document.getElementById('cidade').textContent = perfil.endereco.cidade || "Cidade não disponível";
                    document.getElementById('bairro').textContent = perfil.endereco.bairro || "Bairro não disponível";
                    document.getElementById('logradouro').textContent = perfil.endereco.logradouro || "Rua não disponível";
                    document.getElementById('cep').textContent = perfil.endereco.cep || "CEP não disponível";
                    document.getElementById('complemento').textContent = perfil.endereco.complemento || "Complemento não disponível";
                    document.getElementById('telefone').textContent = perfil.contatos.telefone || "Telefone não disponível";
                    document.getElementById('email').textContent = perfil.contatos.email || "Email não disponível";
                    document.getElementById('infoAdicional').textContent = perfil.infoAdicional || "Informação adicional não disponível";
                    // Exibir foto do perfil
                    const profilePhoto = document.getElementById('imgPerfil');
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
    carregarPerfil();
};

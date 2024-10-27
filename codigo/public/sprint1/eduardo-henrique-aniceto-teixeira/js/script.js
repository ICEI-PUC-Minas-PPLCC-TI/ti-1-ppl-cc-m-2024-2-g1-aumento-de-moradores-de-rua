function carregarPerfis() {
    fetch('meuPerfil.json') // Verifique o caminho correto do arquivo
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar o JSON: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Verifica se há dados no JSON
            if (data.meuPerfil && data.meuPerfil.length > 0) {
                // Gera um índice aleatório de 0 a 8 (inclusive)
                const perfilIndex = Math.floor(Math.random() * data.meuPerfil.length); // Isso garante um número de 0 a 8
                const perfil = data.meuPerfil[perfilIndex]; // Seleciona o perfil aleatório

                // Atualiza o conteúdo do HTML com os dados do perfil
                document.getElementById('nome').textContent = perfil.nome || "Nome não disponível";
                document.getElementById('estado').textContent = perfil.estado || "Estado não disponível";
                document.getElementById('cidade').textContent = perfil.cidade || "Cidade não disponível";
                document.getElementById('telefone').textContent = perfil.telefone || "Telefone não disponível";
                document.getElementById('email').textContent = perfil.email || "Email não disponível";
                document.getElementById('info-adicional').textContent = perfil["info-adicional"] || "Informação adicional não disponível";

                const profilePhoto = document.getElementById('profilePhoto');
                profilePhoto.innerHTML = `<img src="img/${perfil["img-perfil"]}" alt="Foto de perfil" style="max-width: 250px; max-height: 270px;">`;
            } else {
                console.error('Nenhum perfil encontrado no JSON');
            }
        })
        .catch(error => console.error('Erro ao carregar os perfis:', error));
}


// Carrega perfis ao iniciar a página
window.onload = carregarPerfis;

document.querySelectorAll('.nav-button-conf, .nav-button-canc').forEach(button => {
    button.addEventListener('click', function() {
        if (this.textContent === 'Logout') {
            if (confirm('Deseja realmente sair?')) {
                console.log('Usuário fez logout');
                // Lógica de logout
            }
        } else if (this.textContent === 'Configurações') {
            console.log('Abrindo configurações');
            // Lógica para abrir configurações
        } else if (this.textContent === 'Confirmar') {
            if (confirm('Deseja confirmar mudanças?')) {
                console.log('Usuário alterou informações');
                // Lógica de confirmação
            }
        } else if(this.textContent === 'Cancelar') {
            if(confirm('Cancelar alterações?')) {
                console.log('Usuário cancelou alterações');
            }
        }
    });
});


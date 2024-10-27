let currentProfileIndex = 0; // Índice do perfil atual
let profiles = []; // Array para armazenar todos os perfis

function carregarPerfis() {
    fetch('meuPerfil.json') // Verifique o caminho correto do arquivo
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar o JSON: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.meuPerfil && data.meuPerfil.length > 0) {
                profiles = data.meuPerfil; // Armazena todos os perfis
                exibirPerfil(currentProfileIndex); // Exibe o primeiro perfil
                adicionarEventosDeClique(); // Adiciona eventos de clique
            } else {
                console.error('Nenhum perfil encontrado no JSON');
            }
        })
        .catch(error => console.error('Erro ao carregar os perfis:', error));
}

// Função para exibir o perfil baseado no índice
function exibirPerfil(index) {
    if (profiles[index]) {
        const perfil = profiles[index];

        document.getElementById('nome').textContent = perfil.nome || "Nome não disponível";
        document.getElementById('estado').textContent = perfil.estado || "Estado não disponível";
        document.getElementById('cidade').textContent = perfil.cidade || "Cidade não disponível";
        document.getElementById('telefone').textContent = perfil.telefone || "Telefone não disponível";
        document.getElementById('email').textContent = perfil.email || "Email não disponível";
        document.getElementById('info-adicional').textContent = perfil["info-adicional"] || "Informação adicional não disponível";

        const profilePhoto = document.getElementById('profilePhoto');
        profilePhoto.innerHTML = `<img src="img/${perfil["img-perfil"]}" alt="Foto de perfil" style="max-width: 250px; max-height: 270px;">`;
    }
}

// Função para adicionar eventos de clique aos campos
function adicionarEventosDeClique() {
    document.querySelectorAll('.info-field').forEach(field => {
        field.addEventListener('click', () => {
            const id = field.id; // Pega o ID do campo clicado
            const novoValor = prompt(`Digite um novo valor para ${id}:`, field.textContent);
            if (novoValor) {
                field.textContent = novoValor; // Atualiza o conteúdo do campo com o novo valor
            }
        });
    });
}

// Carrega perfis ao iniciar a página
window.onload = carregarPerfis;

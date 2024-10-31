// Trabalho Interdisciplinar 1 - Aplicações Web
//
// Esse módulo realiza o registro de novos usuários e login para aplicações com 
// backend baseado em API REST provida pelo JSONServer
// Os dados de usuário estão localizados no arquivo db.json que acompanha este projeto.
//
// Autor: Rommel Vieira Carneiro (rommelcarneiro@gmail.com)
// Data: 09/09/2024
//
// Código LoginApp  


// Página inicial de Login
const LOGIN_URL = "/modulos/login/login.html";
let RETURN_URL = "/";
const API_URL = '/usuarios';

// Objeto para o banco de dados de usuários baseado em JSON
var db_usuarios = {};

// Objeto para o usuário corrente
var usuarioCorrente = {};

// Inicializa a aplicação de Login (Não necessário)
/* function initLoginApp () {
    let pagina = window.location.pathname;
    if (pagina != LOGIN_URL) {
        sessionStorage.setItem('returnURL', pagina);
        RETURN_URL = pagina;

        let usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
      
        if (usuarioCorrenteJSON) {
            usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
        } else {
            window.location.href = LOGIN_URL;
        }

        // REGISTRA LISTENER PARA O EVENTO DE CARREGAMENTO DA PÁGINA PARA ATUALIZAR INFORMAÇÕES DO USUÁRIO
        document.addEventListener('DOMContentLoaded', function () {
            showUserInfo ('userInfo');
        });
    }
    else {
        // VERIFICA SE A URL DE RETORNO ESTÁ DEFINIDA NO SESSION STORAGE, CASO CONTRARIO USA A PÁGINA INICIAL
        let returnURL = sessionStorage.getItem('returnURL');
        RETURN_URL = returnURL || RETURN_URL
        
        // INICIALIZA BANCO DE DADOS DE USUÁRIOS
        carregarUsuarios(() => {
            console.log('Usuários carregados...');
        });
    }
};
*/

function carregarUsuarios(callback) {
    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        db_usuarios = data;
        callback ()
    })
    .catch(error => {
        console.error('Erro ao ler usuários via API JSONServer:', error);
        displayMessage("Erro ao ler usuários");
    });
}

function loginUser (login, senha) {


    for (var i = 0; i < db_usuarios.length; i++) {
        var usuario = db_usuarios[i];

        if (login == usuario.login && senha == usuario.senha) {
            usuarioCorrente.id = usuario.id;
            usuarioCorrente.login = usuario.login;
            usuarioCorrente.email = usuario.email;
            usuarioCorrente.nome = usuario.nome;
            usuarioCorrente.tipo = usuario.tipo;

            sessionStorage.setItem ('usuarioCorrente', JSON.stringify (usuarioCorrente));

            return true;
        }
    }

    return false;
}

function logoutUser () {
    sessionStorage.removeItem ('usuarioCorrente');
    window.location = LOGIN_URL;
}   

function showUserInfo (element) {
    var elemUser = document.getElementById(element);
    if (elemUser) {
        elemUser.innerHTML = `${usuarioCorrente.nome} (${usuarioCorrente.login}) 
                    <a onclick="logoutUser()">❌</a>`;
    }
}

window.onload = function () {   
    carregarUsuarios(() => {
        console.log('Usuários carregados...');
    });
}   

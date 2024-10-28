const LOGIN_URL = "/modulos/login/login.html";
let RETURN_URL = "/modulos/login/index.html";
const API_URL = '/usuarios';

const menus = {
  "ong": [
    { "name": "pessoas em situação de rua", "url": "/modulos/ongs/pessoas-em-situacao-de-rua.html" },
    { "name": "itens do estoque", "url": "/modulos/ongs/itens-do-estoque.html" },
    { "name": "voluntários", "url": "/modulos/ongs/voluntarios.html" }
  ],
  "pessoa": [
    { "name": "doações", "url": "/modulos/pessoas/doacoes.html" },
    { "name": "ong's", "url": "/modulos/pessoas/ongs.html" }
  ],
  "not_logged": [
    { "name": "sobre nós", "url": "/modulos/login/cadastro.html" },
    { "name": "ong's", "url": "/modulos/pessoas/ongs.html" }
  ]
};

const renderMenu = () => {
  let currentUser = {};

  const user = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
  if (user) {
    currentUser = user;
  }

  let menu = menus.not_logged;

  if (currentUser.tipo === 'ong') {
    menu = menus.ong;
  } else if (currentUser.tipo === 'pessoa') {
    menu = menus.pessoa;
  }

  const menuItems = menu.map(item => `<a class="nav_link" href="${item.url}">${item.name}</a>`).join('');

  let loginButton = '';

  if (!currentUser.tipo) {
    loginButton = `<button class="variant_black login_button">login</button>`;
  } else {
    loginButton = `<button class="variant_black logout_button">logout</button>`;
  }

  const headerHtml = `
  <header>
    <nav class="navbar">
      <div class="nav_links">
        ${menuItems}
      </div>
      <div>
        ${loginButton}
      </div>
    </nav>
  </header>`;

  document.body.insertAdjacentHTML('afterbegin', headerHtml);

  const loginBtn = document.querySelector('.login_button');
  const logoutBtn = document.querySelector('.logout_button');

  if (loginBtn) loginBtn.addEventListener('click', login);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
};

const logout = () => {
  sessionStorage.removeItem('usuarioCorrente');
  window.location.href = LOGIN_URL;
};

const login = () => {
  window.location.href = LOGIN_URL;
};

window.addEventListener('load', renderMenu);

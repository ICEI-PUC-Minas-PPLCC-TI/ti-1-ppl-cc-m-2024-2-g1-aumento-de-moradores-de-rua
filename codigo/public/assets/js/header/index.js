const LOGIN_CALLBACK_URL = "/modulos/login/login.html";

const menus = {
  "ong": [
    { "name": "Pessoas em Situação de Rua", "url": "/modulos/ong/pessoas/pessoas-em-situacao-de-rua.html" },
    { "name": "Itens do Estoque", "url": "/modulos/ong/itens-do-estoque.html" },
    { "name": "Voluntários", "url": "/modulos/ong/voluntarios.html" }
  ],
  "pessoa": [
    { "name": "Doações", "url": "/modulos/pessoas/doacoes.html" },
    { "name": "ONGs", "url": "/modulos/shared/ongs/listagem.html" }
  ],
  "not_logged": [
    { "name": "Sobre Nós", "url": "/modulos/login/cadastro.html" },
    { "name": "ONGs", "url": "/modulos/shared/ongs/listagem.html" }
  ],
  "root": [
    { "name": "Validar ONGs", "url": "/modulos/root/validar.html" }
  ]
};

const menuByType = (user) => {
  let menu = menus.not_logged;

  if (user.tipo === 'ong') {
    menu = menus.ong;
  } else if (user.tipo === 'pessoa') {
    menu = menus.pessoa;
  } else if (user.tipo === 'root') {
    menu = menus.root;
  }

  return menu;
};

const buildHtml = (menu, user) => {
  const menuItems = menu.map(item => `<li class="nav-item"><a class="nav-link" href="${item.url}">${item.name}</a></li>`).join('');

  let loginButton = user.tipo ? `<button class="btn btn-outline-dark logout_button">Sair</button>` : `<button class="btn btn-outline-dark login_button">Entrar</button>`;

  const headerHtml = `
  <header>
    <nav class="navbar navbar-expand-lg navbar-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">
          <i class="bi bi-house-fill"></i>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Alternar navegação">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${menuItems}
          </ul>
          <div class="d-flex">
            ${loginButton}
          </div>
        </div>
      </div>
    </nav>
  </header>`;

  return headerHtml;
};

const renderMenu = () => {
  const user = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

  const menu = menuByType(user);

  const headerHtml = buildHtml(menu, user);

  const existingHeader = document.querySelector('header');
  if (existingHeader) {
    existingHeader.outerHTML = headerHtml;
  } else {
    document.body.insertAdjacentHTML('afterbegin', headerHtml);
  }

  const loginBtn = document.querySelector('.login_button');
  const logoutBtn = document.querySelector('.logout_button');

  if (loginBtn) loginBtn.addEventListener('click', login);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
};

const logout = () => {
  sessionStorage.removeItem('usuarioCorrente');
  window.location.href = LOGIN_CALLBACK_URL;
};

const login = () => {
  window.location.href = LOGIN_CALLBACK_URL;
};

window.addEventListener('load', renderMenu);

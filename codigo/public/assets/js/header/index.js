const LOGIN_CALLBACK_URL = "/modulos/login/login.html";

const menus = {
  "ong": [
    { "name": "situação de rua", "url": "/modulos/ong/pessoas/listagem-morador.html" },
    { "name": "itens do estoque", "url": "/modulos/ong/itens-do-estoque.html" },
    { "name": "atividades", "url": "/modulos/shared/atividades.html" },
    { "name": "meu perfil", "url": "/modulos/shared/perfil.html" }
  ],
  "pessoa": [
    { "name": "doações", "url": "/modulos/pessoas/doacoes.html" },
    { "name": "ong's", "url": "/modulos/shared/ongs/listagem.html" },
    { "name": "atividades", "url": "/modulos/shared/atividades.html" },
    { "name": "meu perfil", "url": "/modulos/shared/perfil.html" }
  ],
  "not_logged": [
    { "name": "sobre nós", "url": "/modulos/login/cadastro.html" },
    { "name": "ong's", "url": "/modulos/shared/ongs/listagem.html" }
  ],
  "root": [
    { "name": "validar ong's", "url": "/modulos/root/validar.html" }
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

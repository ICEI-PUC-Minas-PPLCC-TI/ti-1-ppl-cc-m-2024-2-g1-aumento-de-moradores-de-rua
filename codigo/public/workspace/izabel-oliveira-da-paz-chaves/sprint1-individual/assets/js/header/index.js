const LOGIN_CALLBACK_URL = "/modulos/login/login.html";

const menus = {
  "ong": [
    { "name": "pessoas em situação de rua", "url": "/modulos/ongs/pessoas-em-situacao-de-rua.html" },
    { "name": "itens do estoque", "url": "/modulos/ongs/itens-do-estoque.html" },
    { "name": "voluntários", "url": "/modulos/ongs/voluntarios.html" }
  ],
  "pessoa": [
    { "name": "doações", "url": "/modulos/pessoas/doacoes.html" },
    { "name": "ong's", "url": "/modulos/shared/ongs/listagem.html" }
  ],
  "not_logged": [
    { "name": "sobre nós", "url": "/modulos/login/cadastro.html" },
    { "name": "ong's", "url": "/modulos/shared/ongs/listagem.html" }
  ]
};

const menuByType = (user) => {
  let menu = menus.not_logged;

  if (user.tipo === 'ong') {
    menu = menus.ong;
  } else if (user.tipo === 'pessoa') {
    menu = menus.pessoa;
  }

  return menu;
}

const buildHtml = (menu, user) => {
  const menuItems = menu.map(item => `<a class="nav_link" href="${item.url}">${item.name}</a>`).join('');
 
  let loginButton = user.tipo ? `<button class="variant_black logout_button">sair</button>` : `<button class="variant_black login_button">entrar</button>`;

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

  return headerHtml;
}

const renderMenu = () => {
  const user = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

  const menu = menuByType(user); 

  const headerHtml = buildHtml(menu, user);

  const existingHeader = document.querySelector('header');
  if (existingHeader) {
    existingHeader.outerHTML = headerHtml;
  } else {
    document.body.innerHTML = headerHtml + document.body.innerHTML;
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

window.addEventListener('pageshow', renderMenu);

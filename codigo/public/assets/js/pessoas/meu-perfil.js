let usuarioCorrente = {};

function carregarPerfil() {
  fetch('/usuarios')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data && usuarioCorrente.id) {
        const perfil = data.find(user => user.id === usuarioCorrente.id);

        if (perfil) {
          document.getElementById('nome').textContent = perfil.nome || "Nome não disponível";
          document.getElementById('data_nascimento').textContent =
            perfil.data_nascimento ? new Date(perfil.data_nascimento).toLocaleDateString('pt-BR') : "Data de nascimento não disponível";
          document.getElementById('estado').textContent = perfil.endereco?.estado || "Estado não disponível";
          document.getElementById('cidade').textContent = perfil.endereco?.cidade || "Cidade não disponível";
          document.getElementById('bairro').textContent = perfil.endereco?.bairro || "Bairro não disponível";
          document.getElementById('logradouro').textContent = perfil.endereco?.logradouro || "Rua não disponível";
          document.getElementById('cep').textContent = perfil.endereco?.cep || "CEP não disponível";
          document.getElementById('complemento').textContent = perfil.endereco?.complemento || "Complemento não disponível";
          document.getElementById('telefone').textContent = perfil.contatos?.telefone || "Telefone não disponível";
          document.getElementById('email').textContent = perfil.contatos?.email || "Email não disponível";
          document.getElementById('infoAdicional').textContent = perfil.infoAdicional || "Informação adicional não disponível";

          const profilePhoto = document.getElementById('imgPerfil');
          if (perfil.imgPerfil) {
            profilePhoto.innerHTML = `<img src="${perfil.imgPerfil}" alt="Foto de perfil">`;
          } else {
            profilePhoto.innerHTML = `<div class="default-photo">Sem Foto</div>`;
          }
        } else {
          Swal.fire('Erro', 'Perfil não encontrado.', 'error');
        }
      } else {
        Swal.fire('Erro', 'Dados de usuários ou ID de usuário logado não encontrados.', 'error');
      }
    })
    .catch(error => {
      Swal.fire('Erro', 'Erro ao carregar os perfis. Tente novamente mais tarde.', 'error');
    });
}

window.onload = () => {
  const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
  if (usuarioCorrenteJSON) {
    try {
      usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    } catch (e) {
      Swal.fire('Erro', 'Erro ao carregar os dados do usuário. Faça login novamente.', 'error').then(() => {
        window.location.href = '/modulos/login/login.html';
      });
    }
    carregarPerfil();
  } else {
    Swal.fire('Erro', 'Nenhum usuário está logado. Faça login para acessar seu perfil.', 'error').then(() => {
      window.location.href = '/modulos/login/login.html';
    });
  }
};

const modal = document.getElementById('customModal');
const closeModalBtn = document.getElementById('closeModal');
const modalCancelBtn = document.getElementById('modalCancel');
const editButton = document.getElementById('editButton');
const editForm = document.getElementById('editForm');

closeModalBtn.onclick = () => {
  modal.style.display = 'none';
};

modalCancelBtn.onclick = () => {
  modal.style.display = 'none';
};

editButton.onclick = () => {
  preencheFormulario();
  modal.style.display = 'block';
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

document.getElementById('logoutButton').addEventListener('click', () => {
  sessionStorage.removeItem('usuarioCorrente');
  window.location.href = '/modulos/login/login.html';
});

editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const updatedData = {
    nome: formData.get('nome'),
    data_nascimento: formData.get('data_nascimento'),
    endereco: {
      estado: formData.get('estado'),
      cidade: formData.get('cidade'),
      bairro: formData.get('bairro'),
      logradouro: formData.get('logradouro'),
      cep: formData.get('cep'),
      complemento: formData.get('complemento')
    },
    contatos: {
      telefone: formData.get('telefone'),
      email: formData.get('email')
    },
    infoAdicional: formData.get('infoAdicional')
  };

  fetch(`/usuarios/${usuarioCorrente.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar o perfil: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      sessionStorage.setItem('usuarioCorrente', JSON.stringify(data));
      carregarPerfil();
      modal.style.display = 'none';
      Swal.fire('Sucesso', 'Perfil atualizado com sucesso.', 'success');
    })
    .catch(error => {
      Swal.fire('Erro', 'Erro ao atualizar o perfil. Tente novamente mais tarde.', 'error');
    });
});

function preencheFormulario() {
  fetch(`/usuarios/${usuarioCorrente.id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(perfil => {
      document.getElementById('nomeInput').value = perfil.nome || '';
      document.getElementById('dataNascimentoInput').value = perfil.data_nascimento || '';
      document.getElementById('estadoInput').value = perfil.endereco?.estado || '';
      document.getElementById('cidadeInput').value = perfil.endereco?.cidade || '';
      document.getElementById('bairroInput').value = perfil.endereco?.bairro || '';
      document.getElementById('logradouroInput').value = perfil.endereco?.logradouro || '';
      document.getElementById('cepInput').value = perfil.endereco?.cep || '';
      document.getElementById('complementoInput').value = perfil.endereco?.complemento || '';
      document.getElementById('telefoneInput').value = perfil.contatos?.telefone || '';
      document.getElementById('emailInput').value = perfil.contatos?.email || '';
      document.getElementById('infoAdicionalInput').value = perfil.infoAdicional || '';
    })
    .catch(error => {
      Swal.fire('Erro', 'Erro ao carregar os dados para edição.', 'error');
      modal.style.display = 'none';
    });
}

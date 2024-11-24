usuarioCorrente = JSON.parse(sessionStorage.getItem('usuarioCorrente')) || {};

function concluirCadastro() {
  const nome = document.getElementById('nomeAtividade').value;
  const quantidade = document.getElementById('quantidade').value;
  const validade = document.getElementById('dataTermino').value;
  const descricao = document.getElementById('descricao').value;

  if (!nome || !quantidade || !validade) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
  }

  const novoItem = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ongId: usuarioCorrente.id,
    nome,
    quantidade: parseInt(quantidade),
    validade,
    descricao,
  };

  fetch('/itens-estoque', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoItem),
  })
      .then(response => response.json())
      .then(data => {
          console.log(data);
          alert('Item cadastrado com sucesso!');
      })
      .catch(error => {
          console.error('Erro ao cadastrar item:', error);
          alert('Erro ao cadastrar o item. Tente novamente.');
      });
}

document.getElementById('taskForm').addEventListener('submit', (event) => {
  event.preventDefault();
  concluirCadastro();
});

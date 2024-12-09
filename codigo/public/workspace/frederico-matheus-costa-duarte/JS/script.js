
const moradores = {
  "listagemMoradorRua": [
    {
      "id": 1,
      "nome": "Adriana Mendes",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Centro",
      "necessidade": "Alimentação"
    },
    {
      "id": 2,
      "nome": "Fernando Braga",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Savassi",
      "necessidade": "Apoio psicológico"
    },
    {
      "id": 3,
      "nome": "Joana Martins",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Centro",
      "necessidade": "Abrigo"
    },
    {
      "id": 4,
      "nome": "Rafael Oliveira",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Pampulha",
      "necessidade": "Alimentação"
    },
    {
      "id": 5,
      "nome": "Patrícia Lima",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Savassi",
      "necessidade": "Roupas"
    },
    {
      "id": 6,
      "nome": "Andréia Costa",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Funcionários",
      "necessidade": "Apoio psicológico"
    },
    {
      "id": 7,
      "nome": "Lucas Fernandes",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Centro",
      "necessidade": "Alimentação"
    },
    {
      "id": 8,
      "nome": "Rodrigo Silva",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Santa Tereza",
      "necessidade": "Abrigo"
    },
    {
      "id": 9,
      "nome": "Camila Souza",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Centro",
      "necessidade": "Alimentação"
    },
    {
      "id": 10,
      "nome": "Vinícius Borges",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Savassi",
      "necessidade": "Apoio psicológico"
    },
    {
      "id": 11,
      "nome": "Sofia Alves",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Centro",
      "necessidade": "Roupas"
    },
    {
      "id": 12,
      "nome": "Fábio Moreira",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Funcionários",
      "necessidade": "Alimentação"
    },
    {
      "id": 13,
      "nome": "Júlia Cardoso",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Centro",
      "necessidade": "Abrigo"
    },
    {
      "id": 14,
      "nome": "Henrique Pereira",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Savassi",
      "necessidade": "Alimentação"
    },
    {
      "id": 15,
      "nome": "Gabriela Rocha",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Centro",
      "necessidade": "Apoio psicológico"
    },
    {
      "id": 16,
      "nome": "Marcos Almeida",
      "pais": "Brasil",
      "estado": "Minas Gerais",
      "cidade": "Belo Horizonte",
      "bairro": "Pampulha",
      "necessidade": "Roupas"
    }
  ]
};


function registrarMorador(event) {
  event.preventDefault(); 

  const nome = document.getElementById('nome').value;
  const pais = document.getElementById('pais').value;
  const estado = document.getElementById('estado').value;
  const cidade = document.getElementById('cidade').value;
  const bairro = document.getElementById('bairro').value;

  const novoMorador = {
    id: moradores.listagemMoradorRua.length + 1,
    nome: nome,
    pais: pais,
    estado: estado,
    cidade: cidade,
    bairro: bairro,
    necessidade: "comida" 
  };

  moradores.listagemMoradorRua.push(novoMorador);
  alert("Morador registrado com sucesso!");

  
  document.getElementById('formRegistrar').reset();
}


function carregarMoradores() {
  const container = document.querySelector('.moradores-container');
  container.innerHTML = ''; 

  moradores.listagemMoradorRua.forEach(morador => {
    const div = document.createElement('div');
    div.classList.add('morador');
    div.innerHTML = `
      <img src="https://www.donnysilva.com.br/wp-content/uploads/2022/03/mendigoDF-e1648193422332.jpg" alt="Foto do Morador" class="morador-foto">
      <h3>${morador.nome}</h3>
      <p>${morador.pais}, ${morador.estado}</p>
      <p>${morador.bairro}</p>
      <a href="DetalhamentoMoradorRua.html?id=${morador.id}" class="detalhes">Ver Detalhes</a>
    `;
    container.appendChild(div);
  });
}


function carregarDetalhesMorador() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const morador = moradores.listagemMoradorRua.find(m => m.id == id);

  if (morador) {
    document.querySelector('.morador-foto').src = "https://www.donnysilva.com.br/wp-content/uploads/2022/03/mendigoDF-e1648193422332.jpg"; 
    document.querySelector('h3').textContent = morador.nome;
    document.querySelector('.detalhes-info').innerHTML = `
      <p>País: ${morador.pais}</p>
      <p>Estado: ${morador.estado}</p>
      <p>Cidade: ${morador.cidade}</p>
      <p>Bairro: ${morador.bairro}</p>
      <p>Necessidade: ${morador.necessidade}</p>
    `;
  } else {
    alert("Morador não encontrado.");
  }
}



document.addEventListener("DOMContentLoaded", function() {
  if (document.title === "Registrar Novo Morador") {
    document.getElementById('formRegistrar').addEventListener('submit', registrarMorador);
  } else if (document.title === "ONG") {
    carregarMoradores();
  } else if (document.title === "Detalhamento do Morador") {
    carregarDetalhesMorador();
  }
});

const form = document.getElementById('registro');
const addNecessidadeBtn = document.getElementById('add-necessidade');
const necessidadesContainer = document.getElementById('necessidades');

function adicionarNecessidade() {
  const necessidadeItem = document.createElement('div');
  necessidadeItem.classList.add('necessidade-item');

  const necessidadeInput = document.createElement('input');
  necessidadeInput.setAttribute('type', 'text');
  necessidadeInput.setAttribute('placeholder', 'Digite uma necessidade');

  const removeBtn = document.createElement('button');
  removeBtn.setAttribute('type', 'button');
  removeBtn.classList.add('remove');
  removeBtn.textContent = 'Remover';

  removeBtn.addEventListener('click', () => {
    necessidadesContainer.removeChild(necessidadeItem);
  });

  necessidadeItem.appendChild(necessidadeInput);
  necessidadeItem.appendChild(removeBtn);

  necessidadesContainer.appendChild(necessidadeItem);
}
addNecessidadeBtn.addEventListener('click', adicionarNecessidade);

function obterDadosFormulario() {
  const dados = {
    foto: form.foto.value,
    nome: form.nome.value,
    cpf: form.cpf.value,
    dataNascimento: form['Data de Nascimento'].value,
    endereco: {
      rua: form['Rua do Cadastro'].value,
      bairro: form['Bairro do Cadastro'].value,
      numero: form['Número do Cadastro'].value,
      cidade: form['Cidade Do Cadastro'].value
    },
    necessidades: Array.from(document.querySelectorAll('#necessidades input[type="text"]'))
      .map(input => input.value)
      .filter(valor => valor.trim() !== '')
  };

  return JSON.stringify(dados, null, 2); 
}


form.addEventListener('submit', event => {
  event.preventDefault();
  const dadosJSON = obterDadosFormulario();
  console.log(dadosJSON);
  alert('Dados capturados no console!');
});
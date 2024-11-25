document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cadastro");
    const listaPessoas = document.getElementById("listaPessoas");

    const pessoas = [
        {
            nome: "Maria Silva",
            idade: 34,
            situacao: "Perda do emprego e dificuldade para pagar aluguel."
        },
        {
            nome: "João Oliveira",
            idade: 28,
            situacao: "Família desestruturada e renda insuficiente."
        }
    ];
    const renderLista = () => {
        listaPessoas.innerHTML = "";
        pessoas.forEach((pessoa, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${pessoa.nome}</strong>, ${pessoa.idade} anos - ${pessoa.situacao}`;
            listaPessoas.appendChild(li);
        });
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome").value;
        const idade = document.getElementById("idade").value;
        const situacao = document.getElementById("situacao").value;

        pessoas.push({ nome, idade: Number(idade), situacao });
        renderLista();
        form.reset();
    });

    renderLista();
});
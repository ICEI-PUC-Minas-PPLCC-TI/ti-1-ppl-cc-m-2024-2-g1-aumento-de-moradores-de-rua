function mudarParaAtividade() {
    document.getElementById("titulo").innerText = "Registrar nova atividade de voluntariado";
    document.getElementById("labelInicio").innerText = "Data de início";
    document.getElementById("dataInicio").type = "date";
    document.getElementById("labelTermino").innerText = "Data de término";
    document.getElementById("dataTermino").type = "date";
    document.getElementById("descricaoContainer").style.display = "block";
}

function mudarParaDiaDeTrabalho() {
    document.getElementById("titulo").innerText = "Registrar dia de trabalho";
    document.getElementById("labelInicio").innerText = "Horário de início";
    document.getElementById("dataInicio").type = "time";
    document.getElementById("labelTermino").innerText = "Horário de término";
    document.getElementById("dataTermino").type = "time";
    document.getElementById("descricaoContainer").style.display = "none";
}

function concluirCadastro() {
    const nomeAtividade = document.getElementById("nomeAtividade").value;
    const dataInicio = document.getElementById("dataInicio").value;
    const dataTermino = document.getElementById("dataTermino").value;
    const descricao = document.getElementById("descricao").value;
    const isDiaDeTrabalho = document.getElementById("titulo").innerText === "Registrar dia de trabalho";
    const descricaoValida = isDiaDeTrabalho || descricao.trim() !== "";

    if (nomeAtividade && dataInicio && dataTermino && descricaoValida) {
        alert("Registro concluído com sucesso!");
        document.getElementById("voluntariadoForm").reset();
        if (isDiaDeTrabalho) mudarParaDiaDeTrabalho();
        else mudarParaAtividade();

    } else {
        alert("Favor preencher todos os campos.");
    }
}
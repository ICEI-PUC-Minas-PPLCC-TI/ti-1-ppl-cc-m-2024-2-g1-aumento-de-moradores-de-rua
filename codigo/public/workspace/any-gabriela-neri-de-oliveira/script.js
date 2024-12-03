class Feedback {
    constructor() {
    this.feedbacks = [];
    }
   
    adicionarFeedback(texto) {
    if (this.feedbacks.length >= 1) {
    alert("Voce ja enviou um feedback!");
    return;
    }
    const feedback = { id: Date.now(), texto };
    this.feedbacks.push(feedback);
    return feedback;
    }
   
    atualizarFeedbacks() {
    const feedbacksDiv = document.getElementById('feedbacks');
    feedbacksDiv.innerHTML = '';
    this.feedbacks.forEach((feedback) => {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback';
    feedbackDiv.innerText = feedback.texto;
    feedbacksDiv.appendChild(feedbackDiv);
    });
    }
   }
   
   const feedback = new Feedback();
   const formFeedback = document.getElementById('form-feedback');
   const feedbackEnviado = document.getElementById('feedback-enviado');
   
   formFeedback.addEventListener('submit', (e) => {
    e.preventDefault();
    const textoFeedback = document.getElementById('texto-feedback').value;
    if (textoFeedback.trim() === "") {
    alert("Por favor, insira um feedback!");
    return;
    }
    const novoFeedback = feedback.adicionarFeedback(textoFeedback);
    if (novoFeedback) {
    feedback.atualizarFeedbacks();
    alert("Feedback enviado");
    feedbackEnviado.innerText = "Feedback enviado com sucesso!";
    document.getElementById('texto-feedback').value = "";
    }
   });
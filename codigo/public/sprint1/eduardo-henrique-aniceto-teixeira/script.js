document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', function() {
        if (this.textContent === 'Logout') {
            if (confirm('Deseja realmente sair?')) {
                console.log('Usuário fez logout');
                // Add logout logic here
            }
            } else if (this.textContent === 'Configurações') {
                console.log('Abrindo configurações');
                // Add settings logic here
        }
    });
});
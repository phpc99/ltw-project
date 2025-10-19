const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = form.usuario.value;
    const senha = form.senha.value;

    if(usuario == "" || senha == "") {
        
        return false;
    }
    // Definir url base como 127.0.1:8080/services/usuarios.php
    // fazendo a requisição para o servidor
    // mostrar a resposta do servidor no console

    fetch('/services/usuarios.php', {
        method: 'POST',
        body: JSON.stringify({
            login: true,
            nome_usuario: usuario,
            senha: senha
        })
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Erro na requisição.");
        }
        return response.json();
    }).then((data) => {
        if (data.token) {
            salvarTokenNoSessionStorage(data.token);
            window.location.href = "index.html";
        } else {
            alert("Usuário ou senha inválidos.");
        }
    }).catch((error) => {
        console.error(error);
    });
    


});

function salvarTokenNoSessionStorage(token) {
    sessionStorage.setItem('token', token);
}

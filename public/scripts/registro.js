const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = form.usuario.value;
    const email = form.email.value;
    const senha = form.senha.value;
    const primeiro_nome = form.primeiro_nome.value;
    const ultimo_nome = form.ultimo_nome.value;

    if(usuario == "" || email == "" || senha == "" || primeiro_nome == "" || ultimo_nome == "") {
        alert("Por favor, preencha todos os campos.");
        return false;
    }

    // Validação de nome de usuário
    const regex = /^[a-zA-Z0-9_]{1,15}$/; // expressão regular para validar o nome de usuário
    if(!regex.test(usuario)) {
        alert("Nome de usuário inválido. Por favor, utilize apenas letras, números e underline e o tamanho deve ser entre 1 e 15 caracteres.");
        return false;
    }

    // Requisição para o servidor
    fetch('/services/usuarios.php', {
        method: 'PUT',
        body: JSON.stringify({
            nome_usuario: usuario,
            email: email,
            senha: senha,
            primeiro_nome: primeiro_nome,
            ultimo_nome: ultimo_nome
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
            alert(data.mensagem);
        }
    }).catch((error) => {
        console.error(error);
    });
});

salvarTokenNoSessionStorage = (token) => {
    sessionStorage.setItem('token', token);
}
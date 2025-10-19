import { header, usuario } from "../components/header/header.js";
import { footer } from "../components/footer/footer.js";
const token = sessionStorage.getItem('token');

const funcaoUsuario = usuario.funcao;

(async () => {
    const headerContainer = document.querySelector('.header-container');
    const headerNode = await header(usuario);
    headerContainer.appendChild(headerNode);

    const dropdowns = document.querySelectorAll(".dropdown");
    dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelectorAll(".dropdown-content").forEach((content) => {
        content.classList.remove("show");
    });
    dropdown.querySelector(".dropdown-content").classList.toggle("show");
    });
    });

    document.getElementById('editarPerfil').addEventListener('click', function() {
        // abrir modal editar perfil
        document.getElementById('modal').style.display = 'block';
        // colocar os valores do usuario
        document.getElementById('nome-usuario-modal').value = usuario.nomeUsuario;
        document.getElementById('email-modal').value = usuario.email;
        document.getElementById('primeiro-nome-modal').value = usuario.primeiroNome;
        document.getElementById('ultimo-nome-modal').value = usuario.ultimoNome;
        // document.getElementById('funcao-modal').value = usuario.funcao;

    })


    const modal = document.getElementById("modal");
    const closeButton = document.querySelector(".close");

    // Fechar o modal ao clicar fora dele
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    }

    // Fechar o modal ao clicar no botão "close"
    closeButton.onclick = function() {
        modal.style.display = "none";
    }

    
    document.querySelector('#footer-container').innerHTML = footer();
    

})();

console.log(usuario)
document.getElementById('nome-usuario').textContent = usuario.nomeUsuario;
document.getElementById('email').textContent = usuario.email;
document.getElementById('primeiro-nome').textContent = usuario.primeiroNome;
document.getElementById('ultimo-nome').textContent = usuario.ultimoNome;

let funcao;
if(usuario.funcao == 0) 
    funcao = "Cliente";
else if(usuario.funcao == 1){
    funcao = "Agente";
    // criar um campo para mostrar seu departamento
    document.getElementById('departamentoP').style.display = 'block';
    document.getElementById('departamento').textContent = usuario.departamento;
    console.log(usuario.departamento)
} else if(usuario.funcao == 2)
    funcao = "Administrador";

document.getElementById('funcao').textContent = funcao;


// no botao editarPerfil adicionar evento de click

export async function editarPerfil(
    nome_usuario, 
    email, 
    primeiro_nome, 
    ultimo_nome, id) {


    // fazer requisição para atualizar os dados do usuario

    const response = await fetch(`/services/usuarios.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id,
            nome_usuario,
            email,
            primeiro_nome,
            ultimo_nome,
            // funcao,
            // senha,
            token,

        })

        // const data = await response.json();
        // console.log(data);


    });

}

// ao botão salvar adiconar evento de click
document.getElementById('salvar').addEventListener('click', async (e) => {
    e.preventDefault();
    let nome_usuario = document.getElementById('nome-usuario-modal').value;
    let email = document.getElementById('email-modal').value;
    let primeiro_nome = document.getElementById('primeiro-nome-modal').value;
    let ultimo_nome = document.getElementById('ultimo-nome-modal').value;
    // let funcao = document.getElementById('funcao-modal').value;
    // let senha = document.getElementById('senha-modal').value;
    let id = usuario.id;

    // se a senha for vazia de um alert solicitando a senha
    // if(senha == '') {
    //     alert('Por favor, insira uma senha');
    //     return;
    // } 
    await editarPerfil(nome_usuario, email, primeiro_nome, ultimo_nome, id);
    window.location.href = 'meuPerfil.html';

});

const modalEditarSenha = document.getElementById("modal-mudar-senha");
const btnEditarSenha = document.getElementById("editarSenha");
const span = document.getElementsByClassName("close")[1];

// Quando o usuário clicar no botão "Editar senha", exibir o modal
btnEditarSenha.onclick = function() {
    modalEditarSenha.style.display = "block";
}

// Quando o usuário clicar no botão de fechar, ocultar o modal
span.onclick = function() {
    modalEditarSenha.style.display = "none";
}

// Quando o usuário clicar fora do modal, ocultar o modal

document.getElementById('salvar-senha').addEventListener('click', async (e) => {
    e.preventDefault();
    // senha-atual
    // nova-senha
    // confirmar-nova-senha
    let senha = document.getElementById('senha-atual').value;
    let novaSenha = document.getElementById('nova-senha').value;
    let confirmarNovaSenha = document.getElementById('confirmar-nova-senha').value;

    if(senha.trim() == '' || novaSenha.trim()  == '' || confirmarNovaSenha.trim()  == '') {
        alert('Por favor, preencha todos os campos');
        return;
    }

    if(novaSenha !== confirmarNovaSenha) {
        alert('As senhas devem ser iguais');
        return;
    }

    const response = await fetch(`/services/usuarios.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'mudarSenha',
            id: usuario.id,
            senha: senha,
            novaSenha: novaSenha,
            token: token,
        })
    }).then(response => response.json()).then(data => {
        if(data.erro) {
            alert(data.erro);
        } else {
            alert('Senha alterada com sucesso');
            window.location.href = 'meuPerfil.html';
        }
    })

    // Trate a resposta aqui, se necessário
});


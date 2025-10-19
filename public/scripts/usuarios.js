import { footer } from "../components/footer/footer.js";
import { header, usuario } from "../components/header/header.js";

const token = sessionStorage.getItem('token');
const funcaoUsuario = usuario.funcao;

if (funcaoUsuario != 2) {
    window.location.href = 'index.html';
}

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
document.querySelector('#footer-container').innerHTML = footer();

async function getUsuarios() {
    const responseUsuarios = await fetch(`/services/usuarios.php`);
    const dataUsuarios = await responseUsuarios.json();

    const usuariosContainer = document.querySelector('.usuarios-container');
    usuariosContainer.innerHTML = '';

    for (const u of dataUsuarios) {
        usuariosContainer.appendChild(cardUsuario(u));
    }
}

getUsuarios();





async function salvarAlteracoes(id, nome_usuario, email, primeiro_nome, ultimo_nome, funcao, departamento) {
    await fetch(`/services/usuarios.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({
            id,
            nome_usuario,
            email,
            primeiro_nome,
            ultimo_nome,
            funcao,
            departamento,
            token
        })
    })

    getUsuarios();
}

function cardUsuario(usuario) {
    const id = usuario.id;
    const nome_do_usuario = usuario.nome_usuario;
    const email_do_usuario = usuario.email;
    const primeiro_nome = usuario.primeiro_nome;
    const ultimo_nome = usuario.ultimo_nome;
    const id_funcao = usuario.funcao;
    const departamento = usuario.departamento;
    let funcao;

    if (usuario.funcao == 0) funcao = 'Cliente';
    else if (usuario.funcao == 1) funcao = 'Agente';
    else if (usuario.funcao == 2) funcao = 'Administrador';

    // Criar elementos HTML
    const card = document.createElement('div');
    card.classList.add('card');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = nome_do_usuario;

    const cardText = document.createElement('p');
    cardText.classList.add('card-text');

    if(id_funcao != 1) {
        cardText.innerHTML = `
        <strong>Email:</strong> ${email_do_usuario}<br>
        <strong>Primeiro nome:</strong> ${primeiro_nome}<br>
        <strong>Ultimo nome:</strong> ${ultimo_nome}<br>
        <strong>Função:</strong> ${funcao}`
    } else {
        cardText.innerHTML = `
        <strong>Email:</strong> ${email_do_usuario}<br>
        <strong>Primeiro nome:</strong> ${primeiro_nome}<br>
        <strong>Ultimo nome:</strong> ${ultimo_nome}<br>
        <strong>Departamento:</strong> ${departamento}<br>
        <strong>Função:</strong> ${funcao}`
        

    }
;


    const excluirBtn = document.createElement('a');
    excluirBtn.classList.add('btn', 'btn-danger');
    excluirBtn.textContent = 'Excluir';
    excluirBtn.addEventListener('click', () => {
        excluirUsuario(id);
    });

    const editarBtn = document.createElement('a');
    editarBtn.classList.add('btn', 'btn-primary');
    editarBtn.textContent = 'Editar';
    editarBtn.addEventListener('click', () => {
        console.log('clicou');
        editarUsuario(id, nome_do_usuario, email_do_usuario, primeiro_nome, ultimo_nome, funcao, departamento);
    });

    // Adicionar elementos HTML como filhos uns dos outros
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(excluirBtn);
    cardBody.appendChild(editarBtn);
    card.appendChild(cardBody);

    return card;
}

async function editarUsuario(id, nome_usuario, email, primeiro_nome, ultimo_nome, funcao, departamento) {
    // Remover modal anterior (se existir)
    const modalAnterior = document.querySelector('.modal');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    const departamentos = await buscarDepartamentos();



    // criar um select option com os departamentos e uma opção nula e se departamento não for nulo, selecionar o departamento do usuário
    const selectDepartamentos = `
    <select name="departamento" id="departamento">
        <option value=""${departamento == null ? ' selected' : ''}>Sem departamento</option>
    ${departamentos.map(d => `<option value="${d.id}"${d.id == departamento ? ' selected' : ''}>${d.nome}</option>`).join('')}
    </select>
    `


    // Criar modal para editar usuário (nome_usuario, email, primeiro_nome, ultimo_nome, funcao)
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Editar Usuário</h2>
        <form>
          <label for="nome_usuario">Nome de Usuário:</label>
          <input type="text" id="nome_usuario" name="nome_usuario" value="${nome_usuario}">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" value="${email}">
          <label for="primeiro_nome">Primeiro Nome:</label>
          <input type="text" id="primeiro_nome" name="primeiro_nome" value="${primeiro_nome}">
          <label for="ultimo_nome">Último Nome:</label>
          <input type="text" id="ultimo_nome" name="ultimo_nome" value="${ultimo_nome}">
          <label for="funcao">Função:</label>
          <select id="funcao" name="funcao">
            <option value="0" ${funcao === 'Cliente' ? 'selected' : ''}>Cliente</option>
            <option value="1" ${funcao === 'Agente' ? 'selected' : ''}>Agente</option>
            <option value="2" ${funcao === 'Administrador' ? 'selected' : ''}>Administrador</option>
          </select>
          <label for="departamento">Departamento: (só afetará agentes)</label>      
            ${selectDepartamentos}
          <a id="salvar" class="btn btn-primary" >Salvar Alterações</a>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Adicionar eventos de clique ao modal e ao botão de fechar
    const modalContent = modal.querySelector('.modal-content');
    const closeButton = modal.querySelector('.close');
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    const salvarBtn = modal.querySelector('#salvar');
    salvarBtn.addEventListener('click', async () => {
        const nome_usuario = modal.querySelector('#nome_usuario').value;
        const email = modal.querySelector('#email').value;
        const primeiro_nome = modal.querySelector('#primeiro_nome').value;
        const ultimo_nome = modal.querySelector('#ultimo_nome').value;
        const funcao = modal.querySelector('#funcao').value;
        const departamento = modal.querySelector('#departamento').value;
        salvarAlteracoes(
            id,
            nome_usuario,
            email,
            primeiro_nome,
            ultimo_nome,
            funcao,
            departamento
        ).then(() => {
            modal.remove();
            
        });
        
    })

}

async function excluirUsuario(id) {
    // abrir prompt para confirmar
    const confirmacao = confirm('Tem certeza que deseja excluir este usuário?');
    if (!confirmacao) return;

    fetch(`/services/usuarios.php`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({
            id,
            token
        })
    }).then(() => {
        getUsuarios();
    })
}

async function buscarDepartamentos() {
    const responseDepartamentos = await fetch(`/services/departamentos.php?token=${token}`);
    const dataDepartamentos = await responseDepartamentos.json();
  
    console.log(dataDepartamentos);
    return dataDepartamentos;
}
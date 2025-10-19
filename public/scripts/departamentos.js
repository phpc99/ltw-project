import { header, usuario } from "../components/header/header.js";
import { footer } from "../components/footer/footer.js";
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

async function getDepartamentos() {
    const responseDepartamentos = await fetch(`/services/departamentos.php`);
    const dataDepartamentos = await responseDepartamentos.json();

    const departamentosContainer = document.querySelector('.departamentos-container');
    departamentosContainer.innerHTML = '';

    for (const d of dataDepartamentos) {
        departamentosContainer.appendChild(cardDepartamento(d));
    }
}

getDepartamentos();

function cardDepartamento(departamento) {
    const id = departamento.id;
    const nome_do_departamento = departamento.nome;

    // Criar elementos HTML
    const card = document.createElement('div');
    card.classList.add('card');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = nome_do_departamento;

    const excluirBtn = document.createElement('a');
    excluirBtn.classList.add('btn', 'btn-danger');
    excluirBtn.textContent = 'Excluir';
    excluirBtn.addEventListener('click', () => {
        excluirDepartamento(id);
    });

    const editarBtn = document.createElement('a');
    editarBtn.classList.add('btn', 'btn-primary');
    editarBtn.textContent = 'Editar';
    editarBtn.addEventListener('click', () => {
        console.log('clicou');
        editarDepartamento(id, nome_do_departamento);
    });

    // Adicionar elementos HTML como filhos uns dos outros
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(excluirBtn);
    cardBody.appendChild(editarBtn);
    card.appendChild(cardBody);

    return card;
}

function editarDepartamento(id, nome_do_departamento) {
    // Remover modal anterior (se existir)
    const modalAnterior = document.querySelector('.modal');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    // Criar modal para editar departamento (nome_do_departamento)
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Editar Departamento</h2>
        <form>
          <label for="nome_do_departamento">Nome do Departamento:</label>
          <input type="text" id="nome_do_departamento" name="nome_do_departamento" value="${nome_do_departamento}">
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
        const nome_do_departamento = modal.querySelector('#nome_do_departamento').value;
        salvarAlteracoesDepartamento(id, nome_do_departamento)
            .then(() => {
                modal.remove();
                getDepartamentos();
            });
    });
}

async function excluirDepartamento(id) {
    // abrir prompt para confirmar
    const confirmacao = confirm('Tem certeza que deseja excluir este departamento?');
    if (!confirmacao) return;

    fetch(`/services/departamentos.php`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',

        },
        body: JSON.stringify({
            id,
            token
        })
    }).then(() => {
        getDepartamentos();
    })
}

async function salvarAlteracoesDepartamento(id, nome_do_departamento) {
    fetch(`/services/departamentos.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',

        },
        body: JSON.stringify({
            id,
            nome: nome_do_departamento,
            token
        })
    }).then(() => {
        getDepartamentos();
    })
}


// adicionar evento de clique ao btn-criar-departamento
const modalDepartamento = document.querySelector('#criar-departamento-modal');

function openModal() {
    modalDepartamento.style.display = 'block';
}

function closeModal() {
    modalDepartamento.style.display = 'none';
}

window.addEventListener('click', (event) => {
    if (event.target === modalDepartamento) {
        closeModal();
    }
});

const btnAbrirModal = document.querySelector('#btn-criar-departamento');
const closeBtn = document.querySelector('#close-modal-btn');

btnAbrirModal.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);

const btnCriarDepartamento = document.querySelector('#criar-departamento-btn');
btnCriarDepartamento.addEventListener('click', (e) => {
    e.preventDefault();
    const nome = document.querySelector('#nome_do_departamento').value;
    criarDepartamento(nome);
});
function criarDepartamento(nome) {
    fetch(`/services/departamentos.php`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome,
            token
        })
    }).then(() => {
        closeModal();
        getDepartamentos();
    })
}


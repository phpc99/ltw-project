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

// Função para obter todas as hashtags
async function obterHashtags() {
  try {
    const response = await fetch('/services/hashtags.php', {
      method: 'GET'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}



// Função para obter uma hashtag específica pelo ID
async function obterHashtagPorId(id) {
  try {
    const response = await fetch(`/services/hashtags.php?id=${id}`, {
      method: 'GET'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// Função para adicionar uma nova hashtag
async function adicionarHashtag(nome) {
  try {
    const response = await fetch('/services/hashtags.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({
        nome: nome,
        token: token
      })
    })  
    
    let hashtags = await obterHashtags();
    exibirHashtags(hashtags);
      
      
    
  } catch (error) {
    console.error(error);
  }
}

// Função para atualizar uma hashtag existente pelo ID
async function atualizarHashtag(id, nome) {
  try {
    const response = await fetch('/services/hashtags.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
       
      },
      body: JSON.stringify({
        id: id,
        nome: nome,
        token: token
      })
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}


  
  // Função para deletar uma hashtag existente pelo ID

  

// Seleciona a div onde os cards das hashtags serão exibidos
const hashtagsContainer = document.querySelector('.hashtags-container');

// Função para exibir as hashtags na div
// Função para exibir as hashtags na div
function exibirHashtags(hashtags) {
    // Seleciona a div onde os cards das hashtags serão exibidos
    const hashtagsContainer = document.querySelector('.hashtags-container');
  
    // Remove todos os cards de hashtags existentes na div antes de exibir as novas
    hashtagsContainer.innerHTML = '';
  
    // Loop através de cada hashtag e criar um card para cada uma
    hashtags.forEach(hashtag => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${hashtag.nome}</h5>
          <button class="btn btn-primary editar-hashtag" data-id="${hashtag.id}" data-nome="${hashtag.nome}">Editar</button>
          <button class="btn btn-danger deletar-hashtag" data-id="${hashtag.id}">Excluir</button>
        </div>
      `;
      hashtagsContainer.appendChild(card);
    });
  
    // Adiciona event listeners para os botões de editar e excluir
    const editarBotoes = document.querySelectorAll('.editar-hashtag');
    editarBotoes.forEach(botao => {
      botao.addEventListener('click', () => {
        const id = botao.dataset.id;
        const nomeHashtag = botao.dataset.nome;
        console.log(botao.dataset);
        editarHashtag(id, nomeHashtag);
      });
    });
  
    const deletarBotoes = document.querySelectorAll('.deletar-hashtag');
    deletarBotoes.forEach(botao => {
      botao.addEventListener('click', () => {
        const id = botao.dataset.id;
        deletarHashtag(id);
        obterHashtags().then(hashtags => {
          exibirHashtags(hashtags)
        });
      });
    });
  }
  

// Função para editar uma hashtag existente pelo ID
async function salvarHashtag(id, novoNome) {
  try {
    const response = await fetch('/services/hashtags.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        nome: novoNome,
        token: token
      })
    });
    const data = await response.json();
    console.log(data);
    let hashtags = await obterHashtags();
    exibirHashtags(hashtags) // atualiza a lista de hashtags após editar a hashtag
  } catch (error) {
    console.log(error);
  }
}

// Função para deletar uma hashtag existente pelo ID
async function deletarHashtag(id) {
  const confirmacao = confirm('Tem certeza que deseja excluir esta hashtag?');
  if (confirmacao) {
    try {
      const response = await fetch('/services/hashtags.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          token: token
        })
      });
      const data = await response.json();
      console.log(data);
 // // atualiza a lista de hashtags após excluir a hashtag
    } catch (error) {
      console.log(error);
    }
  }
}
function editarHashtag(id, nome) {
  // Remove o modal antigo, se existir
  const modalAntigo = document.querySelector('.modal');
  if (modalAntigo) {
    modalAntigo.remove();
  }

  // Cria o novo modal
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.tabIndex = '-1';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Hashtag</h5>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="nomeHashtag">Nome da Hashtag:</label>
              <input type="text" class="form-control" id="nomeHashtag" value="${nome}" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
          <button type="button" class="btn btn-primary" id="salvarHashtagBtn">Salvar</button>
        </div>
      </div>
    </div>
  `;

  // Adiciona o modal à página
  document.body.appendChild(modal);

  // Seleciona o campo de nome da hashtag
  const nomeHashtagInput = modal.querySelector('#nomeHashtag');

  // Seleciona o botão de salvar
  const salvarHashtagBtn = modal.querySelector('#salvarHashtagBtn');

  // Define o handler de clique do botão de salvar
  salvarHashtagBtn.addEventListener('click', async () => {
    const novoNome = nomeHashtagInput.value.trim();
    if (novoNome) {
      try {
        await salvarHashtag(id, novoNome);
        modal.remove(); // remove o modal da página

        let hashtags = await obterHashtags();
        exibirHashtags(hashtags) //// atualiza a lista de hashtags após editar a hashtag
      } catch (error) {
        console.log(error);
      }
    }
  });

  // Define o handler de clique do botão de fechar
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.getAttribute('data-dismiss') === 'modal') {
      modal.remove(); // remove o modal da página
    }
  });
}


// Função para obter todas as hashtags

// Chama a função obterHashtags() para exibir as hashtags na div assim que a página carregar
window.addEventListener('load', obterHashtags);

let hashtags = await obterHashtags();
exibirHashtags(hashtags);

function criarFormularioHashtag() {
  const hashtagsForm = document.querySelector('.hashtags-form');

  // Cria o formulário
  const form = document.createElement('form');

  // Cria o campo de texto para a hashtag
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'hashtag';
  input.required = true;

  // Cria o botão de envio
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Criar Hashtag';

  // Adiciona o campo de texto e o botão ao formulário
  form.appendChild(input);
  form.appendChild(button);

  // Adiciona o formulário à div
  hashtagsForm.appendChild(form);

  // Adiciona um listener de evento para o envio do formulário
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Chama a função assíncrona adicionarHashtag com o valor do campo de texto como argumento
    adicionarHashtag(input.value);
  });
}

criarFormularioHashtag();
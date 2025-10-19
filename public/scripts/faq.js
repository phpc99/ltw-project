import { header, usuario } from "../components/header/header.js";
import { ticketsListHTML, createTicketSearchForm } from "../components/ticketList/ticketList.js";
import { footer } from "../components/footer/footer.js";
const funcaoUsuario = usuario.funcao;
let perguntasFrequentesData = [];

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

async function perguntasFrequentes() {
    // busca as perguntas frequentes
    const response = await fetch('/services/perguntasfrequentes.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

async function listarPerguntasFrequentes(result = 0) { 
    const faqContainer = document.querySelector('.faq-container');
    const perguntas = (result) ? result : await perguntasFrequentes();
    perguntasFrequentesData = perguntas;
    faqContainer.innerHTML = '';
    perguntas.forEach(pergunta => {
        const perguntaHTML = `
        <div class="pergunta">
          <h3>${pergunta.pergunta}</h3>
          <p>${pergunta.resposta}</p>
          ${funcaoUsuario > 0 ? `<button class="editar-pergunta" data-id="${pergunta.id_pergunta}">Editar pergunta</button>` : ''}
          ${funcaoUsuario > 0 ? `<button class="excluir-pergunta" data-id="${pergunta.id_pergunta}">Excluir pergunta</button>` : ''}
          ${funcaoUsuario > 0 ? `<button class="editar-resposta" data-id="${pergunta.id_pergunta}">Editar resposta</button>` : ''}
          ${funcaoUsuario > 0 && pergunta.resposta  ? `<button class="excluir-resposta" data-id="${pergunta.id_pergunta}">Excluir resposta</button>` : ''}
        </div>
      `;

        faqContainer.insertAdjacentHTML('beforeend', perguntaHTML);
    });

    if (funcaoUsuario > 0) {
        const editarPerguntaBtns = document.querySelectorAll('.editar-pergunta');
        editarPerguntaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const perguntaId = btn.getAttribute('data-id');
                editarPergunta(perguntaId);
            });
        });

        const excluirPerguntaBtns = document.querySelectorAll('.excluir-pergunta');
        excluirPerguntaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const perguntaId = btn.getAttribute('data-id');
                excluirPergunta(perguntaId);
            });
        });

        const editarRespostaBtns = document.querySelectorAll('.editar-resposta');
        editarRespostaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const perguntaId = btn.getAttribute('data-id');
                editarResposta(perguntaId);
            });
        });

        const excluirRespostaBtns = document.querySelectorAll('.excluir-resposta');
        excluirRespostaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const perguntaId = btn.getAttribute('data-id');
                excluirResposta(perguntaId);
            });
        });
    }

}

function editarPergunta(perguntaId) {
    const modalExistente = document.querySelector('.modal');
    if (modalExistente) modalExistente.remove();
  
    const modalHTML = `
      <div class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Editar pergunta</h2>
          <label for="editar-pergunta">Pergunta:</label>
          <input type="text" id="editar-pergunta">
          <button class="salvar-pergunta" data-id="${perguntaId}">Salvar</button>
          <button class="cancelar-edicao" data-id="${perguntaId}">Cancelar</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  
    const modal = document.querySelector('.modal');
    const salvarBtn = modal.querySelector(`[data-id="${perguntaId}"].salvar-pergunta`);
    const cancelarBtn = modal.querySelector(`[data-id="${perguntaId}"].cancelar-edicao`);
    const closeBtn = modal.querySelector('.close');
  
    const fecharModal = () => {
      modal.remove();
    };
  
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        fecharModal();
      }
    });
  
    closeBtn.addEventListener('click', fecharModal);
  
    salvarBtn.addEventListener('click', async () => {
      const novaPergunta = modal.querySelector(`#editar-pergunta`).value;
      salvarPergunta(perguntaId, novaPergunta);
      fecharModal();
    });
  
    cancelarBtn.addEventListener('click', async () => {
      fecharModal();
    });
}
  

  async function salvarPergunta(perguntaId, novaPergunta) {
    const body = {
        id_pergunta: perguntaId,
        pergunta: novaPergunta,
        token: sessionStorage.getItem('token')
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };

    const response = await fetch('/services/perguntasfrequentes.php', options);

    if (response.ok) {
        listarPerguntasFrequentes();
    } else {
        console.error('Erro ao salvar pergunta');
    }
}

async function excluirPergunta(id_pergunta) {
    const token = sessionStorage.getItem('token');
    const confirmacao = confirm("Tem certeza que deseja excluir essa pergunta?");

    if (confirmacao) {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_pergunta, token })
        };

        const response = await fetch('/services/perguntasfrequentes.php', options);

        if (response.ok) {
            listarPerguntasFrequentes();
        } else {
            console.error('Erro ao excluir pergunta');
        }
    }
}


function editarResposta(id_pergunta) {
    const modalExistente = document.querySelector('.modal');
    if (modalExistente) modalExistente.remove();

    const modalHTML = `
      <div class="modal">
        <div class="modal-content" style="width: 600px; flex-direction: column;">
          <span class="close">&times;</span>
          <h2>Editar resposta</h2>
          <label for="editar-resposta">Resposta:</label>
          <textarea id="editar-resposta" style="resize: vertical; width: 100%;"></textarea>
          <div style="display: flex; justify-content: flex-end;">
            <button class="cancelar-edicao" data-id="${id_pergunta}">Cancelar</button>
            <button class="salvar-resposta" data-id="${id_pergunta}">Salvar</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.querySelector('.modal');
    const salvarBtn = modal.querySelector(`[data-id="${id_pergunta}"].salvar-resposta`);
    const cancelarBtn = modal.querySelector(`[data-id="${id_pergunta}"].cancelar-edicao`);
    const closeBtn = modal.querySelector('.close');

    const fecharModal = () => {
      modal.remove();
    };

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        fecharModal();
      }
    });

    closeBtn.addEventListener('click', fecharModal);

    salvarBtn.addEventListener('click', async () => {
      const novaResposta = modal.querySelector(`#editar-resposta`).value;
      salvarResposta(id_pergunta, novaResposta);
      fecharModal();
    });

    cancelarBtn.addEventListener('click', async () => {
      fecharModal();
    });
  }

async function salvarResposta(id_pergunta, novaResposta) {
    const body = {
        id_pergunta: id_pergunta,
        resposta: novaResposta,
        token: sessionStorage.getItem('token')
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };

    const response = await fetch('/services/respostas.php', options);

    if (response.ok) {
        listarPerguntasFrequentes();
    } else {
        console.error('Erro ao salvar resposta');
    }
}

async function excluirResposta(id_pergunta) {
    const confirmado = window.confirm('Tem certeza que deseja excluir essa resposta?');
    if (!confirmado) {
        return;
    }

    const body = {
        id_pergunta: id_pergunta,
        token: sessionStorage.getItem('token')
    };

    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };

    const response = await fetch('/services/respostas.php', options);

    if (response.ok) {
        listarPerguntasFrequentes();
    } else {
        console.error('Erro ao excluir resposta');
    }
}




listarPerguntasFrequentes();

if(funcaoUsuario > 0) {

    const faqContainer = document.querySelector(".faq-form");

    // Cria o formulário
    const formulario = document.createElement("form");
    formulario.classList.add("criar-pergunta-form");
    
    // Cria o campo de texto da pergunta
    const perguntaInput = document.createElement("input");
    perguntaInput.setAttribute("type", "text");
    perguntaInput.setAttribute("name", "pergunta");
    perguntaInput.setAttribute("placeholder", "Digite sua pergunta aqui...");
    perguntaInput.classList.add("input-field");
    
    // Cria o botão de submissão do formulário
    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.innerText = "Criar pergunta";
    submitButton.classList.add("button");
    
    // Adiciona os campos ao formulário
    formulario.appendChild(perguntaInput);
    formulario.appendChild(submitButton);
    
    // Adiciona o formulário à página
    faqContainer.appendChild(formulario);
    
    // Adiciona um manipulador de eventos ao formulário
    formulario.addEventListener("submit", function(event) {
      event.preventDefault();
      const pergunta = perguntaInput.value;
      criarPergunta(pergunta);
      perguntaInput.value = "";
    });
}

async function criarPergunta(pergunta) {
    const body = {
        pergunta: pergunta,
        token: sessionStorage.getItem('token')
    };

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)       
    }

    // requisição não terá resposta

    await fetch('/services/perguntasfrequentes.php', options)
       .then(response => listarPerguntasFrequentes())
       .catch(error => console.error(error));

}

// const searchField = document.querySelector('.faq-search input[type="search"]');

// searchField.addEventListener('input', async function() {
//     console.log(perguntasFrequentesData)
//   const searchTerm = this.value.toLowerCase();
//   const results = perguntasFrequentesData.filter(function(item) {
//     return item.pergunta.toLowerCase().includes(searchTerm) || item.resposta.toLowerCase().includes(searchTerm);
//   });

//   listarPerguntasFrequentes(results);
//   perguntasFrequentesData = await perguntasFrequentes();

// });

const searchField = document.querySelector('.faq-search input[type="search"]');

function fuzzyMatch(str, pattern) {
  pattern = pattern.split("").reduce(function(a,b){ return a+".*"+b; });
  return (new RegExp(pattern)).test(str);
};

searchField.addEventListener('input', async function() {
  const searchTerm = this.value.toLowerCase();
  let results;
  if (searchTerm.trim() === '') {
    results = perguntasFrequentesData;
  } else {
    results = perguntasFrequentesData.filter(function(item) {
      return fuzzyMatch(item.pergunta.toLowerCase(), searchTerm) || fuzzyMatch(item.resposta.toLowerCase(), searchTerm);
    });
  }

  listarPerguntasFrequentes(results);
  perguntasFrequentesData = await perguntasFrequentes();
});

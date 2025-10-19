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

async function adicionar_status(nome) {
    console.log(nome);
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(`/services/statusTickets.php`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, token }),
        });

    } catch (error) {
        return console.log(error);
    }
}

async function buscar_status_por_id(id) {
    try {
        const response = await fetch(`/services/statusTickets.php?id=${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return console.log(error);
    }
}

async function buscar_todos_os_status() {
    try {
        const response = await fetch(`/services/statusTickets.php`);
        const data = await response.json();
        return data;
    } catch (error) {
        return console.log(error);
    }
}

async function atualizar_status(id, nome) {
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch(`/services/statusTickets.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, nome, token }),
        });
    } catch (error) {
        return console.log(error);
    }
}

async function deletar_status(id) {
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch(`/services/statusTickets.php`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, token }),
        });

    } catch (error) {
        return console.log(error);
    }
}

const btnCriarStatus = document.getElementById("btn-criar-status");
const modal = document.getElementById("modal");
const modalNomeStatus = document.getElementById("modal-nome-status");
const modalBtnCriarStatus = document.getElementById("modal-btn-criar-status");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");

btnCriarStatus.addEventListener("click", () => {
    modal.style.display = "block";
});

modalBtnCriarStatus.addEventListener("click", () => {
    const nomeStatus = modalNomeStatus.value;
    adicionar_status(nomeStatus).then(() => {
        modal.style.display = "none";
        modalNomeStatus.value = "";
        buscar_todos_os_status().then((status) => {
            adicionar_cards_status(status);
          });
    });
});

modalBtnCancelar.addEventListener("click", () => {
    modal.style.display = "none";
    modalNomeStatus.value = "";
});

window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        modalNomeStatus.value = "";
    }
});

function adicionar_cards_status(status) {
    const statusContainer = document.querySelector(".status-container");
    statusContainer.innerHTML = "";
  
    status.forEach((status) => {
      const statusCard = document.createElement("div");
      statusCard.classList.add("status-card");
  
      const statusTitle = document.createElement("h3");
      statusTitle.textContent = status.nome;
      statusCard.appendChild(statusTitle);
  
      const statusId = document.createElement("p");
      statusId.textContent = `ID: ${status.id}`;
      statusCard.appendChild(statusId);
  
      const statusBtns = document.createElement("div");
      statusBtns.classList.add("status-card-btns");
  
      const excluirBtn = document.createElement("button");
    //   adicionar classe para excluir
      excluirBtn.classList.add("btn-excluir");

      excluirBtn.textContent = "Excluir";
      excluirBtn.addEventListener("click", () => {
        if (confirm("Tem certeza que deseja excluir este status?")) {
          deletar_status(status.id);
          statusContainer.removeChild(statusCard);
        }
      });
      statusBtns.appendChild(excluirBtn);
  
      const editarBtn = document.createElement("button");
      editarBtn.textContent = "Editar";
    //   adicionar classe para editar
      editarBtn.classList.add("btn-editar");
      editarBtn.addEventListener("click", () => {
        const modal = document.getElementById("modal-editar");
        const modalNomeStatus = document.getElementById("modal-editar-nome-status");
        modalNomeStatus.value = status.nome;
  
        modal.style.display = "block";
  
        const modalBtnSalvar = document.getElementById("modal-btn-salvar");
        const onSaveClick = () => {
          const novoNomeStatus = modalNomeStatus.value;
          atualizar_status(status.id, novoNomeStatus).then(() => {
            statusTitle.textContent = novoNomeStatus;
            modal.style.display = "none";
  
            buscar_todos_os_status().then((status) => {
              adicionar_cards_status(status);
            });
          });
        };
        modalBtnSalvar.addEventListener("click", onSaveClick);
  
        const modalBtnCancelar = document.getElementById("modal-btn-cancelar-editar");
        modalBtnCancelar.addEventListener("click", () => {
          modal.style.display = "none";
        });
      });
      statusBtns.appendChild(editarBtn);
  
      statusCard.appendChild(statusBtns);
      statusContainer.appendChild(statusCard);
    });
  }
  
  
  modalBtnCancelar.addEventListener("click", () => {
    modal.style.display = "none";
    modalNomeStatus.value = "";
  });
  
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      modalNomeStatus.value = "";
    }
  });
  
  // Define a função onSaveClick fora do escopo do event listener
  const onSaveClick = (status, modalNomeStatus, modal, statusTitle) => {
    const novoNomeStatus = modalNomeStatus.value;
    atualizar_status(status.id, novoNomeStatus).then(() => {
      statusTitle.textContent = novoNomeStatus;
      modal.style.display = "none";
  
      buscar_todos_os_status().then((status) => {
        adicionar_cards_status(status);
      });
    });
  };
  
  buscar_todos_os_status().then((status) => {
    adicionar_cards_status(status);
  });
  




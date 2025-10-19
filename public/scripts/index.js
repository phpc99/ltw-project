import { header, usuario } from "../components/header/header.js";
import { ticketsListHTML, createTicketSearchForm } from "../components/ticketList/ticketList.js";
import { footer } from "../components/footer/footer.js";

const funcaoUsuario = usuario.funcao;

// header(usuario).then((html) => {
//     const headerContainer = document.querySelector('.header-container');

//     headerContainer.appendChild(html);

   
//         // document.getElementById('btnCriarTicket').addEventListener('click', function() {
//         //     // Redireciona para a página de criar ticket
//         //     window.location.href = 'criarTicket.html';
//         // });
    


//     document.querySelector('#footer-container').innerHTML = footer();



// });
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

document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.classList.remove("show");
    });
  }
});




(async function() {
    const html = await ticketsListHTML();
    // adicionar form de filtro ao html
   
})();


if(funcaoUsuario > 0) {
    const ticketListContainer = document.querySelector('.ticket-list-container');
    ticketListContainer.appendChild(createTicketSearchForm());

}


  
  



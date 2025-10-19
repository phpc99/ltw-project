import { header, usuario } from "../components/header/header.js";
import { ticketsListHTML, createTicketSearchForm } from "../components/ticketList/ticketList.js";
import { footer } from "../components/footer/footer.js";
const token = sessionStorage.getItem('token');
const funcaoUsuario = usuario.funcao;

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

const responseDepartamentos = await fetch(`/services/departamentos.php?token=${token}`);
const dataDepartamentos = await responseDepartamentos.json();

const responseHashtags = await fetch(`/services/hashtags.php?token=${token}`);
const dataHashtags = await responseHashtags.json();



function criarFormTicket(dataDepartamentos, dataHashtags) {
    // Cria um elemento <form> usando JavaScript
    const form = document.createElement('form');
    form.id = 'formCriarTicket';
  
    // Cria um elemento <label> e um <input> para o assunto
    const labelAssunto = document.createElement('label');
    labelAssunto.for = 'assunto';
    labelAssunto.textContent = 'Assunto:';
    form.appendChild(labelAssunto);
  
    const inputAssunto = document.createElement('input');
    inputAssunto.type = 'text';
    inputAssunto.id = 'assunto';
    inputAssunto.name = 'assunto';
    inputAssunto.required = true;
    form.appendChild(inputAssunto);
  
    // Cria um elemento <label> e um <textarea> para a descrição
    const labelDescricao = document.createElement('label');
    labelDescricao.for = 'descricao';
    labelDescricao.textContent = 'Descrição:';
    form.appendChild(labelDescricao);
  
    const textareaDescricao = document.createElement('textarea');
    textareaDescricao.id = 'descricao';
    textareaDescricao.name = 'descricao';
    textareaDescricao.required = true;
    form.appendChild(textareaDescricao);
  
    // Cria um elemento <label> e um <select> para o departamento
    const labelDepartamento = document.createElement('label');
    labelDepartamento.for = 'departamento';
    labelDepartamento.textContent = 'Departamento:';
    form.appendChild(labelDepartamento);
  
    const selectDepartamento = document.createElement('select');
    selectDepartamento.id = 'departamento';
    selectDepartamento.name = 'departamento';
    selectDepartamento.required = false;
  
    const optionDepartamento = document.createElement('option');
    optionDepartamento.value = '';
    optionDepartamento.textContent = 'Selecione um departamento';
    selectDepartamento.appendChild(optionDepartamento);
  
    // Adiciona as opções de departamento dinamicamente
    dataDepartamentos.forEach(dep => {
      const option = document.createElement('option');
      option.value = dep.id;
      option.textContent = dep.nome;
      selectDepartamento.appendChild(option);
    });
  
    form.appendChild(selectDepartamento);
  
    // // Cria um elemento <label> para as hashtags
    // const labelHashtags = document.createElement('label');
    // labelHashtags.textContent = 'Hashtags:';
    // form.appendChild(labelHashtags);
  
    // // Adiciona as checkboxes de hashtags dinamicamente
    // dataHashtags.forEach(hashtag => {
    //   const divCheckbox = document.createElement('div');
  
    //   const labelCheckbox = document.createElement('label');
    //   labelCheckbox.for = `hashtag_${hashtag.id}`;
    //   labelCheckbox.textContent = hashtag.nome;
    //   divCheckbox.appendChild(labelCheckbox);
  
    //   const inputCheckbox = document.createElement('input');
    //   inputCheckbox.type = 'checkbox';
    //   inputCheckbox.id = `hashtag_${hashtag.id}`;
    //   inputCheckbox.name = 'hashtags[]';
    //   inputCheckbox.value = hashtag.id;
    //   divCheckbox.appendChild(inputCheckbox);
  
    //   form.appendChild(divCheckbox);
    // });
  
    // Cria um elemento <button> para enviar o formulário
    const buttonEnviar = document.createElement('button');
    buttonEnviar.type = 'submit';
    buttonEnviar.textContent = 'Criar ticket';
    form.appendChild(buttonEnviar);
  
    return form; // Retorna o elemento HTML
  }


// adicionar o form ao html form-container
document.querySelector('.form-container').appendChild(criarFormTicket(dataDepartamentos, dataHashtags));


document.getElementById('formCriarTicket').addEventListener('submit', async function (event) {
    event.preventDefault(); // Previne que o formulário seja submetido normalmente

    // Busca os dados do formulário
    const usuario_id = usuario.id;
    const assunto = document.getElementById('assunto').value;
    const descricao = document.getElementById('descricao').value;
    const departamento_id = document.getElementById('departamento').value;
    const hashtags = Array.from(document.querySelectorAll('#formCriarTicket div input[type="checkbox"]:checked')).map(input => parseInt(input.value));

    // Cria um objeto com os dados do ticket
    const ticket = { usuario_id, token, assunto, descricao, departamento_id, hashtags };

    console.log(ticket);
    // Faz uma requisição POST para criar o ticket
    const response = await fetch('/services/tickets.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
    });

    // Redireciona para a página de tickets após criar o ticket
    window.location.href = 'index.html';
});
import { usuario } from "../header/header.js";

async function buscarTicketsDoUsuarioByToken() {
  const token = sessionStorage.getItem('token');

  const response = await fetch(`/services/tickets.php?token=${token}`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  });
  const data = await response.json();
  return data;
}

async function buscarRespostasDoTicket(ticketId) {
  const token = sessionStorage.getItem('token');
  const response = await fetch(`/services/tickets.php?token=${token}&&ticket_id=${ticketId}&&action=respostas`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  });
  const data = await response.json();
  return data;
}

export const ticketsListHTML = async (filtro = 0) => {
  
  const funcaoUsuario = usuario.funcao;
  // limpar o conteudo da div tickets
  const divTickets = document.getElementById("tickets");
  divTickets.innerHTML = "";

  let respostaServidor = [];
  console.log(filtro)

  if(filtro != 0) {  

    // pegar os valores que estão no formulário de filtro
    // <form class="ticket-search-form"><label>Agente Atribuído: <select name="agente"><option value="">Selecione um agente</option><option value="1">usuario1</option><option value="4">maria456</option><option value="6">johndoe</option><option value="7">ana123</option><option value="9">maria789</option><option value="15">exemplo</option><option value="16">john_doe</option><option value="17">joao123</option></select></label><label>Status: <select name="status"><option value="">Selecione um status</option><option value="1">Aberto</option><option value="2">Fechado</option></select></label><label>Prioridade: <select name="prioridade"><option value="">Selecione uma prioridade</option><option value="1">Baixa</option><option value="2">Média</option><option value="3">Alta</option></select></label><label>Hashtag: <select name="hashtag"><option value="">Selecione uma hashtag</option><option value="1">#impressora</option><option value="2">#orcamento</option><option value="3">Internet</option><option value="4">Produto X</option><option value="5">Fatura</option><option value="6">entrega</option><option value="7">atraso</option><option value="8">problema</option><option value="9">venda</option><option value="10">suporte</option><option value="11">financeiro</option><option value="12">vendas</option></select></label><button type="submit">Buscar Tickets</button></form>
    const agente = (document.querySelector("select[name='agente']"))? document.querySelector("select[name='agente']").value : null;
    const statusTicket = (document.querySelector("select[name='status']"))? document.querySelector("select[name='status']").value : null;
    const prioridade = (document.querySelector("select[name='prioridade']")) ? document.querySelector("select[name='prioridade']").value : null;
    const hashtag = (document.querySelector("select[name='hashtag']")) ? document.querySelector("select[name='hashtag']").value : null;
    const departamento = (document.querySelector("select[name='departamento']")) ? document.querySelector("select[name='departamento']").value : null;
    const dataCriacao = (document.querySelector("input[name='dataCriacao']")) ? document.querySelector("input[name='dataCriacao']").value : null;

    // console.log(dataCriacao)
    respostaServidor = await buscarTickets(agente, statusTicket, parseInt(prioridade), hashtag, departamento, dataCriacao)
  } else if(funcaoUsuario == 0) {

    respostaServidor = await buscarTicketsDoUsuarioByToken();
  console.log(respostaServidor)

  } else {
    respostaServidor = await buscarTickets(null, null, null, null, null)
  }

  if(respostaServidor.length == 0) {
    // mostrar mensagem de que não há tickets
    const divTickets = document.getElementById("tickets");
    divTickets.innerHTML = "<p>Nenhum ticket encontrado</p>";
    return

  }

  // const respostaServidor pode buscar os tickets do usuario, tickets por departamento, tickets por status, tickets por prioridade
  // console.log(respostaServidor)


  respostaServidor.forEach(async ticket => {
    
    const divTicket = document.createElement("div");
    divTicket.classList.add("ticket");
    divTicket.id = `ticket-${ticket.id}`; // Adiciona um ID único para cada div de ticket
    divTicket.style.position = "relative"; // Adiciona position: relative para posicionar o status corretamente

    // Adiciona o status do ticket no canto superior direito da div
    const pStatus = document.createElement("p");
    pStatus.classList.add("ticket-status");
    const statuses = await buscar_todos_os_status();

    // console.log(ticket.status, statuses)
    const status = statuses.find(status => status.id == parseInt(ticket.status));
    pStatus.innerText = (status) ? status.nome : `Esse status foi descontinuado. ${(funcaoUsuario != 0) ? "Edite o ticket!" : "Aguarde."}`;

    pStatus.style.position = "absolute";
    pStatus.style.top = "5px";
    pStatus.style.right = "5px";
    divTicket.appendChild(pStatus);

    // Adiciona estilo ao pStatus
    pStatus.style.color = "white";
    pStatus.style.padding = "5px";
    pStatus.style.borderRadius = "5px";
    pStatus.style.fontSize = "12px";
    pStatus.style.fontWeight = "bold";
    pStatus.style.textTransform = "uppercase";
    pStatus.style.letterSpacing = "1px";
    pStatus.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.2)";

    // dar uma cor proxima ao preto
    pStatus.style.backgroundColor = "#000";



    const h2Assunto = document.createElement("h2");
    h2Assunto.classList.add("ticket-assunto");
    h2Assunto.innerText = `#${ticket.id} - ${ticket.assunto}`;
    divTicket.appendChild(h2Assunto);

    const pDescricao = document.createElement("p");
    pDescricao.classList.add("ticket-descricao");
    pDescricao.innerText = ticket.descricao;
    divTicket.appendChild(pDescricao);

    const pHashtags = document.createElement("p");
    pHashtags.classList.add("ticket-hashtags");
    let hashtags = ticket.hashtags;
    // se hashtags == undefined, hashtags = "Nenhuma hashtag adicionada"
    if (hashtags == undefined) {
      hashtags = "Nenhuma hashtag adicionada";
    }

    pHashtags.innerText = `#${hashtags}`;
    divTicket.appendChild(pHashtags);
    pHashtags.style.fontWeight = "bold";

    const pUsuario = document.createElement("p");
    pUsuario.classList.add("ticket-usuario");
    pUsuario.innerText = `Criado por: ${ticket.usuario_nome}`;
    divTicket.appendChild(pUsuario);

    const pResponsavel = document.createElement("p");
    pResponsavel.classList.add("ticket-responsavel");
    pResponsavel.innerText = `Responsável: ${ticket.responsavel_nome}`;
    divTicket.appendChild(pResponsavel);

    // ao lado do assunto adicionar o departamento do ticket
    const pDepartamento = document.createElement("p");
    pDepartamento.classList.add("ticket-departamento");
    let departamento = ticket.departamento;
    pDepartamento.innerText = `Departamento: ${departamento}`;
    divTicket.appendChild(pDepartamento);

    // ao lado do departamento adicionar as hashtags do ticket em negrito


// adiciona o usuario que criou e o responsavel do ticket






    divTickets.appendChild(divTicket);

    const btnEditarTicket = document.createElement("button");
    btnEditarTicket.innerText = "Editar";
    btnEditarTicket.addEventListener("click", () => editarTicket(ticket));
    // divTicket.appendChild(btnEditarTicket);

    // Adiciona um botão para excluir o ticket
    const btnExcluirTicket = document.createElement("button");
    btnExcluirTicket.innerText = "Excluir";
    btnExcluirTicket.addEventListener("click", () => excluirTicket(ticket.id));
    // divTicket.appendChild(btnExcluirTicket);

    // adiciona um botão para listar as mudanças do ticket, esse botão leva para a tela de mudanças
   
    // divTicket.appendChild(btnMudanca);
  


    if(funcaoUsuario > 0) {
      divTicket.insertBefore(btnEditarTicket, h2Assunto);
      if(funcaoUsuario > 1)
        divTicket.insertBefore(btnExcluirTicket, h2Assunto);

      // adiciona o responsavel do 

      // adiciona a prioridade do ticket
      const pPrioridade = document.createElement("p");
      pPrioridade.classList.add("ticket-prioridade");
      let prioridedes = ["Baixa", "Média", "Alta"];
      pPrioridade.innerText = `Prioridade: ${prioridedes[ticket.prioridade]}`;
      divTicket.appendChild(pPrioridade);
    }

    const pCriadoEm = document.createElement("p");
    pCriadoEm.classList.add("ticket-criado-em");
    pCriadoEm.innerText = `Criado em: ${ticket.criado_em}`;
    divTicket.appendChild(pCriadoEm);

        // Adiciona um botão para expandir/ocultar as respostas
    const btnVerOcultarRespostas = document.createElement("button");
    btnVerOcultarRespostas.innerText = "Ver/ocultar respostas";
    divTicket.appendChild(btnVerOcultarRespostas);

    if(funcaoUsuario > 0) {
      const btnRespostaFaq = document.createElement("button");
      btnRespostaFaq.innerText = "Usar FAQ";
      btnRespostaFaq.addEventListener("click", () => usarRespostaFaq(ticket.id));
      divTicket.appendChild(btnRespostaFaq);
      btnRespostaFaq.style.backgroundColor = "#2196f3";
      btnRespostaFaq.style.color = "white";
      btnRespostaFaq.style.borderRadius = "5px";
      btnRespostaFaq.style.marginBottom = "10px";
    }


    const btnMudanca = document.createElement("button");
    btnMudanca.innerText = "Histórico";
    btnMudanca.addEventListener("click", () => historicoTicket(ticket.id));
    
    if(funcaoUsuario > 0) 
      divTicket.appendChild(btnMudanca);

    // adicionar estilo para o btnMudanca
    btnMudanca.style.backgroundColor = "#4b84b8";
    btnMudanca.style.color = "white";
    btnMudanca.style.marginRight = "10px";
    btnMudanca.style.borderRadius = "5px";

    //adiconar estilo para o botão de editar e excluir
    btnEditarTicket.style.marginRight = "10px";
    btnExcluirTicket.style.marginRight = "10px";
    // dar cores para o botão de editar(azul) e excluir
    btnEditarTicket.style.backgroundColor = "#2196f3";
    btnEditarTicket.style.color = "white";
    btnExcluirTicket.style.backgroundColor = "#f44336";
    btnExcluirTicket.style.color = "white";
    // bordas arredondadas
    btnEditarTicket.style.borderRadius = "5px";
    btnExcluirTicket.style.borderRadius = "5px";

    // dar estilo ao ticket
    divTicket.style.backgroundColor = "#f2f2f2";
    divTicket.style.padding = "10px";
    divTicket.style.marginBottom = "10px";
    divTicket.style.borderRadius = "5px";

    // dar estilo ao botão de ver/ocultar respostas
    btnVerOcultarRespostas.style.backgroundColor = "#2196f3";
    btnVerOcultarRespostas.style.color = "white";
    btnVerOcultarRespostas.style.borderRadius = "5px";
    btnVerOcultarRespostas.style.marginBottom = "10px";




    // Adiciona um evento de clique na div de ticket
    btnVerOcultarRespostas.addEventListener("click", async () => {
      const respostas = await buscarRespostasDoTicket(ticket.id); // Busca as respostas do ticket no servidor
      const divRespostas = document.createElement("div");
      divRespostas.classList.add("ticket-respostas");
// dar estilo para a div de respostas
      divRespostas.style.backgroundColor = "#f2f2f2";
      divRespostas.style.padding = "10px";
      divRespostas.style.marginBottom = "10px";
      divRespostas.style.borderRadius = "5px";

      // mostre as respostas somente se elas já não estiverem sendo mostradas
      if (divTicket.querySelector(".ticket-respostas") === null) {
        respostas.forEach(resposta => {

          const divHoraResposta = document.createElement("div");
          divHoraResposta.classList.add("ticket-hora-resposta");
          divHoraResposta.innerText = resposta.hora;

          const divResposta = document.createElement("div");
          divResposta.classList.add("ticket-resposta");
          
          if(resposta.faq === null)
            divResposta.innerHTML = `<a class="agent-text">${resposta.nome_agent}:<a> ${resposta.resposta}`;
          else {

            buscarFaq(resposta.faq).then(faq => {
              let respostaFaq = faq.resposta;
              let perguntaFaq = faq.pergunta;

              console.log(perguntaFaq, respostaFaq);
              divResposta.innerHTML = `<a class="agent-text">${resposta.nome_agent}:<a> <br>FAQ #${perguntaFaq.id} <br> P:${perguntaFaq.pergunta}<br>R:${respostaFaq.resposta}<a>`;

            })

          }



          const divRespostaHora = document.createElement("div");
          divRespostaHora.classList.add("ticket-resposta-hora");
          divRespostaHora.appendChild(divResposta);
          divRespostaHora.appendChild(divHoraResposta);

          divRespostas.appendChild(divRespostaHora);

          const hr = document.createElement("hr");
          hr.classList.add("ticket-resposta-separator");
          divRespostas.appendChild(hr);
        });
        // Se o status do ticket for aberto (0), adiciona um campo de texto e um botão para o usuário escrever e enviar sua resposta
        console.log(ticket)
        if (ticket.status !== "2") {
          const inputContainer = document.createElement('div');
          inputContainer.style.display = 'flex';
          
          const inputResposta = document.createElement("input");
          inputResposta.type = "text";
          inputResposta.placeholder = "Escreva sua resposta aqui";
          
          const btnEnviarResposta = document.createElement('button');
          btnEnviarResposta.innerText = 'Enviar';
          
          btnEnviarResposta.addEventListener('click', () => {
          
            publicarResposta(`${inputResposta.value}`, ticket.id)
            if(funcaoUsuario != 0)
              ticketsListHTML(1);
            else 
              ticketsListHTML();

            
          });
          
          inputContainer.appendChild(inputResposta);
          inputContainer.appendChild(btnEnviarResposta);
          
          divRespostas.appendChild(inputContainer);
        }
        divTicket.appendChild(divRespostas);



      } else {
        divTicket.removeChild(divTicket.querySelector(".ticket-respostas"));
      }

      
    });
  });
}

async function publicarResposta(resposta, ticketId) {
  const token = sessionStorage.getItem('token');
  const response = await fetch(`/services/tickets.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: token,
      ticket_id: ticketId,
      resposta: resposta
    })
  });
  const data = await response.json();
  
  return data;
}

async function editarTicket(ticket) {
  document.querySelector('.modal')?.remove();
  document.querySelector('#modal').innerHTML = "";
  console.log(ticket)
  const prioridades = [{ id: 1, nome: "Baixa" }, { id: 2, nome: "Media" }, { id: 3, nome: "Alta" }];
  const departamentos = await getDepartamentos();
  const hashtags = await obterHashtags();
  const statuses = await buscar_todos_os_status();
  const responsaveis = await obterUsuariosPorFuncao(1);
  
  const modalHTML = `
    <div class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Ticket</h2>
          <span class="close">X</span>
        </div>
        <div class="modal-body">
          <label for="assunto">Assunto</label>
          <input type="text" id="assunto" value="${ticket.assunto}">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" value= "">${ticket.descricao}</textarea>
          <label for="departamento">Departamento</label>
          <select id="departamento">
            <option value="0">Selecione um departamento</option>
            ${departamentos.map(departamento => `<option value="${departamento.id}" ${departamento.id == ticket.departamento_id ? "selected" : ""}>${departamento.nome}</option>`)}
          </select>
          <label for="prioridade">Prioridade</label>
          <select id="prioridade">
            <option value="0">Selecione uma prioridade</option>
            ${prioridades.map(prioridade => `<option value="${prioridade.id}" ${prioridade.id == parseInt(ticket.prioridade)+1 ? "selected" : console.log(prioridade.id, ticket.prioridade) }>${prioridade.nome}</option>`)}
          </select>
          <label for="status">Status</label>
          <select id="status">
            <option value="0">Selecione um status</option>
            ${statuses.map(status => `<option value="${status.id}" ${status.id == ticket.status ? "selected" : '' }>${status.nome}</option>`)}
          </select>

          <label for="responsavel">Responsável</label>
          <select id="responsavel">
            <option value="0">Selecione um responsável</option>
            ${responsaveis.map(responsavel => `<option value="${responsavel.id}" ${(responsavel.id == ticket.responsavel) ? "selected" : ""}>${responsavel.nome_usuario}</option>`)}
          </select> 
          <label for="hashtags">Hashtags</label>         
          <ul id="search-results"></ul>
          <ul id="hashtag-list">
          </ul>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn">Cancelar</button>
          <button class="save-btn">Salvar</button>
        </div>
      </div>
    </div>
  `;

  document.querySelector('#modal').innerHTML = modalHTML;

  let modalBody = document.querySelector('.modal-body');
  createHashtagSelector(ticket, hashtags, modalBody);
  let selectedHashtags = getHashtags();
      // Adiciona o evento de clique ao botão "Cancelar"
      document.querySelector('.cancel-btn').addEventListener('click', () => {
        document.querySelector('.modal').style.display = 'none';
    });

    // Adiciona o evento de clique ao botão "X"
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.modal').style.display = 'none';
    });

    // Adiciona o evento de clique fora do modal
    window.addEventListener('click', event => {
        if (event.target === document.querySelector('.modal')) {
            document.querySelector('.modal').style.display = 'none';
        }
    });

  document.querySelector('.save-btn').addEventListener('click', async () => {
    const token = sessionStorage.getItem('token');
    const assunto = document.querySelector('#assunto').value;
    const descricao = document.querySelector('#descricao').value;
    const departamento = document.querySelector('#departamento').value;
    const status = document.querySelector('#status').value;
    const prioridade = document.querySelector('#prioridade').value;
    const responsavel = document.querySelector('#responsavel').value;
    const hashtags = getHashtags();
    await salvarTicket(token, ticket.id, assunto, descricao, departamento, status, prioridade, hashtags, responsavel);
    
  })
  removeAllHashtags();
}

async function salvarTicket(token, ticket_id, assunto, descricao, departamento, status, prioridade, hashtags, responsavel) {
  // se assunto ou descricao forem vazios alert e retornar
  if (assunto.trim() == '' ) {
    alert('O campo assunto está vazio!');
    return
  }
  
  if (descricao.trim()  == '') {
    alert('O campo descrição está vazio!');
    return
  }
  
  const response = await fetch(`/services/tickets.php`, {
    method: 'PUT',
    body: JSON.stringify({
      ticket_id,
      assunto,
      descricao,
      departamento,
      status,
      prioridade,
      token,
      hashtags,
      responsavel
    })
  });

  
  if (response.status == 200) {
    console.log('Ticket salvo com sucesso!');
    ticketsListHTML(1);
  } else {
    alert('Erro ao editar ticket!');
  }
}

async function excluirTicket(ticket_id) {
  const token = sessionStorage.getItem('token');

  // passar os parametros no body
  const response = await fetch(`/services/tickets.php?`, {
    method: 'DELETE',
    body: JSON.stringify({
      ticket_id,
      token
    })
  });

  if (response.status == 200) {
    ticketsListHTML()
  }

}

async function obterHashtags() {
  const response = await fetch(`/services/hashtags.php`);
  const data = await response.json();

  return data;
}

async function obterUsuariosPorFuncao(funcao) {
  funcao = parseInt(funcao);
  const response = await fetch(`/services/usuarios.php?funcao=${funcao}`);
  const data = await response.json();
  return data;
}


export function createTicketSearchForm() {
  const token = sessionStorage.getItem('token');
  const funcaoUsuario = usuario.funcao;

  // criar um botao chamado "Criar ticket"

  if(funcaoUsuario == 0) {
    // criar um titulo chamado "Meus tickets"
    return;
  }
  // Cria o elemento form
  const form = document.createElement('form');
  form.classList.add('ticket-search-form');

  // Adiciona um campo para o agente atribuído
  const agentLabel = document.createElement('label');
  agentLabel.textContent = 'Agente Atribuído: ';
  const agentSelect = document.createElement('select');
  agentSelect.name = 'agente';
  agentSelect.appendChild(createSelectOption('', 'Selecione um agente'));
  obterUsuariosPorFuncao(1).then((users) => {
    users.forEach((user) => {
      const option = createSelectOption(user.id, user.nome_usuario);
      agentSelect.appendChild(option);
    });
  });
  agentLabel.appendChild(agentSelect);
  form.appendChild(agentLabel);

  // Adiciona um campo para o status do ticket
  const statusLabel = document.createElement('label');
  statusLabel.textContent = 'Status: ';
  const statusSelect = document.createElement('select');
  statusSelect.name = 'status';
  statusSelect.appendChild(createSelectOption('', 'Selecione um status'));
  buscar_todos_os_status().then((statuses) => {
    statuses.forEach((status) => {
      const option = createSelectOption(status.id, status.nome);
      statusSelect.appendChild(option);
    });
  })

  
  statusLabel.appendChild(statusSelect);
  form.appendChild(statusLabel);

  // Adiciona um campo para a prioridade do d
  const priorityLabel = document.createElement('label');
  priorityLabel.textContent = 'Prioridade: ';
  const prioritySelect = document.createElement('select');
  prioritySelect.name = 'prioridade';
  prioritySelect.appendChild(createSelectOption('-1', 'Selecione uma prioridade'));
  prioritySelect.appendChild(createSelectOption('1', 'Baixa'));
  prioritySelect.appendChild(createSelectOption('2', 'Média'));
  prioritySelect.appendChild(createSelectOption('3', 'Alta'));
  priorityLabel.appendChild(prioritySelect);
  form.appendChild(priorityLabel);

  // Adiciona um campo de data de criacao do ticket
  const dataCriacaoLabel = document.createElement('label');
  dataCriacaoLabel.textContent = 'Data de Criação: ';
  const dataCriacaoInput = document.createElement('input');
  dataCriacaoInput.type = 'date';
  dataCriacaoInput.name = 'dataCriacao';
  form.appendChild(dataCriacaoLabel);
  dataCriacaoLabel.appendChild(dataCriacaoInput);



  // Adiciona um campo para a hashtag do ticket
  const hashtagLabel = document.createElement('label');
  hashtagLabel.textContent = 'Hashtag: ';
  const hashtagSelect = document.createElement('select');
  hashtagSelect.name = 'hashtag';
  hashtagSelect.appendChild(createSelectOption('', 'Selecione uma hashtag'));
  fetch(`/services/hashtags.php?token=${token}`)
    .then((response) => response.json())
    .then((hashtags) => {
      hashtags.forEach((hashtag) => {
        const option = createSelectOption(hashtag.id, hashtag.nome);
        hashtagSelect.appendChild(option);
      });
    });
  hashtagLabel.appendChild(hashtagSelect);
  form.appendChild(hashtagLabel);

  // adiciona um select para o departamento
  const departamentoLabel = document.createElement('label');
  departamentoLabel.textContent = 'Departamento: ';
  const departamentoSelect = document.createElement('select');
  departamentoSelect.name = 'departamento';
  departamentoSelect.appendChild(createSelectOption('', 'Selecione um departamento'));
  fetch(`/services/departamentos.php`)
    .then((response) => response.json())
    .then((departamentos) => {
      departamentos.forEach((departamento) => {
        const option = createSelectOption(departamento.id, departamento.nome);
        departamentoSelect.appendChild(option);
      });
    })

  departamentoLabel.appendChild(departamentoSelect);
  form.appendChild(departamentoLabel);


  
  

  // Adiciona um botão para enviar o formulário
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Buscar Tickets';


  
  submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    ticketsListHTML(1);


  });
  form.appendChild(submitButton);

  return form;
}




function createSelectOption(value, text) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  return option;
}

export async function buscarTickets(agente, status, prioridade, hashtag, departamento, dataCriacao) {
  // decrease status and priority by 1 if they are not 0
  let token = sessionStorage.getItem('token');

  console.log(dataCriacao)

//  se todos os parametros forem vazios, então retorne a funçao buscarTicketsDoUsuarioByToken

  if (agente == '' && status == '' && prioridade == '' && hashtag == '' && departamento == '' && usuario.funcao == 0) {
    
    return buscarTicketsDoUsuarioByToken(token);
  }

  if (prioridade != 0) {
    prioridade--;
  }

  const baseUrl = '/services/tickets.php';

  const params = new URLSearchParams();
  params.append('filtros', 'true');
  params.append('token', token);
  if (agente) {
    params.append('agente', agente);
  }
  if (status) {
    params.append('status', status);
  }

  console.log(prioridade)
  if (prioridade > -1) {
    params.append('prioridade', prioridade);
  }
  if (hashtag) {
    params.append('hashtag', hashtag);
  }
  if (departamento) {
    params.append('departamento', departamento);
  }
  if (dataCriacao) {
    params.append('dataCriacao', dataCriacao);
  }
  
  const url = `${baseUrl}?${params.toString()}`;
  
  // fazer a requisicao
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function historicoTicket(id) {
  document.querySelector('.modal')?.remove();

  const token = sessionStorage.getItem('token');
  const url = `/services/tickets.php?ticket_id=${id}&token=${token}&historico=true`;
  const response = await fetch(url);
  const data = await response.json();

  
  // criar uma tabela 
  let statuses = await buscar_todos_os_status()
  let prioridades = ['Baixa', 'Média', 'Alta']

  let tr = '';
  data.forEach((linha) => {
    let campo = linha.campo 
    let valor_antigo = (linha.valor_antigo === null) ? '- - -' : linha.valor_antigo
    let valor_novo = linha.valor_novo
    let data_hora = linha.data_hora
    // criar um tr
    if (campo == 'status') {
      statuses.forEach(status => {
        if(status.id == valor_antigo) {
          valor_antigo = status.nome
        }
        if(status.id == valor_novo) {
          valor_novo = status.nome
        }
      });

      if(valor_novo == 0) {
        valor_novo = 'Desconhecido'
      }
      if(valor_antigo == 0) {
        valor_antigo = 'Desconhecido'
      }

    }



    if(campo == 'prioridade') {
      
      valor_antigo = (prioridades[valor_antigo] === undefined) ? '- - -' : prioridades[valor_antigo]
      valor_novo = (prioridades[valor_novo] === undefined) ? '- - -' : prioridades[valor_novo]
    }


    tr += `
      <tr>
        <td>${campo}</td>
        <td>${valor_antigo}</td>
        <td>${valor_novo}</td>
        <td>${data_hora}</td>
      </tr>
    `;
     
  })

  let html = `
  <table>
    <thead>
      <tr>
        <th>Campo</th>
        <th>Valor antigo</th>
        <th>Valor novo</th>
        <th>Data-Hora</th>
      </tr>
    </thead>
    <tbody>
      ${tr}
    </tbody>
  </table>
  `;

  // apagar o modal
  // criar um modal se nao existir
  const modal = document.createElement('div');

  modal.classList.add('modal');
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" id="close-h">&times;</span>
      <h2>Historico de mundanças</h2>
      ${html}
    </div>
  `;

  document.body.appendChild(modal);

  // fechar o modal quando clicar no X
  document.querySelector('#close-h').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // fechar o modal quando clicar fora dele
  // window.addEventListener('click', (event) => {
  //   if (event.target != modal) {
  //     modal.style.display = 'none';
  //   }

  // })
}



async function buscarFuncaoUsuario() {
  const token = sessionStorage.getItem('token');
  const url = `/services/usuarios.php?token=${token}&action=funcao`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}



// async function buscarDepartamento(id) {
//   const response = await fetch(`/services/departamentos.php?id=${id}`);
//   const data = await response.json();

//   return data.nome;

// }



function createHashtagSelector(ticket, dataHashtags, modalBody) {
  // Cria o campo de texto
  let input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Digite uma hashtag...';

  // Cria a lista de hashtags
  let hashtagList = document.createElement('ul');
  hashtagList.id = 'hashtag-list';

  // Adiciona as hashtags existentes ao campo de texto
  ticket.hashtags.forEach(hashtag => {
      let hashtagData = dataHashtags.find(h => h.nome === hashtag);
      if (hashtagData) {
          let li = document.createElement('li');
          li.textContent = hashtagData.nome;
          li.dataset.id = hashtagData.id;
          li.innerHTML += ' <span class="remove-hashtag">x</span>';
          hashtagList.appendChild(li);
      }
  });

  // Adiciona o evento de clique para remover a hashtag
  hashtagList.addEventListener('click', event => {
      if (event.target.classList.contains('remove-hashtag')) {
          event.target.parentNode.remove();
      }
  });

  // Cria a lista de resultados da pesquisa
  let searchResults = document.createElement('ul');
  searchResults.id = 'search-results';

  // Adiciona o evento de entrada para procurar hashtags semelhantes
  input.addEventListener('input', event => {
      let search = event.target.value;
      if (search) {
          let addedHashtags = getHashtags();
          let results = dataHashtags.filter(hashtag => hashtag.nome.toLowerCase().includes(search.toLowerCase()) && !addedHashtags.includes(hashtag.id));

          // Limpa os resultados anteriores
          searchResults.innerHTML = '';

          // Adiciona os novos resultados
          results.forEach(result => {
              let li = document.createElement('li');
              li.textContent = result.nome;
              li.dataset.id = result.id;
              searchResults.appendChild(li);
          });
      } else {
          searchResults.innerHTML = '';
      }
  });

  // Adiciona o evento de clique para adicionar a hashtag selecionada
  searchResults.addEventListener('click', event => {
      if (event.target.tagName === 'LI') {
          let id = event.target.dataset.id;
          if (!hashtagList.querySelector(`li[data-id="${id}"]`)) {
              let li = document.createElement('li');
              li.textContent = event.target.textContent;
              li.dataset.id = id;
              li.innerHTML += ' <span class="remove-hashtag">x</span>';
              hashtagList.appendChild(li);
              input.value = '';
              searchResults.innerHTML = '';
          }
      }
  });

  // Adiciona os elementos ao modalBody
  modalBody.appendChild(input);
  modalBody.appendChild(searchResults);
  modalBody.appendChild(hashtagList);
}

function getHashtags() {
  let hashtagList = document.querySelector('#hashtag-list');
  let hashtags = [];

  hashtagList.querySelectorAll('li').forEach(li => {
      hashtags.push(li.dataset.id);
  });
  return hashtags;
}

function removeAllHashtags() {
  let hashtagList = document.querySelector('#hashtag-list');
  if (hashtagList) {
      hashtagList.parentNode.removeChild(hashtagList);
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
async function getDepartamentos() {
  return await fetch("/services/departamentos.php")
      .then(response => response.json())
      .then(departamentos => departamentos);
}


async function getTicket(ticketId) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`/services/tickets.php?ticket_id=${ticketId}&&token=${token}`);
  const data = await response.json();
  const ticket = data;
  return ticket;
}

async function usarRespostaFaq(ticket_id) {
  const url = `/services/perguntasfrequentes.php?ticket_id=${ticket_id}`;
  const response = await fetch(url);
  const data = await response.json();
  abrirModalPerguntasRespostas(data, ticket_id);
}

function abrirModalPerguntasRespostas(data, ticket_id) {
  // criar uma tabela com as perguntas e respostas
  document.querySelector('.modal')?.remove();


  let tr = '';
  data.forEach((linha) => {
    let pergunta = linha.pergunta;
    let resposta = linha.resposta;

    tr += `
      <tr>
        <td>${pergunta}</td>
        <td>${resposta}</td>
        <td><button class="usar-resposta-btn" data-id="${linha.id_pergunta}">Usar como resposta</button></td>
      </tr>
    `;
  })

  let html = `
    <table>
      <thead>
        <tr>
          <th>Pergunta</th>
          <th>Resposta</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${tr}
      </tbody>
    </table>
  `;

  // criar um modal
  const modal = document.createElement('div');
  modal.classList.add('modal');

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" id="close-p">&times;</span>
      <h2>Perguntas e respostas</h2>
      ${html}
    </div>
  `;

  document.body.appendChild(modal);

  // adicionar evento de click ao botão "Usar como resposta"
  const buttons = modal.querySelectorAll('.usar-resposta-btn');
  buttons.forEach((button) => {
    button.addEventListener('click', (modal) => {
      const pergunta = button.parentNode.parentNode.querySelector('td:first-child').textContent;
      const resposta = button.parentNode.parentNode.querySelector('td:nth-child(2)').textContent;
      const id = button.dataset.id;

      publicarRespostaFaq(ticket_id, id);

      modal.remove();
      
    })
  })

  // fechar o modal quando clicar no X
  document.querySelector('#close-p').addEventListener('click', () => {
    modal.style.display = 'none';
  });

}


async function publicarRespostaFaq(ticket_id, faq_id) {
  const url = `/services/tickets.php`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticket_id: ticket_id,
      faq_id: faq_id,
      token: sessionStorage.getItem("token")
    })
  })
  const data = await response.json();

  if(data.success)
    alert("Resposta publicada com sucesso!");
  else
    alert("Erro ao publicar resposta!");
}

async function buscarFaq(id) {
  const url = `/services/perguntasfrequentes.php?id_pergunta=${id}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
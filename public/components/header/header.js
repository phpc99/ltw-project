export const header = async (usuario) => {
  if (usuario.id == undefined) window.location.href = "login.html";
  let htmlBotaoUsuarios = "";
  if (usuario.funcao == 2) {
    htmlBotaoUsuarios = `
    <button id="btnPerfil" onclick="window.location.href= \'meuPerfil.html\'" class="user-menu-button" >Perfil</button>
    <div class="dropdown">
      <button id="btnControle" class="user-menu-button">Controle</button>
      <div class="dropdown-content">
        <a id="btnUsuarios" href='usuarios.html'" class="btn" >Usuários</button>
        <a class="btn" href="departamentos.html">Departamentos</a>
        <a class="btn" href="statusTicket.html">Status</a>
        <a class="btn" href="hashtags.html">Hashtags</a>
      </div>
    </div>
    <div class="dropdown">
      <button id="btnTicket" class="user-menu-button">Ticket</button>
      <div class="dropdown-content">
        <a class="btn" href="criarTicket.html">Criar Ticket</a>
        <a class="btn" href="index.html">Mostrar Tickets</a>
      </div>
    </div>
    <button id="btnFaq" onclick="window.location.href= \'faq.html\'" class="user-menu-button" >F.A.Q</button>`;
  } else {
    htmlBotaoUsuarios = `<button id="btnPerfil" onclick="window.location.href= \'meuPerfil.html\'" class="user-menu-button" >Perfil</button>
    <div class="dropdown">
      <button id="btnTicket" class="user-menu-button">Ticket</button>
      <div class="dropdown-content">
        <a class="btn" href="criarTicket.html">Criar Ticket</a>
        <a class="btn" href="index.html">Mostrar Tickets</a>
      </div>
    </div>
    <button id="btnFaq" onclick="window.location.href= \'faq.html\'" class="user-menu-button" >F.A.Q</button>`;
  }
  const headerString = ` <header> 
  <div class="social-network-logo"> 
    <h1><a href="index.html">Sistema<a></h1> 
  </div> 
  <div class="user-button"> 
    ${htmlBotaoUsuarios} 
    <button onclick="( () => { sessionStorage.removeItem('token'); window.location.href = 'login.html'; })()" class="user-menu-button-red">Sair</button> 
  </div> 
  </header>`;
  return document.createRange().createContextualFragment(headerString);
};



// export const header = async (usuario) => {
//   if(usuario.id == undefined)
//     window.location.href = "login.html";

//   let htmlBotaoUsuarios = '';
//   if(usuario.funcao == 2) {
//     htmlBotaoUsuarios = `<button id="btnUsuarios" onclick="window.location.href= \'usuarios.html\'" class="user-menu-button" >Usuários</button>
//     <button id="btnFaq" onclick="window.location.href= \'faq.html\'" class="user-menu-button" >F.A.Q</button>
//     <button id="btnFaq" onclick="window.location.href= \'hashtags.html\'" class="user-menu-button" >Hashtags</button>
//     <button id="btnFaq" onclick="window.location.href= \'departamentos.html\'" class="user-menu-button" >Departamentos</button>
//     <button id="btnFaq" onclick="window.location.href= \'statusTicket.html\'" class="user-menu-button" >Status de ticket</button>

//     <button id="btnCriarTicket" class="user-menu-button" onclick="window.location.href= \'criarTicket.html\'">Criar ticket</button>`;
//   } else if(usuario.funcao == 1) {
//     htmlBotaoUsuarios = `<button id="btnCriarTicket" class="user-menu-button" >Criar ticket</button>
//     <button id="btnFaq" onclick="window.location.href= \'faq.html\'" class="user-menu-button" >F.A.Q</button>`
//   } else if(usuario.funcao == 0) {
    
//     htmlBotaoUsuarios = `<button id="btnCriarTicket" class="user-menu-button" >Criar ticket</button>
//     <button id="btnFaq" onclick="window.location.href= \'faq.html\'" class="user-menu-button" >F.A.Q</button>`
//   }
//   return `
//     <header>
//       <div class="social-network-logo">
//         <h1><a href="index.html">Sistema<a></h1>  
//       </div>
//       <div class="user-button">
//         <button id="meuPerfil" class="user-menu-button" aria-haspopup="true" aria-expanded="false" >Meu Perfil: ${usuario.nomeUsuario}</button>
//         ${htmlBotaoUsuarios}
//         <button onclick="(() => {
//           sessionStorage.removeItem('token');
//           window.location.href = 'login.html';
//         })()" class="user-menu-button-red" >Log Out</button>
//       </div>
//     </header>
//   `
// }



const usuario_por_token = async (token) => {
    if(token == null) {
        window.location.href = "login.html";
    }

    try {
    const response = await fetch(`/services/usuarios.php?token=${token}`);
    if (!response.ok) {
      throw new Error('Erro na requisição.');
    }
    const data = await response.json();
    return {
      id: data.id,
      nomeUsuario: data.nome_usuario,
      email: data.email,
      primeiroNome: data.primeiro_nome,
      ultimoNome: data.ultimo_nome,
      funcao: data.funcao,
      departamento: data.departamento
    };
  } catch (error) {
    console.error(error);
  }
}

export const usuario = await usuario_por_token(sessionStorage.getItem('token'));

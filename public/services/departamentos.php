<?php 

include_once '../../dao/departamentosDao.php';
include_once '../../dao/usuariosDao.php';

$usuariosDao = new dao\UsuarioDAO();
$data = json_decode(file_get_contents('php://input'), true);
$autenticado = false;
$u = false;
$funcao = 0;

if(isset($data['token'])) 
    $autenticado = true;

if($autenticado != false) {
    $funcao = $usuariosDao->pegar_funcao($data['token']);
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    if($funcao == 2) {
        $data = json_decode(file_get_contents('php://input'), true);
        $departamentosDao->adicionar_departamento($data['nome']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['id'])) {
        echo json_encode($departamentosDao->obter_departamento($_GET['id']), JSON_PRETTY_PRINT);
    } else {
        echo json_encode($departamentosDao->obter_todos_departamentos(), JSON_PRETTY_PRINT);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if($funcao == 2)
        $departamentosDao->atualizar_departamento($data['id'], $data['nome']);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);

    if($funcao == 2)
        $departamentosDao->excluir_departamento($data['id']);
}




// include_once '../dao/departamentosDao.php';
// include_once '../dao/usuariosDao.php';

// // Organize os metodos PUT, GET, POST e DELETE para que sejam acessados via URL

// // PUT vai colocar um novo departamento no banco de dados


// // GET vai retornar todos os departamentos ou um departamento específico



// // POST vai atualizar um departamento existente

// // DELETE vai excluir um departamento existente
// $usuariosDao = new dao\UsuarioDAO();
// $data = json_decode(file_get_contents('php://input'), true);
// $autenticado = false;
// $u = false;
// $funcao = 0;
// if(isset($data['token'])) 
//     $autenticado = true;

// if($autenticado != false) {
//     $funcao = $usuariosDao->pegar_funcao($data['token']);
// }

// switch ($_SERVER['REQUEST_METHOD']) {
//     case 'PUT':

//         if($funcao == 2) {
//             $data = json_decode(file_get_contents('php://input'), true);
//             $departamentosDao->adicionar_departamento($data['nome']);
//         }

//         break;
//     case 'GET':
//         if (isset($_GET['id'])) {
//             echo json_encode($departamentosDao->obter_departamento($_GET['id']), JSON_PRETTY_PRINT);
//         } else {
//             echo json_encode($departamentosDao->obter_todos_departamentos(), JSON_PRETTY_PRINT);
//         }
//         break;
//     case 'POST':
//         $data = json_decode(file_get_contents('php://input'), true);

//         if($funcao == 2)
//             $departamentosDao->atualizar_departamento($data['id'], $data['nome']);

//         break;
//     case 'DELETE':
//         $data = json_decode(file_get_contents('php://input'), true);

//         if($funcao == 2)
//             $departamentosDao->excluir_departamento($data['id']);
            
//         break;
//     default:
//         break;
// }




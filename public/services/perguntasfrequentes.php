<?php
require_once '../../dao/perguntasfrequentesDao.php';
require_once '../../dao/usuariosDao.php';
require_once '../../dao/usuariosDao.php';
$usuariosDao = new dao\UsuarioDAO();
$data = json_decode(file_get_contents('php://input'), true);
$autenticado = false;
$u = false;
$funcao = 0;

if(isset($data['token'])) {
    $autenticado = true;
}

if($autenticado != false) {
    $funcao = $usuariosDao->pegar_funcao($data['token']);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if(!isset($data['pergunta']) || empty(trim($data['pergunta']))) {
            echo json_encode(array('error' => 'Pergunta não pode ser vazia'));
            break;
        }
        if($funcao > 0) {
            $perguntasfrequentesDao->insertPerguntaFrequente($data['pergunta']);
        } else {
            echo json_encode(array('error' => 'Usuário não autorizado'));
        }
        break;
    case 'GET':
        if (isset($_GET['id_pergunta'])) {
            echo json_encode($perguntasfrequentesDao->getPerguntaFrequenteById($_GET['id_pergunta']), JSON_PRETTY_PRINT);
        } else {
            echo json_encode($perguntasfrequentesDao->getAllPerguntasFrequentes(), JSON_PRETTY_PRINT);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if(!isset($data['id_pergunta']) || !isset($data['pergunta']) || empty(trim($data['pergunta']))) {
            echo json_encode(array('error' => 'ID ou pergunta não definidos ou pergunta vazia'));
            break;
        }
        if($funcao > 0) {
            $perguntasfrequentesDao->updatePerguntaFrequente($data['id_pergunta'], $data['pergunta']);
        } else {
            echo json_encode(array('error' => 'Usuário não autorizado'));
        }
        break;
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        if(!isset($data['id_pergunta']) || empty(trim($data['id_pergunta']))) {
            echo json_encode(array('error' => 'ID da pergunta não definido ou vazio'));
            break;
        }
        if($funcao  > 0) {
            $perguntasfrequentesDao->deletePerguntaFrequente($data['id_pergunta']);
        } else {
            echo json_encode(array('error' => 'Usuário não autorizado'));
        }
        break;
    default:
        echo json_encode(array('error' => 'Método HTTP inválido'));
        break;
}



// require_once '../dao/perguntasfrequentesDao.php';
// require_once '../dao/usuariosDao.php';
// require_once '../dao/usuariosDao.php';
// $usuariosDao = new dao\UsuarioDAO();
// $data = json_decode(file_get_contents('php://input'), true);
// $autenticado = false;
// $u = false;
// $funcao = 0;

// if(isset($data['token'])) {
//     $autenticado = true;
// }

// if($autenticado != false) {
//     $funcao = $usuariosDao->pegar_funcao($data['token']);
// }

// switch ($_SERVER['REQUEST_METHOD']) {
//     case 'PUT':
//         $data = json_decode(file_get_contents('php://input'), true);
//         if(!isset($data['pergunta']) || trim($data['pergunta']) == '') {
//             echo json_encode(array('error' => 'Pergunta não pode ser vazia'));
//             break;
//         }
//         if($funcao > 0) {
//             $perguntasfrequentesDao->insertPerguntaFrequente($data['pergunta']);
//         } else {
//             echo json_encode(array('error' => 'Usuário não autorizado'));
//         }
//         break;
//     case 'GET':
//         if (isset($_GET['id_pergunta'])) {
//             echo json_encode($perguntasfrequentesDao->getPerguntaFrequenteById($_GET['id_pergunta']), JSON_PRETTY_PRINT);
//         } else {
//             echo json_encode($perguntasfrequentesDao->getAllPerguntasFrequentes(), JSON_PRETTY_PRINT);
//         }
//         break;
//     case 'POST':
//         $data = json_decode(file_get_contents('php://input'), true);
//         if(!isset($data['id_pergunta']) || !isset($data['pergunta'])) {
//             echo json_encode(array('error' => 'ID ou pergunta não definidos'));
//             break;
//         }
//         if($funcao > 0) {
//             $perguntasfrequentesDao->updatePerguntaFrequente($data['id_pergunta'], $data['pergunta']);
//         } else {
//             echo json_encode(array('error' => 'Usuário não autorizado'));
//         }
//         break;
//     case 'DELETE':
//         $data = json_decode(file_get_contents('php://input'), true);
//         if(!isset($data['id_pergunta'])) {
//             echo json_encode(array('error' => 'ID da pergunta não definido'));
//             break;
//         }
//         if($funcao  > 0) {
//             $perguntasfrequentesDao->deletePerguntaFrequente($data['id_pergunta']);
//         } else {
//             echo json_encode(array('error' => 'Usuário não autorizado'));
//         }
//         break;
//     default:
//         echo json_encode(array('error' => 'Método HTTP inválido'));
//         break;
// }






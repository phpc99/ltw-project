<?php 
require_once '../../dao/perguntasfrequentesDao.php';
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
        if(!isset($data['id_pergunta']) || !isset($data['resposta']) || empty(trim($data['id_pergunta'])) || empty(trim($data['resposta']))) {
            echo json_encode(array('error' => 'ID ou resposta não definidos ou vazios'));
            break;
        }
        $perguntasfrequentesDao->criarRespostaPerguntaFrequente($data['id_pergunta'], $data['resposta']);
        break;
    case 'GET':
        if (isset($_GET['id_pergunta'])) {
            echo json_encode($perguntasfrequentesDao->getRespostaPerguntaFrequente($_GET['id_pergunta']), JSON_PRETTY_PRINT);
        } 
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if(!isset($data['id_pergunta']) || !isset($data['resposta']) || empty(trim($data['id_pergunta'])) || empty(trim($data['resposta']))) {
            echo json_encode(array('error' => 'ID ou resposta não definidos ou vazios'));
            break;
        }
        if($funcao > 0) {
            $perguntasfrequentesDao->atualizarRespostaPerguntaFrequente($data['id_pergunta'], $data['resposta']);
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
        if($funcao > 0) {
            $perguntasfrequentesDao->deletarRespostaPerguntaFrequenteIdPergunta($data['id_pergunta']);
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
//         $data = json_decode(file_get_contents('php://input'), true);
//         $perguntasfrequentesDao->criarRespostaPerguntaFrequente($data['id_pergunta'], $data['resposta']);
//         break;
//     case 'GET':
//         if (isset($_GET['id_pergunta'])) {
//             echo json_encode($perguntasfrequentesDao->getRespostaPerguntaFrequente($_GET['id_pergunta']), JSON_PRETTY_PRINT);
//         } 
//         break;
//     case 'POST':
//         $data = json_decode(file_get_contents('php://input'), true);
//         // var_dump($data);
//         if($funcao > 0)
//             $perguntasfrequentesDao->atualizarRespostaPerguntaFrequente($data['id_pergunta'], $data['resposta']);
//         break;
//     case 'DELETE':
//         $data = json_decode(file_get_contents('php://input'), true);
//         if($funcao > 0)
//             $perguntasfrequentesDao->deletarRespostaPerguntaFrequenteIdPergunta($data['id_pergunta']);
//         break;
//     default:
//         break;
// }





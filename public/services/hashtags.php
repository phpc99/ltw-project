<?php

include_once '../../dao/hashtagsDao.php';
include_once '../../dao/usuariosDao.php';


$hashtagsDao = new dao\HashtagsDao();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!empty(trim($data['nome']))) {
            if (isset($data['token'])) {
                $token = $data['token'];
                $funcao = $usuariosDao->pegar_funcao($token);

                if ($funcao == 2) {
                    $hashtagsDao->adicionarHashtag($data['nome']);
                }
            }
        }
        break;
    case 'GET':
        if (isset($_GET['id'])) {
            if (!empty(trim($_GET['id']))) {
                echo json_encode($hashtagsDao->obterHashtag($_GET['id']));
            }
        } else {
            echo json_encode($hashtagsDao->obterHashtags());
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!empty(trim($data['id'])) && !empty(trim($data['nome']))) {
            if (isset($data['token'])) {
                $token = $data['token'];
                $funcao = $usuariosDao->pegar_funcao($token);

                if ($funcao == 2)
                    $hashtagsDao->atualizarHashtag($data['id'], $data['nome']);
            }
        }
        break;
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!empty(trim($data['id']))) {
            if (isset($data['token'])) {
                $token = $data['token'];
                $funcao = $usuariosDao->pegar_funcao($token);
                if ($funcao == 2)
                    $hashtagsDao->deletarHashtag($data['id']);
            }
        }
        break;
    default:
        break;
}






// 
// include_once '../dao/hashtagsDao.php';

// // organize os metodos put, get, post e delete para que sejam acessados via url

// // put vai colocar uma nova hashtag no banco de dados

// // get vai retornar todas as hashtags ou uma hashtag específica

// // post vai atualizar uma hashtag existente

// // delete vai excluir uma hashtag existente
// $hashtagsDao = new dao\HashtagsDao();

// switch ($_SERVER['REQUEST_METHOD']) {
//     case 'PUT':
//         $data = json_decode(file_get_contents('php://input'), true);
//         $hashtagsDao->adicionarHashtag($data['nome']);
//         break;
//     case 'GET':
//         if (isset($_GET['id'])) {
//             echo json_encode($hashtagsDao->obterHashtag($_GET['id']));
//         } else {
//             echo json_encode($hashtagsDao->obterHashtags());
//         }
//         break;
//     case 'POST':
//         $data = json_decode(file_get_contents('php://input'), true);
//         $hashtagsDao->atualizarHashtag($data['id'], $data['nome']);
//         break;
//     case 'DELETE':
//         $data = json_decode(file_get_contents('php://input'), true);
//         $hashtagsDao->deletarHashtag($data['id']);
//         break;
//     default:
//         break;
// }

<?php

include_once '../../dao/statusTickets.php';
include_once '../../dao/usuariosDao.php';

$statusTicketDao = new dao\StatusTicketDao();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!empty(trim($data['nome']))) {
            if (isset($data['token'])) {
                $token = $data['token'];
                $funcao = $usuariosDao->pegar_funcao($token);

                if ($funcao == 2) {
                    $statusTicketDao->adicionar_status($data['nome']);
                }
            }
        }
        break;
    case 'GET':
        if (isset($_GET['id'])) {
            if (!empty(trim($_GET['id']))) {
                echo json_encode($statusTicketDao->buscar_status_por_id($_GET['id']));
            }
        } else {
            echo json_encode($statusTicketDao->buscar_todos_os_status());
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!empty(trim($data['id'])) && !empty(trim($data['nome']))) {
            if (isset($data['token'])) {
                $token = $data['token'];
                $funcao = $usuariosDao->pegar_funcao($token);

                if ($funcao == 2)
                    $statusTicketDao->atualizar_status($data['id'], $data['nome']);
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
                    $statusTicketDao->deletar_status($data['id']);
            }
        }
        break;
    default:
        break;
}

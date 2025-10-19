<?php

include_once '../../dao/ticketsDao.php';
include_once '../../dao/usuariosDao.php';
// Verificar se o usuario está autenticado
// Ele vai sempre enviar o token no header
// Se o token estiver no banco de dados, então o usuario está autenticado
// Se o token não estiver no banco de dados, então o usuario não está autenticado e não pode acessar o sistema
header('Content-Type: application/json');

use dao\TicketsHashtagsDao;

$t_hashtags = new TicketsHashtagsDao();
$token;
$data = json_decode(file_get_contents('php://input'), true);
if(!isset($_GET['token']) && !isset($data['token'])) {
    echo json_encode(array('error' => 'Você não está autenticado'), JSON_PRETTY_PRINT);
    die();
} else {
    
    $token = isset($_GET['token']) ? $_GET['token'] : $data['token'];


    if($usuariosDao->buscar_usuario_por_token($token) === false) {
        echo json_encode(array('error' => 'Você não está autenticado'), JSON_PRETTY_PRINT);
        die();
    } else {
        $função = $usuariosDao->pegar_funcao($token);

    }
}

switch($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if(isset($data['faq_id'])) {
            $usuario = $usuariosDao->retornar_usuario_por_token($data['token']);
            if($usuario['funcao'] > 0) {
                if($usuario) {
                    $id_ticket = $data['ticket_id'];
                    $faq_id = $data['faq_id'];
                    $responsavel = $usuario['id'];
                    if(isset($id_ticket) && isset($faq_id) && isset($responsavel))
                        $ticketsDao->criarRespostaFaq($id_ticket, $faq_id, $responsavel);
                    else
                        echo json_encode(array('error' => 'Você não está autenticado'), JSON_PRETTY_PRINT);
                }

                break;
            } else {
                echo json_encode(array('error' => 'Você não tem permissão!'), JSON_PRETTY_PRINT);
                break;
            }


            echo json_encode(array('success' => 'Resposta criada com sucesso'), JSON_PRETTY_PRINT);
            
            break;
        }
    
        if(isset($data['resposta'])) {
            $usuario = $usuariosDao->retornar_usuario_por_token($data['token']);


            $ticketsDao->criarResposta($data['resposta'], $data['ticket_id'], $usuario['id']);
            echo json_encode(array('success' => 'Resposta criada com sucesso'), JSON_PRETTY_PRINT);
            break;
        }
        $prioridade = 0;
        $ticket_id = $ticketsDao->criarTicket($data['usuario_id'], $data['departamento_id'], $data['assunto'], $data['descricao'], $prioridade);
        $hashtags = $data['hashtags'];

        if($ticket_id !== false) {
            foreach($hashtags as $hashtag) {
                $ticketsDao->relacionarHashtagTicket($ticket_id, $hashtag);
            }
        }


        break;
    case 'GET':
        // busce os tickets por usuario, por status, por departamento, por prioridade
        // buscar todos os tickets por determinada hashtag
        // buscar as hastags de um ticket
        // se nao tiver nenhum parametro, retorna todos os tickets

        $data = json_decode(file_get_contents('php://input'), true);

        if(isset($_GET['token']) && isset($_GET['action']) && isset($_GET['ticket_id'])) {
            if($_GET['action'] == 'respostas') {
                echo json_encode($ticketsDao->buscarRespostasTicket($_GET['ticket_id']), JSON_PRETTY_PRINT);
                break;
            }

        }

        if(isset($_GET['ticket_id']) && isset($_GET['token']) && isset($_GET['historico'])) {
            echo json_encode($ticketsDao->buscarHistoricoTicket($_GET['ticket_id']), JSON_PRETTY_PRINT);
            break;
        }
        // se tá setado agente, status, prioridade, hashtag, então buscarTicketsFiltros
        
        if(isset($_GET['filtros'])) {
            $agente = isset($_GET['agente']) ? $_GET['agente'] : NULL;
            $status = isset($_GET['status']) ? $_GET['status'] : NULL;
            $prioridade = isset($_GET['prioridade']) ? $_GET['prioridade'] : NULL;
            $hashtag = isset($_GET['hashtag']) ? $_GET['hashtag'] : NULL;
            $departamento = isset($_GET['departamento']) ? trim($_GET['departamento']) : NULL;
            // transformar em inteiro agente, status, prioridade
            $agente = intval($agente);
            // $status = intval($status);
            
            $dataCriacao = isset($_GET['dataCriacao']) ? $_GET['dataCriacao'] : NULL;

            $usuario = isset($_GET['token']) ? $usuariosDao->retornar_usuario_por_token($_GET['token']) : null;
            if(!$usuario)
                break;
            // var_dump($status);
            // echo "aqui";
            if($agente < 1) 
                $agente = null;
            
                // var_dump($agente);
            if($status === '' || $status === 0) 
                $status = null;

            

            if($prioridade < 0) 
                $prioridade = null;
            

            if($departamento == '') 
                $departamento = null;

    

            if($hashtag !== null) {
                $h = $t_hashtags->buscarHashtagPorId($hashtag);
            }
            if(isset($h['nome'])) {
                $hashtag = $h['nome'];
            } else {
                $hashtag = null;
            }

            $array = array(
                'agente' => $agente,
                'status' => $status,
                'prioridade' => $prioridade,
                'hashtag' => $hashtag
            );
            // var_dump($prioridade === null);
            // var_dump($ticketsDao->buscarTicketsFiltros($agente, $status, $prioridade, $hashtag, $departamento, $dataCriacao));
            $t = $ticketsDao->buscarTicketsFiltros($agente, $status, $prioridade, $hashtag, $departamento, $dataCriacao, $token, $usuario['funcao']);

            echo json_encode($t, JSON_PRETTY_PRINT);
            break;
        }



        if (isset($_GET['ticket_id'])) {
            echo json_encode($ticketsDao->buscarTicket($_GET['ticket_id']), JSON_PRETTY_PRINT);
        } else if (isset($_GET['token'])) {
            $usuario = $usuariosDao->retornar_usuario_por_token($_GET['token']);
            $r = $ticketsDao->buscarTicketPorUsuario($usuario['id']);
            if($r)
                echo json_encode($r, JSON_PRETTY_PRINT);
            else
                echo json_encode(array(), JSON_PRETTY_PRINT);
        } else if (isset($data['departamento_id'])) {
            echo json_encode($ticketsDao->buscarTicketPorDepartamento($data['departamento_id']), JSON_PRETTY_PRINT);
        } else if (isset($data['status'])) {
            echo json_encode($ticketsDao->buscarTicketPorStatus($data['status']), JSON_PRETTY_PRINT);
        } else if (isset($data['prioridade'])) {
            echo json_encode($ticketsDao->buscarTicketPorPrioridade($data['prioridade']), JSON_PRETTY_PRINT);
        } else if (isset($data['hashtag'])){
            echo json_encode($ticketsDao->buscarTicketsHashtag($data['hashtag']), JSON_PRETTY_PRINT);
        } else {
            echo json_encode($ticketsDao->buscarTodosTickets(), JSON_PRETTY_PRINT);
        }

        break;
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $usuario = $usuariosDao->retornar_usuario_por_token($data['token']);
        $data['usuario_id'] = $usuario['id'];
        $hashtags = $data['hashtags'];

        if(trim($data['descricao']) == '' || trim($data['assunto']) == '') {
            echo json_encode(array('error' => 'Por favor, preencha todos os campos'), JSON_PRETTY_PRINT);
            break;
        }
        if($ticketsDao->atualizarTicket($data['ticket_id'], $data['usuario_id'], 
        $data['departamento'], $data['assunto'], $data['descricao'], 
        $data['status'], $data['prioridade']-1, $data['responsavel']) === false) {
            echo json_encode(array('error' => 'Você não tem permissão para atualizar este ticket'), JSON_PRETTY_PRINT);
        } else {
            $ticketsDao->desrelacionarTodasHashtagsDoTicket($data['ticket_id']);
            
            foreach($hashtags as $hashtag) {
                $ticketsDao->relacionarHashtagTicket($data['ticket_id'], $hashtag);
            }
        }
        break;
    case 'DELETE':
        if($função != 2) {
            echo json_encode(array('error' => 'Você não tem permissão para excluir este ticket'), JSON_PRETTY_PRINT);
            die();
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $ticketsDao->excluirTicket($data['ticket_id']);
        break;
    default:
        break;
}

<?php
// Vamos usar o numero 0 para cliente o numero 1 para agente e o numero 2 para admin
namespace dao;

include_once "departamentosDao.php";
include_once "ticket_hashtagsDao.php";
include_once "usuariosDao.php";

use PDO;
use PDOException;

class TicketsDao {
    // Conexão com o banco de dados
    private $db;
    private $db_file = __DIR__ . "/../bancodedados.db";
    
    public function __construct() {
        try {
            // Cria (ou abre, caso exista) o banco de dados
            $this->db = new PDO("sqlite:$this->db_file");
        } catch (PDOException $e) {
            // Caso ocorra algum erro na conexão com o banco, exibe a mensagem
            die("Erro!: " . $e->getMessage());
        }
    }

    // Função para criar um novo ticket
    public function criarTicket($usuario_id, $departamento_id, $assunto, $descricao, $prioridade) {
        $stmt = $this->db->prepare('INSERT INTO tickets (usuario_id, departamento_id, assunto, descricao, prioridade, status) VALUES (:usuario_id, :departamento_id, :assunto, :descricao, :prioridade, 1)');
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindValue(':departamento_id', $departamento_id, PDO::PARAM_INT);
        $stmt->bindValue(':assunto', $assunto, PDO::PARAM_STR);
        $stmt->bindValue(':descricao', $descricao, PDO::PARAM_STR);
        $stmt->bindValue(':prioridade', $prioridade, PDO::PARAM_INT);
        $result = $stmt->execute();

        if($result !== false)
            return $this->db->lastInsertId();

    }

    // Função para buscar um ticket pelo ID
    public function buscarTicket($id) {
        $stmt = $this->db->prepare('SELECT * FROM tickets WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $result = $stmt->execute();

        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        $ticket['hashtags'] = [];
        // buscar as hashtags do ticket
        $hashtags = $this->buscarHashtagsTicket($ticket['id']);
        // adicionar as hashtags ao array do ticket
        foreach($hashtags as $hashtag) {
            $ticket_hashtag = new TicketsHashtagsDao();
            $h_info = $ticket_hashtag->buscarHashtagPorId($hashtag['hashtag_id']);
            
            if(isset($h_info['nome']))
                $ticket['hashtags'][] = $h_info['nome'];
        }

        if($ticket) {
            $departamentosDao = new DepartamentosDao();
            $departamento = $departamentosDao->obter_departamento($ticket['departamento_id']);
            
            if(is_array($departamento))
                $ticket['departamento'] = $departamento['nome'];
            else 
                $ticket['departamento'] = 'Não atribuido';

           

            $usuariosDao = new UsuarioDAO();
            $usuario = $usuariosDao->buscar_usuario($ticket['usuario_id']);
        
            
            $ticket['usuario_nome'] = (isset($usuario['nome_usuario']))?$usuario['nome_usuario'] : 'Usuario excluido';
            $responsavel = $usuariosDao->buscar_usuario($ticket['responsavel']);
            $ticket['responsavel_nome'] = (isset($responsavel['nome_usuario'])) ?$responsavel['nome_usuario'] : 'Não atribuido';

        }

        // adicionar o departamento ao array do ticket

        return $ticket; 

        // $result !== false ? $stmt->fetch(PDO::FETCH_ASSOC) : null;

       
    }

    // Buscar funcao Usuario
    public function buscarFuncaoUsuario($id_usuario) {
        $stmt = $this->db->prepare('SELECT funcao FROM usuarios WHERE id = :id_usuario');
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
    }
    // Função para atualizar um ticket
    public function atualizarTicket($id, $usuario_id, $departamento_id, $assunto, $descricao, $status, $prioridade, $responsavel_id) {
        // Somente agents e admin podem atualizar tickets.
        $funcao = $this->buscarFuncaoUsuario($usuario_id);
        // buscar as informaçoes antigas do ticket
        $ticket_antigo = $this->buscarTicket($id);

        
        // Verificar se o usuário é agent ou admin.
        if ($funcao['funcao'] != 0) {
            $stmt = $this->db->prepare(
                'UPDATE tickets 
                SET departamento_id = :departamento_id, 
                assunto = :assunto, 
                descricao = :descricao, 
                status = :status, 
                prioridade = :prioridade, 
                responsavel = :responsavel_id 
                WHERE id = :id'
            );

            
            
            
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':departamento_id', $departamento_id, PDO::PARAM_INT);
            $stmt->bindValue(':assunto', $assunto, PDO::PARAM_STR);
            $stmt->bindValue(':descricao', $descricao, PDO::PARAM_STR);
            $stmt->bindValue(':status', $status, PDO::PARAM_INT);
            $stmt->bindValue(':prioridade', $prioridade, PDO::PARAM_INT);
            $stmt->bindValue(':responsavel_id', $responsavel_id, PDO::PARAM_INT);
            $result = $stmt->execute();


            if ($result !== false) {
                
                if($ticket_antigo['departamento_id'] != $departamento_id) {
                    $this->inserirHistoricoTickets($id, $usuario_id, 'departamento', $ticket_antigo['departamento_id'], $departamento_id);
                } 
                if($ticket_antigo['assunto'] != $assunto) {
                    $this->inserirHistoricoTickets($id, $usuario_id, 'assunto', $ticket_antigo['assunto'], $assunto);

                }
                if($ticket_antigo['descricao'] != $descricao) {
                    $this->inserirHistoricoTickets($id, $usuario_id, 'descricao', $ticket_antigo['descricao'], $descricao);
                }
                if($ticket_antigo['status'] != $status) {
                    $this->inserirHistoricoTickets($id, $usuario_id, 'status', $ticket_antigo['status'], $status);
                }
                if($ticket_antigo['prioridade'] != $prioridade) {
                    $this->inserirHistoricoTickets($id, $usuario_id, 'prioridade', $ticket_antigo['prioridade'], $prioridade);
                }
                if($ticket_antigo['responsavel'] != $responsavel_id) {
                    $this->inserirHistoricoTickets($id, $usuario_id, 'responsavel', $ticket_antigo['responsavel'], $responsavel_id);
                    $u = new UsuarioDAO();
                    $usuario = $u->buscar_usuario($responsavel_id);
                    if(isset($usuario['departamento'])) {
                        
                        $sql = $this->db->prepare(
                            'UPDATE tickets 
                            SET departamento_id = :departamento_id
                            WHERE id = :id'
                        );
                        $sql->bindValue(':id', $id, PDO::PARAM_INT);
                        $sql->bindValue(':departamento_id', $usuario['departamento'], PDO::PARAM_INT);
                        $sql->execute();

                    }

                    if($status != 2)
                        $this->atribuirTicket($id);
                    
                        
                }
                
                return true;
            } else {
                $errorInfo = $stmt->errorInfo();
                error_log("Error in atualizarTicket query: " . $errorInfo[2]);
                return false;
            }
        } else {
            return false;
        }
    }

    public function atribuirTicket($id) {
        // var_dump($id);
        $stmt = $this->db->prepare(
            'UPDATE tickets 
            SET 
            status = 3 
            WHERE id = :id'
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false ? true : false;
    }
    

    public function buscarTicketPorUsuario($id_usuario) {
        $stmt = $this->db->prepare('SELECT * FROM tickets WHERE usuario_id = :id_usuario');
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $result = $stmt->execute();
        $result = $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;
        $departamentosDao = new DepartamentosDao();
       
        if(count($result) > 0) {
            $tickets_u = [];
            foreach($result as $t) {
                $t = $this->buscarTicket($t['id']);
                $d = $departamentosDao->obter_departamento($t['departamento_id']);

                $tickets = array(
                    'id' => $t['id'],
                    'assunto' => $t['assunto'],
                    'criado_em' => $t['criado_em'],
                    'departamento_id' => $t['departamento_id'],
                    'usuario_id' => $t['usuario_id'],
                    'responsavel' => $t['responsavel'],
                    'status' => $t['status'],
                    'prioridade' => $t['prioridade'],
                    'hashtags' => $t['hashtags'],
                    'descricao' => $t['descricao'],
                    'departamento' => isset($d['nome']) ? $d['nome'] : 'Nao atribuido',
                );

                $usuarioDao = new UsuarioDAO();
                $usuario = $usuarioDao->buscar_usuario($tickets['usuario_id']);
                $responsavel = $usuarioDao->buscar_usuario($tickets['responsavel']);

                $tickets['usuario_nome'] = (isset($usuario['nome_usuario'])) ? $usuario['nome_usuario'] : 'Usuario não existe mais';
                $tickets['responsavel_nome'] = (isset($responsavel['nome_usuario'])) ? $responsavel['nome_usuario'] : 'Nao atribuido';

                $tickets_u[] = $tickets;

            }

            return $tickets_u;
        } else {
            return false;
        }
    }

    public function buscarTicketPorDepartamento($id_departamento) {
        $stmt = $this->db->prepare('SELECT * FROM tickets WHERE departamento_id = :id_departamento');
        $stmt->bindValue(':id_departamento', $id_departamento, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;
    }

    // buscar ticket por status
    public function buscarTicketPorStatus($status) {
        $stmt = $this->db->prepare('SELECT * FROM tickets WHERE status = :status');
        $stmt->bindValue(':status', $status, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;
    }

    public function buscarTicketPorPrioridade($prioridade) {
        $stmt = $this->db->prepare('SELECT * FROM tickets WHERE prioridade = :prioridade');
        $stmt->bindValue(':prioridade', $prioridade, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;
    }

    // Função para excluir um ticket
    public function excluirTicket($id) {
        $stmt = $this->db->prepare('DELETE FROM tickets WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false;
    }

    // Função para buscar todos

    // Função para buscar todos os tickets
    public function buscarTodosTickets() {
        $stmt = $this->db->prepare('SELECT * FROM tickets');
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;
    }

    // o banco de dados tem uma tabela respostas_tickets
    // CREATE TABLE respostas_tickets (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     resposta TEXT NOT NULL,
    //     hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    //     id_ticket INTEGER NOT NULL,
    //     responsavel INTEGER NOT NULL,
    //     FOREIGN KEY(id_ticket) REFERENCES tickets(id),
    //     FOREIGN KEY(responsavel) REFERENCES usuarios(id)
    // );
    
    // Função para criar uma nova resposta
    public function criarResposta($resposta, $id_ticket, $responsavel) {
        $stmt = $this->db->prepare('INSERT INTO respostas_tickets (resposta, id_ticket, id_agent) VALUES (:resposta, :id_ticket, :id_agent)');
        
        $stmt->bindValue(':resposta', $resposta, PDO::PARAM_STR);
        $stmt->bindValue(':id_ticket', $id_ticket, PDO::PARAM_INT);
        $stmt->bindValue(':id_agent', $responsavel, PDO::PARAM_INT);

        $result = $stmt->execute();

        return $result !== false;
    }

    public function criarRespostaFaq($id_ticket, $faq_id, $responsavel) {
        $stmt = $this->db->prepare('INSERT INTO respostas_tickets (id_ticket, id_agent, faq) VALUES (:id_ticket, :id_agent, :faq_id)');
        $stmt->bindValue(':id_ticket', $id_ticket, PDO::PARAM_INT);
        $stmt->bindValue(':id_agent', $responsavel, PDO::PARAM_INT);
        $stmt->bindValue(':faq_id', $faq_id, PDO::PARAM_INT);

        $result = $stmt->execute();

        return $result !== false;

    }

    // Função para buscar as respostas pelo id_ticket
    public function buscarRespostasTicket($id_ticket) {
        // ordene as repostas por hora
        $stmt = $this->db->prepare('SELECT * FROM respostas_tickets WHERE id_ticket = :id_ticket ORDER BY hora');
        $stmt->bindValue(':id_ticket', $id_ticket, PDO::PARAM_INT);
        $result = $stmt->execute();
    
        // buscar o nome do agent que respondeu
        $respostas = $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;
        $respostas_com_nome = array();
        if($respostas != null) {
            foreach($respostas as $resposta) {
                $usuario = new UsuarioDAO($this->db);
                $nome_agent = $usuario->buscar_usuario($resposta['id_agent']);
                
                
                if(is_array($nome_agent)) {
                    $resposta_com_nome = array_merge($resposta, array('nome_agent' => $nome_agent['nome_usuario']));
                    array_push($respostas_com_nome, $resposta_com_nome);
                }
         
            }
        }


        return $respostas_com_nome;
    }
    

    // Função para buscar todas respostas de um responsavel
    public function buscarRespostasAgent($responsavel) {
        $stmt = $this->db->prepare('SELECT * FROM respostas_tickets WHERE responsavel = :responsavel');
        $stmt->bindValue(':responsavel', $responsavel, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;

    }

    // tem a tabela tickets_hashtags tbm
    // CREATE TABLE ticket_hashtags (
    //     ticket_id INTEGER NOT NULL,
    //     hashtag_id INTEGER NOT NULL,
    //     PRIMARY KEY (ticket_id, hashtag_id),
    //     FOREIGN KEY(ticket_id) REFERENCES tickets(id),
    //     FOREIGN KEY(hashtag_id) REFERENCES hashtags(id)
    // );
    // função para relacionar uma hashtag a um ticket

    public function relacionarHashtagTicket($ticket_id, $hashtag_id) {
        $stmt = $this->db->prepare('INSERT INTO ticket_hashtags (ticket_id, hashtag_id) VALUES (:ticket_id, :hashtag_id)');
        $stmt->bindValue(':ticket_id', $ticket_id, PDO::PARAM_INT);
        $stmt->bindValue(':hashtag_id', $hashtag_id, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false;
    }

    public function desrelacionarTodasHashtagsDoTicket($ticket_id) {
        $stmt = $this->db->prepare('DELETE FROM ticket_hashtags WHERE ticket_id = ?');
        $stmt->bindValue(1, $ticket_id);
        $stmt->execute();
    }

    // função para buscar as hashtags de um ticket

    public function buscarHashtagsTicket($ticket_id) {
        $stmt = $this->db->prepare('SELECT * FROM ticket_hashtags WHERE ticket_id = :ticket_id');
        $stmt->bindValue(':ticket_id', $ticket_id, PDO::PARAM_INT);
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;

    }

    // função para buscar os tickets de uma hashtag
    // usando essa query
    // SELECT t.*
    // FROM tickets t
    // JOIN ticket_hashtags th ON t.id = th.ticket_id
    // JOIN hashtags h ON th.hashtag_id = h.id
    // WHERE h.nome = 'nome_da_hashtag';

    public function buscarTicketsHashtag($nome_hashtag) {
        $stmt = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = :nome_hashtag');
        $stmt->bindValue(':nome_hashtag', $nome_hashtag, PDO::PARAM_STR);
        $result = $stmt->execute();
        return $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : null;

    }
    // Faça em PHP uma função  buscarTicketsFiltros($agente, $status, $prioridade, $hashtag) 
    public function buscarTicketsFiltros($agente, $status, $prioridade, $hashtag, $departamento, $dataCriacao, $token, $funcao) {
        // 1. Caso todas as variáveis sejam nulas
        $array = array(
            'agente' => $agente,
            'status' => $status,
            'prioridade' => $prioridade,
            'hashtag' => $hashtag,
            'departamento' => $departamento,
            'dataCriacao' => $dataCriacao
        );

        // var_dump($array);

        if($agente === null && $status === null && $prioridade === null && $hashtag === null) {
            $sql = $this->db->prepare('SELECT * FROM tickets;');

        }

        // 2. Caso apenas a variável $agente não seja nula:
        else if($agente !== null && $status === null && $prioridade === null && $hashtag === null) {
            $sql = $this->db->prepare('SELECT * FROM tickets WHERE responsavel = :responsavel;');
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);

            
        }
        // 3. Caso apenas a variável $status não seja nula:

        else if($agente === null && $status !== null && $prioridade === null && $hashtag === null) {
            // var_dump($status);
            
            $sql = $this->db->prepare('SELECT * FROM tickets WHERE status = :status;');
            $sql->bindValue(':status', $status, PDO::PARAM_STR);


        }

        // 4. Caso apenas a variável $prioridade não seja nula:
        else if($agente === null && $status === null && $prioridade !== null && $hashtag === null) {

            $sql = $this->db->prepare('SELECT * FROM tickets WHERE prioridade = :prioridade');
            $sql->bindValue(':prioridade', $prioridade, PDO::PARAM_STR);

        }

        // 5. Caso apenas a variável $hashtag não seja nula:
        else if($agente === null && $status === null && $prioridade === null && $hashtag !== null) {
            $sql = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = :nome_hashtag;');
            $sql->bindValue(':nome_hashtag', $hashtag, PDO::PARAM_STR);
        
        }

        // 6. Caso apenas as variáveis $agente e $status não sejam nulas:
        else if($agente !== null && $status !== null && $prioridade === null && $hashtag === null) {
            // SELECT * FROM tickets WHERE responsavel = [agent_id] AND status = [status_value];
            $sql = $this->db->prepare('SELECT * FROM tickets WHERE responsavel = :responsavel AND status = :status;');
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);
            $sql->bindValue(':status', $status, PDO::PARAM_STR);

        }

        // 7. Caso apenas as variáveis $agente e $prioridade não sejam nulas:

        else if($agente !== null && $status === null && $prioridade !== null && $hashtag === null) {
            //     SELECT * FROM tickets WHERE responsavel = [agent_id] AND prioridade = [priority_value];
            $sql = $this->db->prepare('SELECT * FROM tickets WHERE responsavel = :responsavel AND prioridade = :prioridade;');
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);
            $sql->bindValue(':prioridade', $prioridade, PDO::PARAM_STR);

        }
//     8. Caso apenas as variáveis $agente e $hashtag não sejam nulas:

        else if($agente !== null && $status === null && $prioridade === null && $hashtag !== null) {
            //     SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = [hashtag_name] AND t.responsavel = [agent_id];
            
            $sql = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = :nome_hashtag AND t.responsavel = :responsavel;');
            $sql->bindValue(':nome_hashtag', $hashtag, PDO::PARAM_STR);
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);

        }

//     9. Caso apenas as variáveis $status e $prioridade não sejam nulas:

        else if($agente === null && $status !== null && $prioridade !== null && $hashtag === null) {
//     SELECT * FROM tickets WHERE status = [status_value] AND prioridade = [priority_value];
            $sql = $this->db->prepare('SELECT * FROM tickets WHERE status = :status AND prioridade = :prioridade;');
            $sql->bindValue(':status', $status, PDO::PARAM_STR);
            $sql->bindValue(':prioridade', $prioridade, PDO::PARAM_STR);

        }
//     10. Caso apenas as variáveis $status e $hashtag não sejam nulas:
    
        else if($agente === null && $status !== null && $prioridade === null && $hashtag !== null) { 
//     SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = '[hashtag_name]' AND t.status = [status_value];
            $sql = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = :nome_hashtag AND t.status = :status;');
            $sql->bindValue(':nome_hashtag', $hashtag, PDO::PARAM_STR);
            $sql->bindValue(':status', $status, PDO::PARAM_STR);


        }
//     11. Caso apenas as variáveis $prioridade e $hashtag não sejam nulas:
        else if($agente === null && $status === null && $prioridade !== null && $hashtag !== null) {
//     SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = '[hashtag_name]' AND t.prioridade = [priority_value];
            $sql = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id = th.ticket_id JOIN hashtags h ON th.hashtag_id = h.id WHERE h.nome = :nome_hashtag AND t.prioridade = :prioridade;');
            $sql->bindValue(':nome_hashtag', $hashtag, PDO::PARAM_STR);
            $sql->bindValue(':prioridade', $prioridade, PDO::PARAM_STR);

        }
//     12. Caso apenas as variáveis $agente, $status e $prioridade não sejam nulas:
        else if($agente !== null && $status !== null && $prioridade !== null && $hashtag === null) {
//     SELECT * FROM tickets WHERE responsavel = [agent_id] AND status = [status_value] AND prioridade = [priority_value];
            $sql = $this->db->prepare('SELECT * FROM tickets WHERE responsavel = :responsavel AND status = :status AND prioridade = :prioridade;');
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);
            $sql->bindValue(':status', $status, PDO::PARAM_STR);
            $sql->bindValue(':prioridade', $prioridade, PDO::PARAM_STR);

        }
//     13. Caso apenas as variáveis $agente, $status e $hashtag não sejam nulas:
        else if($agente !== null && $status !== null && $prioridade === null && $hashtag !== null) {
//     SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id=th.ticket_id JOIN hashtags h ON th.hashtag_id=h.id WHERE h.nome='[hashtag_name]' AND t.responsavel=[agent_id] AND t.status=[status_value];
            $sql = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id=th.ticket_id JOIN hashtags h ON th.hashtag_id=h.id WHERE h.nome=:nome_hashtag AND t.responsavel=:responsavel AND t.status=:status;');
            $sql->bindValue(':nome_hashtag', $hashtag, PDO::PARAM_STR);
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);
            $sql->bindValue(':status', $status, PDO::PARAM_STR);

        }
//     14. Caso apenas as variáveis $agente, $prioridade e $hashtag não sejam nulas:
        else if($agente !== null && $status === null && $prioridade !== null && $hashtag !== null) {
//     SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id=th.ticket_id JOIN hashtags h ON th.hashtag_id=h.id WHERE h.nome='[hashtag_name]'
            $sql = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id=th.ticket_id JOIN hashtags h ON th.hashtag_id=h.id WHERE h.nome=:nome_hashtag AND t.responsavel=:responsavel AND t.prioridade=:prioridade;');
            $sql->bindValue(':nome_hashtag', $hashtag, PDO::PARAM_STR);
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);
            $sql->bindValue(':prioridade', $prioridade, PDO::PARAM_STR);

        }
//     15. Caso todos os parâmetros (agente, status, prioridade e hashtag) sejam fornecidos:
        else {
//     SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id=th.ticket_id JOIN hashtags h ON th.hashtag_id=h.id WHERE h.nome='[hashtag_name]' AND t.responsavel=[agent_id] AND t.status=[status_value] AND t.prioridade=[priority_value];
            $sql = $this->db->prepare('SELECT t.* FROM tickets t JOIN ticket_hashtags th ON t.id=th.ticket_id JOIN hashtags h ON th.hashtag_id=h.id WHERE h.nome=:nome_hashtag AND t.responsavel=:responsavel AND t.status=:status AND t.prioridade=:prioridade;');
            $sql->bindValue(':nome_hashtag', $hashtag, PDO::PARAM_STR);
            $sql->bindValue(':responsavel', $agente, PDO::PARAM_INT);
            $sql->bindValue(':status', $status, PDO::PARAM_STR);
            $sql->bindValue(':prioridade', $prioridade, PDO::PARAM_STR);

        }

        $result = $sql->execute();

        if ($result) {
            $result = $sql->fetchAll(PDO::FETCH_ASSOC);
        }
        $tickets = array();
        $ids = array();
        $departamentosDao = new DepartamentosDao();
        if (is_array($result)) {
            foreach ($result as $ticket) {
                // verificar se o ticket já foi adicionado anteriormente
                if (in_array($ticket['id'], $ids)) {
                    continue;
                }
                $ids[] = $ticket['id'];

                $t = $this->buscarTicket($ticket['id']);
                ($t);
                $d = $departamentosDao->obter_departamento($t['departamento_id']);
                $ticket_info = array(
                    'id' => $t['id'],
                    'assunto' => $t['assunto'],
                    'criado_em' => $t['criado_em'],
                    'departamento_id' => $t['departamento_id'],
                    'usuario_id' => $t['usuario_id'],
                    'responsavel' => $t['responsavel'],
                    'status' => $t['status'],
                    'prioridade' => $t['prioridade'],
                    'hashtags' => $t['hashtags'],
                    'descricao' => $t['descricao'],
                    'departamento' => isset($d['nome']) ? $d['nome'] : 'Nao atribuido',

                );

                $usuarioDao = new UsuarioDAO();
                $usuario = $usuarioDao->buscar_usuario($ticket_info['usuario_id']);
                $responsavel = $usuarioDao->buscar_usuario($ticket_info['responsavel']);

                $ticket_info['usuario_nome'] = (isset($usuario['nome_usuario'])) ? $usuario['nome_usuario'] : 'Usuario não existe mais';
                $ticket_info['responsavel_nome'] = (isset($responsavel['nome_usuario'])) ? $responsavel['nome_usuario'] : 'Nao atribuido';

                $tickets[] = $ticket_info;
            }
        }

        $tickets_d = array();
        if ($departamento !== null) {
            foreach ($tickets as &$ticket) {
                if ($ticket['departamento_id'] == $departamento) {
                    if ($dataCriacao !== null) {
                        $criadoEm = $ticket['criado_em'];
                        $dataCriadoEm = substr($criadoEm, 0, 10);
                        if ($dataCriadoEm === $dataCriacao) {
                            $tickets_d[] = $ticket;
                        }
                    } else {
                        $tickets_d[] = $ticket;
                    }
                }
            }
        } elseif ($dataCriacao !== null) {
            foreach ($tickets as &$ticket) {
                $criadoEm = $ticket['criado_em'];
                $dataCriadoEm = substr($criadoEm, 0, 10);
                if ($dataCriadoEm === $dataCriacao) {
                    $tickets_d[] = $ticket;
                }
            }
        } else {
            $tickets_d = $tickets;
        }

        if($funcao == 1) {
            $usuario = new UsuarioDAO();
            $usuario = $usuario->retornar_usuario_por_token($token);
            // var_dump($usuario);
            $departamento_u = $usuario['departamento'];
            foreach ($tickets_d as $key => $ticket) {
                $departamento = new DepartamentosDao();
                $departamento = $departamento->obter_departamento($ticket['departamento_id']);
                // var_dump($departamento);
                if ($ticket['departamento'] != $departamento_u && $departamento != false && $ticket['usuario_id'] != $usuario['id']) {
                    // print_r($departamento_u);
                    // var_dump($tickets_d[$key]);
                    unset($tickets_d[$key]);
                }
            }

            $tickets_d = array_values($tickets_d);
        }


        return ($tickets_d);



        // if ($departamento !== null && $dataCriacao !== null) {
        //     $tickets_d = array();
        //     foreach ($tickets as $ticket) {
        //         if ($ticket['departamento_id'] == $departamento) {
        //             $criadoEm = $ticket['criado_em'];
        //             $dataCriadoEm = substr($criadoEm, 0, 10);
        //             if ($dataCriadoEm === $dataCriacao) {
        //                 $tickets_d[] = $ticket;
        //             }
        //         }
        //     }
        //     return ($tickets_d);
        // } elseif ($departamento !== null) {
        //     $tickets_d = array();
        //     foreach ($tickets as $ticket) {
        //         if ($ticket['departamento_id'] == $departamento) {
        //             $tickets_d[] = $ticket;
        //         }
        //     }
        //     return ($tickets_d);
        // } elseif ($dataCriacao !== null) {
        //     $tickets__ = array();
        //     foreach ($tickets as $ticket) {
        //         $criadoEm = $ticket['criado_em'];
        //         $dataCriadoEm = substr($criadoEm, 0, 10);
        //         if ($dataCriadoEm === $dataCriacao) {
        //             $tickets__[] = $ticket;
        //         }
        //     }
        //     return ($tickets__);
        // }

        // return ($tickets);
        
    
    }
    
    public function inserirHistoricoTickets($ticket_id, $usuario_id, $campo, $valor_antigo, $valor_novo) {
        $sql = "INSERT INTO historico_tickets (ticket_id, usuario_id, campo, valor_antigo, valor_novo)
                VALUES (:ticket_id, :usuario_id, :campo, :valor_antigo, :valor_novo)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':ticket_id', $ticket_id);
        $stmt->bindValue(':usuario_id', $usuario_id);
        $stmt->bindValue(':campo', $campo);
        $stmt->bindValue(':valor_antigo', $valor_antigo);
        $stmt->bindValue(':valor_novo', $valor_novo);
        $stmt->execute();

    }

    public function buscarHistoricoTicket($ticket_id) {
        $sql = "SELECT * FROM historico_tickets WHERE ticket_id = :ticket_id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':ticket_id', $ticket_id);
        $results = $stmt->execute();
        

        // $result !== false ? $stmt->fetchAll(PDO::FETCH_ASSOC) : false;
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
     
        
        if($results != false) {
            
            foreach($results as &$result) {

                if($result['campo'] == 'responsavel') {

                    $u = new UsuarioDAO();
    
                    
                    $r_antigo = (isset($result['valor_antigo'])) ? $u->buscar_usuario($result['valor_antigo']) : 'Nao atribuido';
                    $r_novo = (isset($result['valor_novo'])) ? $u->buscar_usuario($result['valor_novo']) : 'Nao atribuido';
    
                    $result['valor_antigo'] = isset($r_antigo['nome_usuario']) ? $r_antigo['nome_usuario'] : 'Nao atribuido';
                    $result['valor_novo'] = isset($r_novo['nome_usuario']) ? $r_novo['nome_usuario'] : 'Nao atribuido';
                    $r[] = $result;
                    
                } else if($result['campo'] == 'departamento') {
                    $d = new DepartamentosDao();
                    
                    $r_antigo = (isset($result['valor_antigo'])) ? $d->obter_departamento($result['valor_antigo']) : 'Nao atribuido';
                    $r_novo = (isset($result['valor_novo'])) ? $d->obter_departamento($result['valor_novo']) : 'Nao atribuido';
    
                    $result['valor_antigo'] = isset($r_antigo['nome']) ? $r_antigo['nome'] : 'Nao atribuido';
                    $result['valor_novo'] = isset($r_novo['nome']) ? $r_novo['nome'] : 'Nao atribuido';
                    $r[] = $result;
                }
            }
        }

        return $results;
       

    }
    
    
    // Função para buscar todos os tickets de um responsavel    
}

$ticketsDao = new TicketsDao();

<?php

namespace dao;

use PDO;
use PDOException;

class TicketsHashtagsDao {
    // Conexão com o banco de dados SQLite
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


    // Função para adicionar um registro na tabela ticket_hashtags
    public function adicionarTicketHashtag($ticket_id, $hashtag_id) {
        $stmt = $this->db->prepare('INSERT INTO ticket_hashtags (ticket_id, hashtag_id) VALUES (:ticket_id, :hashtag_id)');
        $stmt->bindValue(':ticket_id', $ticket_id, PDO::PARAM_INT);
        $stmt->bindValue(':hashtag_id', $hashtag_id, PDO::PARAM_INT);
        $stmt->execute();
    }

    // Função para buscar todas as hashtags associadas a um ticket
    public function buscarTicketHashtags($ticket_id) {
        $stmt = $this->db->prepare('SELECT hashtags.id, hashtags.nome FROM hashtags 
                                    JOIN ticket_hashtags ON hashtags.id = ticket_hashtags.hashtag_id 
                                    WHERE ticket_hashtags.ticket_id = :ticket_id');
        $stmt->bindValue(':ticket_id', $ticket_id, PDO::PARAM_INT);
        $stmt->execute();

        $hashtags = array();
        if ($stmt->execute()) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $hashtags[] = $row;
            }
        }
        

        return $hashtags;
    }

    // Função para remover todas as hashtags associadas a um ticket
    public function removerTicketHashtags($ticket_id) {
        $stmt = $this->db->prepare('DELETE FROM ticket_hashtags WHERE ticket_id = :ticket_id');
        $stmt->bindValue(':ticket_id', $ticket_id, PDO::PARAM_INT);
        $stmt->execute();
    }

    public function buscarHashtagPorId($hashtag_id) {
        $stmt = $this->db->prepare('SELECT * FROM hashtags WHERE id = :hashtag_id');
        $stmt->bindValue(':hashtag_id', $hashtag_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }
}

$t_hashtags = new TicketsHashtagsDao();

?>

<?php

namespace dao;
use PDO;
use PDOException;
class HashtagsDao {
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


    // Função para adicionar uma nova hashtag
    public function adicionarHashtag($nome) {
        $stmt = $this->db->prepare('INSERT INTO hashtags (nome) VALUES (?)');
        $stmt->bindValue(1, $nome);
        $stmt->execute();
    }

    // Função para atualizar o nome de uma hashtag
    public function atualizarHashtag($id, $nome) {
        $stmt = $this->db->prepare('UPDATE hashtags SET nome = ? WHERE id = ?');
        $stmt->bindValue(1, $nome);
        $stmt->bindValue(2, $id);
        $stmt->execute();
    }

    // Função para deletar uma hashtag
    public function deletarHashtag($id) {
        $stmt = $this->db->prepare('DELETE FROM hashtags WHERE id = ?');
        $stmt->bindValue(1, $id);
        $stmt->execute();

        $this->deletarTicketsHashtag($id);
    }

    // deletar todos os tickets relacionados com uma hashtag
    public function deletarTicketsHashtag($id) {
        $stmt = $this->db->prepare('DELETE FROM ticket_hashtags WHERE hashtag_id = ?');
        $stmt->bindValue(1, $id);
        $stmt->execute();
    }



    // Função para obter todas as hashtags
    public function obterHashtags() {
        $stmt = $this->db->prepare('SELECT * FROM hashtags');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Função para obter uma hashtag específica

    public function obterHashtag($id) {
        $stmt = $this->db->prepare('SELECT * FROM hashtags WHERE id = ?');
        $stmt->bindValue(1, $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>

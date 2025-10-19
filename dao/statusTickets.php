<?php

namespace dao;

use PDO;

class StatusTicketDao {
    private $db;
    private $db_file = __DIR__ . "/../bancodedados.db";

    public function __construct() {
        $this->db = new PDO("sqlite:" . $this->db_file);
    }

    public function buscar_status_por_id($id) {
        $query = "SELECT * FROM status_tickets WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($resultados) == 0) {
            return null;
        }

        return $resultados[0];
    }

    public function buscar_todos_os_status() {
        $query = "SELECT * FROM status_tickets";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function adicionar_status($nome) {
        $query = "INSERT INTO status_tickets (nome) VALUES (:nome)";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':nome', $nome, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function atualizar_status($id, $nome) {
        $query = "UPDATE status_tickets SET nome = :nome WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->bindValue(':nome', $nome, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function deletar_status($id) {
        $query = "DELETE FROM status_tickets WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}

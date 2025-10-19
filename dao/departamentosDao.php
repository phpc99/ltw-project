<?php

namespace dao;
use PDO;
use PDOException;

class DepartamentosDao {

    // Conectar ao banco de dados
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


    // Adicionar um novo departamento
    public function adicionar_departamento($nome) {
        $stmt = $this->db->prepare('INSERT INTO departamentos (nome) VALUES (:nome)');
        $stmt->bindValue(':nome', $nome);
        $stmt->execute();
    }

    // Atualizar um departamento existente
    public function atualizar_departamento($id, $nome) {
        $stmt = $this->db->prepare('UPDATE departamentos SET nome = :nome WHERE id = :id');
        $stmt->bindValue(':nome', $nome);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
    }

    // Excluir um departamento
    public function excluir_departamento($id) {
        $stmt = $this->db->prepare('DELETE FROM departamentos WHERE id = :id');
        $stmt->bindValue(':id', $id);
        $stmt->execute();

        // update todos os tickets relacionados ao departamento
        $stmt = $this->db->prepare('UPDATE tickets SET departamento_id = NULL WHERE departamento_id = :id');

    }

    // Obter informações de um departamento específico
    public function obter_departamento($id) {
        $stmt = $this->db->prepare('SELECT * FROM departamentos WHERE id = :id');
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    // Obter uma lista de todos os departamentos
    public function obter_todos_departamentos() {
        $stmt = $this->db->prepare('SELECT * FROM departamentos');
        $stmt->execute();
        return $stmt->fetchAll();
    }


}

$departamentosDao = new DepartamentosDao();
?>

<?php

namespace dao;

use PDO;
use PDOException;

class PerguntasFrequentesDao {
    // Configurações do banco de dados
    private $db_file = __DIR__ . "/../bancodedados.db";
    private $conn;

    public function __construct() {

        try {
            // Cria (ou abre, caso exista) o banco de dados
            $this->conn = new PDO("sqlite:$this->db_file");
        } catch (PDOException $e) {
            // Caso ocorra algum erro na conexão com o banco, exibe a mensagem
            die("Erro!: " . $e->getMessage());
        }
    }

    // Função para inserir uma pergunta frequente na tabela
    public function insertPerguntaFrequente($pergunta) {
        $stmt = $this->conn->prepare("INSERT INTO perguntas_frequentes (pergunta) VALUES (:pergunta)");
        $stmt->bindValue(":pergunta", $pergunta, PDO::PARAM_STR);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    // Função para atualizar uma pergunta frequente na tabela
    public function updatePerguntaFrequente($id, $pergunta) {
        $stmt = $this->conn->prepare("UPDATE perguntas_frequentes SET pergunta = :pergunta WHERE id = :id");
        $stmt->bindValue(":pergunta", $pergunta, PDO::PARAM_STR);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // Função para deletar uma pergunta frequente da tabela
    public function deletePerguntaFrequente($id) {
        $stmt = $this->conn->prepare("DELETE FROM perguntas_frequentes WHERE id = :id");
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // Função para buscar uma pergunta frequente na tabela pelo ID
    public function getPerguntaFrequenteById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM perguntas_frequentes WHERE id = :id");
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        
        // buscar a resposta da pergunta
        $resposta = $this->getRespostaPerguntaFrequente($id);
        return ["pergunta" => $stmt->fetch(PDO::FETCH_ASSOC), "resposta" => $resposta];
    }

    // Função para buscar todas as perguntas frequentes da tabela
    // Função para buscar todas as perguntas frequentes da tabela
    public function getAllPerguntasFrequentes() {
        $stmt = $this->conn->query("SELECT * FROM perguntas_frequentes");
        
        // Verifica se ocorreu um erro na execução da consulta SQL
        if ($stmt === false) {
            $errorInfo = $this->conn->errorInfo();
            throw new \PDOException($errorInfo[2], $errorInfo[1]);
        }

        // buscar todas as respostas das perguntas frequentes
   
        
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $faq = [];
        foreach($result as $row) {
            $resposta = $this->getRespostaPerguntaFrequente($row['id']);
            
            $row['resposta'] = $resposta;
            $r = '';
            if(isset($resposta['resposta'])){
                // var_dump($resposta['resposta']);
                $r = $resposta['resposta'];
            }
            $faq[] = [
                "id_pergunta" => $row['id'],
                "pergunta" => $row['pergunta'],
                "resposta" => $r,
            ];
        }

        return $faq;
    }

    // funcao para adicionar uma resposta a uma pergunta frequente
    // tabela respostas 
    // /0|id|INTEGER|0||1
    // 1|resposta|TEXT|1||0
    // 2|hora|DATETIME|0|CURRENT_TIMESTAMP|0
    // 3|id_pergunta|INTEGER|1||0
    public function criarRespostaPerguntaFrequente($id_pergunta, $resposta) {
        // primeiro delete a ultima resposta da pergunta
        $this->deletarUltimaRespostaPerguntaFrequente($id_pergunta);
        
        $stmt = $this->conn->prepare("INSERT INTO respostas (resposta, id_pergunta) VALUES (:resposta, :id_pergunta)");
        $stmt->bindValue(":resposta", $resposta, PDO::PARAM_STR);
        $stmt->bindValue(":id_pergunta", $id_pergunta, PDO::PARAM_INT);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function deletarUltimaRespostaPerguntaFrequente($id_pergunta) {
        $stmt = $this->conn->prepare("DELETE FROM respostas WHERE id_pergunta = :id_pergunta");
        $stmt->bindValue(":id_pergunta", $id_pergunta, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // funcao para atualizar uma resposta de uma pergunta frequente
    public function atualizarRespostaPerguntaFrequente($id_pergunta, $resposta) {
    // verificar se uma pergunta já tem resposta, se não tiver então crie uma

        $r = $this->getRespostaPerguntaFrequente($id_pergunta);
        if(!$r){
            var_dump($r);
            $this->criarRespostaPerguntaFrequente($id_pergunta, $resposta);
            return;
        }
        $stmt = $this->conn->prepare("UPDATE respostas SET resposta = :resposta WHERE id_pergunta = :id_pergunta");
        $stmt->bindValue(":resposta", $resposta, PDO::PARAM_STR);
        $stmt->bindValue(":id_pergunta", $id_pergunta, PDO::PARAM_INT);
        $stmt->execute();
    
        return $stmt->rowCount();
    }
    

    // funcao para deletar uma resposta de uma pergunta frequente
    public function deletarRespostaPerguntaFrequente($id) {
        $stmt = $this->conn->prepare("DELETE FROM respostas WHERE id = :id");
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
    // deletar resposta atraves do id_pergunta
    public function deletarRespostaPerguntaFrequenteIdPergunta($id_pergunta) {
        $stmt = $this->conn->prepare("DELETE FROM respostas WHERE id_pergunta = :id_pergunta");
        $stmt->bindValue(":id_pergunta", $id_pergunta, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // funcao para buscar uma resposta de uma pergunta frequente
    public function getRespostaPerguntaFrequente($id_pergunta) {
        $stmt = $this->conn->prepare("SELECT * FROM respostas WHERE id_pergunta = :id_pergunta");
        $stmt->bindValue(":id_pergunta", $id_pergunta, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

        
}

$perguntasfrequentesDao = new PerguntasFrequentesDao(); 

?>

<?php


// Estrutura da tabela usuarios
// 0|id|INTEGER|0||1        
// 1|nome_usuario|TEXT|1||0 
// 2|email|TEXT|1||0        
// 3|senha|TEXT|1||0        
// 4|primeiro_nome|TEXT|1||0
// 5|ultimo_nome|TEXT|1||0  
// 6|funcao|INTEGER|1||0    
// 7|token|TEXT|0||0   
namespace dao;
include_once 'departamentosDao.php';
use PDO;
use PDOException;
class UsuarioDAO {
    
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

    public function criar_usuario($nome_usuario, 
    $email, $senha, 
    $primeiro_nome, 
    $ultimo_nome, 
    $funcao) {
        $hash = password_hash($senha, PASSWORD_DEFAULT); // criptografa a senha usando bcrypt
        $stmt = $this->db->prepare('INSERT INTO usuarios (nome_usuario, email, senha, primeiro_nome, ultimo_nome, funcao) VALUES (:nome_usuario, :email, :senha, :primeiro_nome, :ultimo_nome, :funcao)');
        $stmt->bindValue(':nome_usuario', $nome_usuario);
        $stmt->bindValue(':email', $email);
        $stmt->bindValue(':senha', $hash); // armazena apenas o hash da senha
        $stmt->bindValue(':primeiro_nome', $primeiro_nome);
        $stmt->bindValue(':ultimo_nome', $ultimo_nome);
        $stmt->bindValue(':funcao', $funcao);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function fazer_login($nome_usuario, $senha) {
        $stmt = $this->db->prepare('SELECT id, senha FROM usuarios WHERE nome_usuario = :nome_usuario');
        $stmt->bindValue(':nome_usuario', $nome_usuario);
        $stmt->execute();
        $usuario = $stmt->fetch();
        if ($usuario && password_verify($senha, $usuario['senha'])) {
            // a senha digitada está correta, pode fazer o login

            // cria um token aleatório usando a biblioteca bcrypt
            $token = password_hash(rand(0, 999999), PASSWORD_DEFAULT);
            // salva o token no banco de dados
            // query para atualizar o token do usuário
            
            $stmt = $this->db->prepare('UPDATE usuarios SET token = :token WHERE id = :id');
            $stmt->bindValue(':token', $token);
            $stmt->bindValue(':id', $usuario['id']);
            $stmt->execute();
            // retorna um array com as informações do usuario excepto a senha

            $stmt = $this->db->prepare('SELECT id, nome_usuario, email, primeiro_nome, ultimo_nome, funcao, token FROM usuarios WHERE id = :id');
            $stmt->bindValue(':id', $usuario['id']);
            $stmt->execute();

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        
            return $usuario;

        } else {
            // usuário não existe ou senha incorreta
            return false;
        }
    }

    public function buscar_usuario($id) {
        $stmt = $this->db->prepare('SELECT nome_usuario, email, primeiro_nome, ultimo_nome, funcao, departamento  FROM usuarios WHERE id = :id');
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        // var_dump($stmt->fetch(PDO::FETCH_ASSOC));

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function buscar_usuarios_por_funcao($funcao) {
        $stmt = $this->db->prepare('SELECT id, nome_usuario, email, primeiro_nome, ultimo_nome, funcao FROM usuarios WHERE funcao = :funcao');
        $stmt->bindValue(':funcao', $funcao);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function buscar_usuario_por_token($token) {
        $stmt = $this->db->prepare('SELECT id, nome_usuario, email, primeiro_nome, ultimo_nome, funcao FROM usuarios WHERE token = :token');
        $stmt->bindValue(':token', $token);
        $stmt->execute();

        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        // tiver algum resultado então retorna true, caso contrário retorna falso

        if($resultado) {
            return true;
        } else {
            return false;
        }

    }

    public function retornar_usuario_por_token($token) {
        $stmt = $this->db->prepare('SELECT id, nome_usuario, email, primeiro_nome, ultimo_nome, funcao, departamento FROM usuarios WHERE token = :token');
        $stmt->bindValue(':token', $token);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $d = new DepartamentosDao();
        if(isset($result['departamento'])) {
            $departamento = $d->obter_departamento($result['departamento']);
            $result['departamento'] = ($departamento) ? $departamento['nome'] : 'Não atribuido';
        }

        return $result;
    }

    public function atualizar_usuario($id, $nome_usuario, $email, $senha, $primeiro_nome, $ultimo_nome, $funcao) {
        $stmt = $this->db->prepare('UPDATE usuarios SET nome_usuario = :nome_usuario, email = :email, senha = :senha, primeiro_nome = :primeiro_nome, ultimo_nome = :ultimo_nome, funcao = :funcao WHERE id = :id');
        $stmt->bindValue(':nome_usuario', $nome_usuario);
        $stmt->bindValue(':email', $email);
        $stmt->bindValue(':senha', password_hash($senha, PASSWORD_DEFAULT));
        $stmt->bindValue(':primeiro_nome', $primeiro_nome);
        $stmt->bindValue(':ultimo_nome', $ultimo_nome);
        $stmt->bindValue(':funcao', $funcao);
        $stmt->bindValue(':id', $id);
        return $stmt->execute();
    }

    public function atualizar_usuario_sem_senha($id, $nome_usuario, $email, $primeiro_nome, $ultimo_nome, $funcao) {
        $stmt = $this->db->prepare('UPDATE usuarios SET nome_usuario = :nome_usuario, email = :email, primeiro_nome = :primeiro_nome, ultimo_nome = :ultimo_nome, funcao = :funcao WHERE id = :id');
        $stmt->bindValue(':nome_usuario', $nome_usuario);
        $stmt->bindValue(':email', $email);
        $stmt->bindValue(':primeiro_nome', $primeiro_nome);
        $stmt->bindValue(':ultimo_nome', $ultimo_nome);
        $stmt->bindValue(':funcao', $funcao);
        $stmt->bindValue(':id', $id);
        return $stmt->execute();
    }

    public function fazer_logout($nome_usuario) {
        $stmt = $this->db->prepare('UPDATE usuarios SET token = NULL WHERE nome_usuario = :nome_usuario');
        $stmt->bindValue(':nome_usuario', $nome_usuario);
        return $stmt->execute();
    }

    public function deletar_usuario($id) {
        $stmt = $this->db->prepare('DELETE FROM usuarios WHERE id = :id');
        $stmt->bindValue(':id', $id);
        return $stmt->execute();
    }

    public function buscar_todos_usuarios() {
        $stmt = $this->db->prepare('SELECT id, nome_usuario, email, primeiro_nome, ultimo_nome, funcao, departamento FROM usuarios');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach($results as &$result) {
            $d = new DepartamentosDao();
            $u = $this->buscar_usuario($result['id']);
            
            $result['funcao'] = $u['funcao'];

            $departamento = isset($result['departamento']) ? $d->obter_departamento($result['departamento']) : null;
            
            $result['departamento'] = (isset($departamento['nome'])) ? $departamento['nome'] : 'Não atribuido';

        }

        return $results;

    }

    // pegar a função do usuario pelo token

    public function pegar_funcao($token) {
        $stmt = $this->db->prepare('SELECT funcao FROM usuarios WHERE token = :token');
        $stmt->bindValue(':token', $token);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        if(isset($resultado['funcao']))
            return $resultado['funcao'];
        else
            return null;
    }

    public function atribuirDepartamento($id_usuario, $id_departamento) {
        $stmt = $this->db->prepare('UPDATE usuarios SET departamento = :id_departamento WHERE id = :id_usuario');
        $stmt->bindValue(':id_usuario', $id_usuario);
        $stmt->bindValue(':id_departamento', $id_departamento);
        return $stmt->execute();
    }

    public function existeUsuario($nome_usuario) {
        $stmt = $this->db->prepare('SELECT id FROM usuarios WHERE nome_usuario = :nome_usuario');
        $stmt->bindValue(':nome_usuario', $nome_usuario);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        if(isset($resultado['id']))
            return true;
        else
            return false;
    }
}

$usuariosDao = new UsuarioDAO();

?>

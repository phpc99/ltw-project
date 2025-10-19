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

require_once '../../dao/usuariosDao.php';
// as funções precisam criar usuario, fazer login, buscar usuario, atualizar usuairo, logout, deletar_usuario, buscar todos os usuairos

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header('Content-Type: application/json');


$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['token'])) {
    $token = $data['token'];
}

switch ($_SERVER['REQUEST_METHOD']) {
        // criar usuario
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);

        if(isset($data['nome_usuario']) && isset($data['email']) && isset($data['senha']) && isset($data['primeiro_nome']) && isset($data['ultimo_nome'])) {
            
            if($usuariosDao->existeUsuario($data['nome_usuario']) == false) {
                $usuariosDao->criar_usuario(
                    $data['nome_usuario'],
                    $data['email'],
                    $data['senha'],
                    $data['primeiro_nome'],
                    $data['ultimo_nome'],
                    0
                );
                $resultado = $usuariosDao->fazer_login($data['nome_usuario'], $data['senha']);
                echo json_encode($resultado, JSON_PRETTY_PRINT);
            } else {
                echo json_encode(array('mensagem' => 'Nome de usuario já cadastrado!'), JSON_PRETTY_PRINT);
            }
        } else {
            echo json_encode(array('mensagem' => 'Dados incompletos'), JSON_PRETTY_PRINT);
            break;
        }

        break;
        // fazer login
    case 'POST':
        // Fazer tres casos, um para login, outro logout e outro para atualizar usuario
        // caso tenha paramento login entao fazer o login, caso tenha parametro logout entao fazer logout, caso não seja um dos dois, então atualize o usuario
        // login
        $data = json_decode(file_get_contents('php://input'), true);
        // var_dump($data);

        if(isset($data['action'])){
            $action = $data['action'];
            if($action == 'mudarSenha') {
                $u = $usuariosDao->retornar_usuario_por_token($data['token']);
                // var_dump($u);
                if($u) {
                    $login = $usuariosDao->fazer_login($u['nome_usuario'], $data['senha']);
                    if($login) {
                        $id = $u['id'];
                        $nome_usuario = $u['nome_usuario'];
                        $email = $u['email'];
                        $senha = $data['novaSenha'];
                        $primeiro_nome = $u['primeiro_nome'];
                        $ultimo_nome = $u['ultimo_nome'];
                        $funcao = $u['funcao'];

                        $usuariosDao->atualizar_usuario(
                            $id,
                            $nome_usuario,
                            $email,
                            $senha,
                            $primeiro_nome,
                            $ultimo_nome,
                            $funcao
                        );

                        echo json_encode(array('sucesso' => 'Senha atualizada com sucesso!'), JSON_PRETTY_PRINT);
                    } else {
                        
                        echo json_encode(array('erro' => 'Senha atual incorreta!'), JSON_PRETTY_PRINT);
                    }
                }


            }

            break;
        }

        if (isset($data['login'])) {

            $resultado = $usuariosDao->fazer_login($data['nome_usuario'], $data['senha']);

            if ($resultado) {
                echo json_encode($resultado, JSON_PRETTY_PRINT);
            } else {
                echo json_encode(array('erro' => 'Usuário ou senha incorretos'), JSON_PRETTY_PRINT);
            }
        } else if (isset($data['logout'])) {
            $usuariosDao->fazer_logout($data['nome_usuario']);
        } else {
            // verificar se o usuario está autenticado
            $funcaoU = $usuariosDao->pegar_funcao($data['token']);

            if (isset($data['id'])) {
                $id = $data['id'];
            }

            if (isset($data['nome_usuario'])) {
                $nome_usuario = trim($data['nome_usuario']);
            }

            if (isset($data['email'])) {
                $email = trim($data['email']);
            }
            if (isset($data['primeiro_nome'])) {
                $primeiro_nome = trim($data['primeiro_nome']);
            }
            if (isset($data['ultimo_nome'])) {
                $ultimo_nome = trim($data['ultimo_nome']);
            }
            if (isset($data['funcao'])) {
                $funcao = $data['funcao'];
            } else {
                $funcao = $funcaoU;
            }
            if (isset($data['senha']) && !empty(trim($data['senha']))) {
                // echo "senha: " . $data['senha'];
                $senha = $data['senha'];
            } else {
                if ($usuariosDao->buscar_usuario_por_token($token)) {
                    if (!preg_match('/^[A-Za-z0-9_]{1,15}$/', $nome_usuario)) {
                        echo json_encode(array('erro' => 'Nome de usuário inválido'), JSON_PRETTY_PRINT);
                        exit;
                    }
                    // verificar se nome_usuario, email, primeiro nome e ultimo nome é uma string apenas de espaços
                    if (empty(trim($nome_usuario)) || empty(trim($email)) || empty(trim($primeiro_nome)) || empty(trim($ultimo_nome))) {
                        echo json_encode(array('erro' => 'Dados inválidos'), JSON_PRETTY_PRINT);
                        exit;
                    }

                    $usuariosDao->atualizar_usuario_sem_senha($id, $nome_usuario, $email, $primeiro_nome, $ultimo_nome, $funcao);

                    if(isset($data['departamento']) && $funcao == 1) 
                        $usuariosDao->atribuirDepartamento($id, $data['departamento']);
                    
                    echo json_encode(array('sucesso' => 'Usuário atualizado'), JSON_PRETTY_PRINT);
                    break;
                } else {
                    echo json_encode(array('erro' => 'Usuário não autenticado'), JSON_PRETTY_PRINT);
                }
                break;
            }


            if ($funcaoU != 0) {
                // verificar se o nome_usuario tem caracteres fora do patern [A-Za-z0-9_]{1,15}
                if (!preg_match('/^[A-Za-z0-9_]{1,15}$/', $nome_usuario)) {
                    echo json_encode(array('erro' => 'Nome de usuário inválido'), JSON_PRETTY_PRINT);
                    exit;
                }


                if ($usuariosDao->buscar_usuario_por_token($token)) {
                    if (empty(trim($nome_usuario)) || empty(trim($email)) || empty(trim($primeiro_nome)) || empty(trim($ultimo_nome))) {
                        echo json_encode(array('erro' => 'Dados inválidos'), JSON_PRETTY_PRINT);
                        exit;
                    }

                    $usuariosDao->atualizar_usuario(
                        $id,
                        $nome_usuario,
                        $email,
                        $senha,
                        $primeiro_nome,
                        $ultimo_nome,
                        $funcao
                    );
                } else {
                    echo json_encode(array('erro' => 'Usuário não autenticado'), JSON_PRETTY_PRINT);
                }
            } else {

                if ($usuariosDao->buscar_usuario_por_token($token)) {
                    if (empty(trim($nome_usuario)) || empty(trim($email)) || empty(trim($primeiro_nome)) || empty(trim($ultimo_nome))) {
                        echo json_encode(array('erro' => 'Dados inválidos'), JSON_PRETTY_PRINT);
                        exit;
                    }

                    $usuariosDao->atualizar_usuario(
                        $id,
                        $nome_usuario,
                        $email,
                        $senha,
                        $primeiro_nome,
                        $ultimo_nome,
                        0
                    );
                } else {
                    echo json_encode(array('erro' => 'Usuário não autenticado'), JSON_PRETTY_PRINT);
                }
            }
        }

        break;

    case 'GET':
        $data = json_decode(file_get_contents('php://input'), true);


        if (isset($_GET['funcao'])) {
            $funcao = $_GET['funcao'];

            echo json_encode($usuariosDao->buscar_usuarios_por_funcao($funcao), JSON_PRETTY_PRINT);

            die();
        }

        if (isset($data['id'])) {
            echo json_encode($usuariosDao->buscar_usuario($_get['id']), JSON_PRETTY_PRINT);
        } else if (!isset($_GET['token'])) {
            echo json_encode($usuariosDao->buscar_todos_usuarios(), JSON_PRETTY_PRINT);
        } else {
            echo json_encode($usuariosDao->retornar_usuario_por_token($_GET['token']), JSON_PRETTY_PRINT);
        }


        break;

        // deletar usuario
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);


        if (isset($data['token'])) {
            $funcao = $usuariosDao->pegar_funcao($data['token']);

            if ($funcao != 2) {
                echo json_encode(array('erro' => 'Usuário não tem permissão para deletar'), JSON_PRETTY_PRINT);
                exit;
            }
        }


        $usuariosDao->deletar_usuario($data['id']);
        break;
}

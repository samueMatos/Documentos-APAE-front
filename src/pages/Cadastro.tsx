import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
 
interface Permission {
  id: number;
  nome: string;
  descricao: string;
  authority: string;
}
 
interface GrupoUsuario {
  id: number;
  nome: string;
  permissions: Permission[];
}
 
const servicoCadastro = async (data: CadastroData) => {
  return api.post("/user/register", data);
};
 
const Cadastro = (): ReactElement => {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [confSenha, setConfSenha] = useState<string>("");
  const [grupo, setGrupo] = useState<string>("");
  const [grupos, setGrupos] = useState<GrupoUsuario[]>([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState<boolean>(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    api.get("/grupo_usuario/list")
      .then((res: { data: GrupoUsuario[] }) => {
        setGrupos(res.data);
      })
      .catch(() => setGrupos([]))
      .finally(() => setCarregandoGrupos(false));
  }, []);
 
  const handleNomeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNome(event.target.value);
  };
 
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
 
  const handleSenhaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSenha(event.target.value);
  }
 
  const handleConfSenhaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfSenha(event.target.value);
  };
 
  const handleGrupoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGrupo(event.target.value);
  };
 
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
 
    if (senha !== confSenha) {
      alert("As senhas não coincidem!");
      return;
    }
 
    if (!grupo) {
      alert("Selecione um grupo de usuário!");
      return;
    }
 
    const dados = { nome, email, password: senha, groupId: grupo };
    console.log("Enviando para cadastro:", dados);
 
    try {
      await servicoCadastro(dados);
      alert("Cadastrado com sucesso!");
      navigate("/entrar");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar. Verifique os dados ou tente mais tarde.");
    }
  };
 
  return (
    <Container fluid className="vh-100 p-0">
      <Row className="vh-100 p-0 m-0 gap-0">
        <Col md={8} className="d-none d-md-flex vh-100 flex-column justify-content-center align-items-center bg-light p-0">
          <Image src="/img/mapa.png" alt="Mapa do Brasil" className="mapa" />
          <h1 className="fs-1 text-blue">APAE CRICIÚMA</h1>
        </Col>
             <Link
            to="/"
            className="position-absolute top-0 start-0 m-3 d-flex align-items-center justify-content-center bg-primary text-white rounded-pill shadow-sm text-decoration-none"
            style={{ width: '45px', height: '45px' }} 
            title="Voltar para a página inicial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" >
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
            </svg>
          </Link>
          
        <Col md={4} className="d-flex vh-100 flex-column justify-content-center align-items-center bg-blue p-0">
          <Form onSubmit={handleSubmit} className="w-75">
            <div className="logo-wrapper text-center mb-4">
              <Image src="/img/logo.png" alt="Logo da APAE" className="logo" style={{ width: '100px', height: 'auto' }}/>
            </div>
 
            <h2 className="text-center mb-4 text-white">CADASTRO</h2>
 
            <Form.Group className="mb-3" controlId="formNomeCadastro">
              <Form.Label className="text-white">Nome</Form.Label>
              <Form.Control onChange={handleNomeChange} value={nome} type="text" placeholder="Digite seu nome completo" required />
            </Form.Group>
           
            <Form.Group className="mb-3" controlId="formEmailCadastro">
              <Form.Label className="text-white">Email</Form.Label>
              <Form.Control onChange={handleEmailChange} value={email} type="email" placeholder="Digite seu email" required />
            </Form.Group>
 
            <Form.Group className="mb-3" controlId="formGrupoCadastro">
              <Form.Label className="text-white">Grupo de Usuário</Form.Label>
              <Form.Select value={grupo} onChange={handleGrupoChange} required disabled={carregandoGrupos || grupos.length === 0}>
                {carregandoGrupos && <option>Carregando grupos...</option>}
                {!carregandoGrupos && grupos.length === 0 && <option>Nenhum grupo disponível</option>}
                {!carregandoGrupos && grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.nome}</option>
                ))}
              </Form.Select>
            </Form.Group>
 
            <Form.Group className="mb-3" controlId="formPasswordCadastro">
              <Form.Label className="text-white">Senha</Form.Label>
              <Form.Control type="password" onChange={handleSenhaChange} value={senha} placeholder="Digite sua senha" required />
            </Form.Group>
 
            <Form.Group className="mb-3" controlId="formConfirmPasswordCadastro">
              <Form.Label className="text-white">Confirmar Senha</Form.Label>
              <Form.Control type="password" onChange={handleConfSenhaChange} value={confSenha} placeholder="Confirme sua senha" required />
            </Form.Group>
 
            <Button variant="primary" type="submit" className="w-100 btn-white">Criar conta</Button>
            <hr className="text-white"/>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
 
export default Cadastro;
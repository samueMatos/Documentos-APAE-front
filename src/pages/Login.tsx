import { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { Button, CardLink, Col, Container, Form, Image, Row } from "react-bootstrap";
import { Link, } from "react-router-dom";
import { login } from "../services/auth";
import api from "../services/api";
import { useAlert } from "../hooks/useAlert";


interface User {
  email: string,
  password: string
}

interface LoginApiResponse {
  token: string;
  permissions: string[];
}

/**
 * @description Página de login.
 * @author Lucas Ronchi <@lucas0headshot>, Gabrielle & Juan Carlos
 * @since 25/11/2024
 */
const Login = (): ReactElement => {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const { showAlert } = useAlert();

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSenhaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSenha(event.target.value);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userPayload: User = {
      email: email,
      password: senha
    }

    try {
        const response = await api.post<LoginApiResponse>('/user/login', userPayload);
        const { token, permissions } = response.data;
        login(token, permissions);
        showAlert("Logado com sucesso!", "Bem-vindo(a)!", "success");
        
  
        setTimeout(() => {
  
          window.location.href = '/';
        }, 1500); 

    } catch (error) {
        console.error("Falha no login:", error);
        showAlert("Verifique as credenciais e tente novamente.", "Falha no login!", "error");
       
    }
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="vh-100 p-0 m-0 gap-0">
        <Col md={8} className="d-flex vh-100 flex-column justify-content-center align-items-center bg-light p-0">
          <Image src="/img/mapa.png" alt="Mapa do Brasil" className="mapa" />
          <h1 className="fs-1 text-blue">APAE Criciúma</h1>
        </Col>

        <Col md={4} className="d-flex vh-100 flex-column justify-content-center align-items-center bg-blue p-0">
          <Form onSubmit={handleSubmit}>
            <div className="logo-wrapper">
              <Image src="/img/logo.png" alt="Logo da APAE" className="logo text-center" />
            </div>

            <h2 className="text-center mb-4">Entrar</h2>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control onChange={handleEmailChange} value={email} type="email" placeholder="Digite seu email" required/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" onChange={handleSenhaChange} value={senha} placeholder="Digite sua senha" required/>
              <CardLink as={Link} to="/esqueci-senha" className="text-white link-underline-opacity-0">Esqueceu a senha?</CardLink>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 btn-white">Entrar</Button>

            <hr/>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
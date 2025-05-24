import { ReactElement, useState, ChangeEvent, FormEvent } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * @description Página de recuperação de senha.
 * @author Erick da Silva
 * @since 23/05/2025
 */
const EsqueciSenha = (): ReactElement => {
  const [email, setEmail] = useState<string>("");

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.info("Email para recuperação:", email);
    alert("Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.");
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="vh-100 p-0 m-0 gap-0">
        <Col md={8} className="d-none d-md-flex vh-100 flex-column justify-content-center align-items-center bg-light p-0">
          <Image src="/img/mapa.png" alt="Mapa do Brasil" className="mapa" />
          <h1 className="fs-1 text-blue">APAE CRICIÚMA</h1>
        </Col>

        <Col md={4} className="d-flex vh-100 flex-column justify-content-center align-items-center bg-blue p-0">
          <Form onSubmit={handleSubmit} className="w-75">
            <div className="logo-wrapper text-center mb-4">
              <Image src="/img/logo.png" alt="Logo da APAE" className="logo" style={{ width: '100px', height: 'auto' }} />
            </div>

            <h2 className="text-center mb-4 text-white">RECUPERAR SENHA</h2>

            <Form.Group className="mb-3" controlId="formEmailRecuperacao">
              <Form.Label className="text-white">Email</Form.Label>
              <Form.Control
                onChange={handleEmailChange}
                type="email"
                value={email}
                placeholder="Digite seu email cadastrado"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 btn-white mb-3">
              Enviar link de recuperação
            </Button>

            <div className="text-center">
              <Link to="/entrar" className="text-white link-underline-opacity-0">
                Voltar para o Login
              </Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default EsqueciSenha;
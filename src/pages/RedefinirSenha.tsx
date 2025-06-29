import { ReactElement, useState, ChangeEvent, FormEvent } from "react";
import { Button, Col, Container, Form, Image, Row, Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

/**
 * @description Página para redefinir a senha com o código de recuperação.
 * @author Seu Nome
 * @since 25/06/2025
 */
const RedefinirSenha = (): ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = new URLSearchParams(location.search).get("email") || "";

  const [email, setEmail] = useState<string>(initialEmail);
  const [codigo, setCodigo] = useState<string>("");
  const [novaSenha, setNovaSenha] = useState<string>("");
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState<string>("");
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'danger' | null, texto: string }>({ tipo: null, texto: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleCodigoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCodigo(event.target.value);
  };

  const handleNovaSenhaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNovaSenha(event.target.value);
  };

  const handleConfirmaNovaSenhaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmaNovaSenha(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensagem({ tipo: null, texto: "" });
    setLoading(true);

    if (novaSenha !== confirmaNovaSenha) {
      setMensagem({ tipo: 'danger', texto: 'As novas senhas não coincidem!' });
      setLoading(false);
      return;
    }

    if (novaSenha.length < 6) {
        setMensagem({ tipo: 'danger', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
        setLoading(false);
        return;
    }

    try {
      await api.post("/user/reset-password", {
        email,
        recoveryCode: codigo,
        newPassword: novaSenha,
      });
      setMensagem({ tipo: 'success', texto: "Senha redefinida com sucesso! Você será redirecionado para o login." });
      
      setTimeout(() => {
        navigate("/entrar");
      }, 3000);
      
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Erro ao redefinir senha. Verifique o email, código ou tente novamente.';
      setMensagem({ tipo: 'danger', texto: errorMsg });
    } finally {
      setLoading(false);
    }
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

            <h2 className="text-center mb-4 text-white">REDEFINIR SENHA</h2>

            {mensagem.texto && <Alert variant={mensagem.tipo!} className="mb-3 text-center">{mensagem.texto}</Alert>}

            <Form.Group className="mb-3" controlId="formEmailRedefinir">
              <Form.Label className="text-white">Email</Form.Label>
              <Form.Control
                onChange={handleEmailChange}
                type="email"
                value={email}
                placeholder="Digite seu email"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCodigoRecuperacao">
              <Form.Label className="text-white">Código de Recuperação</Form.Label>
              <Form.Control
                onChange={handleCodigoChange}
                type="text"
                value={codigo}
                placeholder="Digite o código recebido no email"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNovaSenha">
              <Form.Label className="text-white">Nova Senha</Form.Label>
              <Form.Control
                onChange={handleNovaSenhaChange}
                type="password"
                value={novaSenha}
                placeholder="Digite sua nova senha"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmaNovaSenha">
              <Form.Label className="text-white">Confirmar Nova Senha</Form.Label>
              <Form.Control
                onChange={handleConfirmaNovaSenhaChange}
                type="password"
                value={confirmaNovaSenha}
                placeholder="Confirme sua nova senha"
                required
                disabled={loading}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 btn-white mb-3" disabled={loading}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
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

export default RedefinirSenha;
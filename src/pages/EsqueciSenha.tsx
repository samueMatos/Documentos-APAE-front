import { ReactElement, useState, ChangeEvent, FormEvent } from "react";
import { Button, Col, Container, Form, Image, Row, Alert, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../services/api";

/**
 * @description Página de recuperação de senha.
 * @author Erick da Silva
 * @since 23/05/2025
 */
const EsqueciSenha = (): ReactElement => {
  const [email, setEmail] = useState<string>("");
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'danger' | null, texto: string }>({ tipo: null, texto: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [codigoRecuperacao, setCodigoRecuperacao] = useState<string>("");
  const [novaSenhaModal, setNovaSenhaModal] = useState<string>("");
  const [confirmaNovaSenhaModal, setConfirmaNovaSenhaModal] = useState<string>("");
  const [mensagemModal, setMensagemModal] = useState<{ tipo: 'success' | 'danger' | null, texto: string }>({ tipo: null, texto: "" });
  const [loadingModal, setLoadingModal] = useState<boolean>(false);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setMensagem({ tipo: null, texto: "" });
  };

  const handleSubmitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensagem({ tipo: null, texto: "" });
    setLoading(true);

    try {
      await api.post("/user/forgot-password", { email });
      setMensagem({ tipo: 'success', texto: "Se o email estiver cadastrado, você receberá um código para redefinir sua senha." }); 
    } catch (error: any) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      setMensagem({ tipo: 'success', texto: "Se o email estiver cadastrado, você receberá um código para redefinir sua senha." });
    } finally {
      setLoading(false);
    }
  };

  const handleShowResetModal = () => {
    setCodigoRecuperacao("");
    setNovaSenhaModal("");
    setConfirmaNovaSenhaModal("");
    setMensagemModal({ tipo: null, texto: "" });
    setShowResetModal(true);
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setMensagemModal({ tipo: null, texto: "" });
  };

  const handleSubmitResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensagemModal({ tipo: null, texto: "" });
    setLoadingModal(true);

    if (novaSenhaModal !== confirmaNovaSenhaModal) {
      setMensagemModal({ tipo: 'danger', texto: 'As novas senhas não coincidem!' });
      setLoadingModal(false);
      return;
    }

    if (novaSenhaModal.length < 6) {
        setMensagemModal({ tipo: 'danger', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
        setLoadingModal(false);
        return;
    }

    try {
      await api.post("/user/reset-password", {
        email: email,
        recoveryCode: codigoRecuperacao,
        newPassword: novaSenhaModal,
      });
      setMensagemModal({ tipo: 'success', texto: "Senha redefinida com sucesso!" });
      setTimeout(() => {
        handleCloseResetModal();
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Erro ao redefinir senha. Verifique o código e tente novamente.';
      setMensagemModal({ tipo: 'danger', texto: errorMsg });
    } finally {
      setLoadingModal(false);
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
          <Form onSubmit={handleSubmitEmail} className="w-75">
            <div className="logo-wrapper text-center mb-4">
              <Image src="/img/logo.png" alt="Logo da APAE" className="logo" style={{ width: '100px', height: 'auto' }} />
            </div>

            <h2 className="text-center mb-4 text-white">RECUPERAR SENHA</h2>

            {mensagem.texto && <Alert variant={mensagem.tipo!} className="mb-3 text-center">{mensagem.texto}</Alert>}

            <Form.Group className="mb-3" controlId="formEmailRecuperacao">
              <Form.Label className="text-white">Email</Form.Label>
              <Form.Control
                onChange={handleEmailChange}
                type="email"
                value={email}
                placeholder="Digite seu email cadastrado"
                required
                disabled={loading || showResetModal}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 btn-white mb-3" disabled={loading || showResetModal}>
              {loading ? 'Enviando...' : 'Enviar código de recuperação'}
            </Button>

            <hr className="bg-white" />

            <Button
              variant="outline-light"
              className="w-100 mb-3"
              onClick={handleShowResetModal}
              disabled={loading}
            >
              JÁ RECEBEU O CÓDIGO?
            </Button>


            <div className="text-center">
              <Link to="/entrar" className="text-white link-underline-opacity-0">
                Voltar para o Login
              </Link>
            </div>
          </Form>
        </Col>
      </Row>

      <Modal show={showResetModal} onHide={handleCloseResetModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Redefinir Senha</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitResetPassword}>
          <Modal.Body>
            {mensagemModal.texto && <Alert variant={mensagemModal.tipo!} className="mt-2 mb-3">{mensagemModal.texto}</Alert>}
            
            <Form.Group className="mb-3" controlId="modalEmailRedefinir">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Seu email cadastrado"
                required
                disabled={loadingModal}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="modalCodigoRecuperacao">
              <Form.Label>Código de Recuperação</Form.Label>
              <Form.Control
                type="text"
                value={codigoRecuperacao}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCodigoRecuperacao(e.target.value)}
                placeholder="Digite o código recebido no email"
                required
                disabled={loadingModal}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="modalNovaSenha">
              <Form.Label>Nova Senha</Form.Label>
              <Form.Control
                type="password"
                value={novaSenhaModal}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNovaSenhaModal(e.target.value)}
                placeholder="Digite sua nova senha"
                required
                disabled={loadingModal}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="modalConfirmaNovaSenha">
              <Form.Label>Confirmar Nova Senha</Form.Label>
              <Form.Control
                type="password"
                value={confirmaNovaSenhaModal}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmaNovaSenhaModal(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
                disabled={loadingModal}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseResetModal} disabled={loadingModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loadingModal}>
              {loadingModal ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default EsqueciSenha;
import { ReactElement, useState, FormEvent, ChangeEvent } from "react";
import { Nav, Button, Modal, Form, Alert, Container, Navbar, Offcanvas } from "react-bootstrap";
import { FaBars } from "react-icons/fa";
import { logout, hasAnyPermission } from "../../services/auth";
import api from "../../services/api";
import "../../assets/css/pages/header.css";
import Icone from "../common/Icone";
import { useNavigate } from "react-router-dom";

interface MensagemState {
    tipo: 'success' | 'danger' | null;
    texto: string;
}

const Header = (): ReactElement => {
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [senhaAtual, setSenhaAtual] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [confirmaNovaSenha, setConfirmaNovaSenha] = useState<string>("");
    const [mensagemSenha, setMensagemSenha] = useState<MensagemState>({ tipo: null, texto: "" });
    const [loadingSenha, setLoadingSenha] = useState<boolean>(false);

    const handleSair = () => {
        if (window.confirm("Deseja realmente sair?")) {
            logout();
            window.location.href = '/entrar';
        }
    };

    const handleNavigate = (rota: string) => {
        navigate(rota);
    };

    const handleShowPasswordModal = () => {
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmaNovaSenha("");
        setMensagemSenha({ tipo: null, texto: "" });
        setShowPasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
    };

    const handleChangePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMensagemSenha({ tipo: null, texto: "" });

        if (novaSenha !== confirmaNovaSenha) {
            setMensagemSenha({ tipo: 'danger', texto: 'As novas senhas não coincidem!' });
            return;
        }
        if (!novaSenha || novaSenha.length < 6) {
            setMensagemSenha({ tipo: 'danger', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
            return;
        }
        setLoadingSenha(true);
        try {
            await api.put("/user/change-password", { senhaAtual, novaSenha });
            setMensagemSenha({ tipo: 'success', texto: 'Senha alterada com sucesso!' });
            setTimeout(() => {
                handleClosePasswordModal();
            }, 2000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Erro ao alterar senha.';
            setMensagemSenha({ tipo: 'danger', texto: errorMsg });
        } finally {
            setLoadingSenha(false);
        }
    };


        const QR_CODE_SRC =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADYGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTExLTI1PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmUyY2JkN2ZkLTc4OTMtNDRjMC04Yzk4LTgxOTQ4NWQ2ZWJmODwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5EZXNpZ24gc2VtIG5vbWUgLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94Onht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

        const APK_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=1HUhKSZQwwrQ7UfaVQp3nBolB1Vwb5_OR";


    return (
        <>
            <Navbar expand="md" className="bg-primary">
                <Container>
                    <Navbar.Toggle aria-controls="offcanvasNavbar" className="text-white border-0">
                        <FaBars size={24} />
                    </Navbar.Toggle>
                    <Navbar.Offcanvas id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Navbar.Collapse id="main-navbar-nav">
                              {/* Dropdown de download do app */}
                              <Nav className="me-3">
                                <NavDropdown
                                  title={
                                    <>
                                      <i className="fa-solid fa-mobile-screen-button me-2"></i>
                                      Baixar App
                                    </>
                                  }
                                  id="nav-dropdown-app-download"
                                >
                                  <div className="px-3 py-2 text-center" style={{ maxWidth: 260 }}>
                                    <p className="mb-2">Aponte a câmera para baixar o app:</p>
                                    <img
                                      src={QR_CODE_SRC}
                                      alt="QR Code para download do aplicativo"
                                      style={{ width: 180, height: 180 }}
                                    />
                                    <hr className="my-3" />
                                    <a
                                      href={APK_DOWNLOAD_URL}
                                      download
                                      className="btn btn-primary w-100"
                                    >
                                      Baixar App
                                    </a>
                                  </div>
                                </NavDropdown>
                              </Nav>
                            
                              <Nav className="me-auto">
                                {renderNavItems()}
                              </Nav>
                            </Navbar.Collapse>
                            <Nav className="me-auto">
                                <Nav.Link onClick={() => handleNavigate("/")} className="AMARELO"><Icone nome="home" texto="INÍCIO" /></Nav.Link>
                                
                                {/* 2. APLICAÇÃO DAS PERMISSÕES NOS LINKS */}
                                {hasAnyPermission(['ALUNOS']) && (
                                    <Nav.Link onClick={() => handleNavigate("alunos")} className="AMARELO"><Icone nome="address-book" texto="ALUNOS" /></Nav.Link>
                                )}

                                {hasAnyPermission(['DOCUMENTOS']) && (
                                    <Nav.Link onClick={() => handleNavigate("documentos")} className="AMARELO"><Icone nome="folder-open" texto="DOCUMENTOS" /></Nav.Link>
                                )}

                                
                                {hasAnyPermission(['TIPO_DOCUMENTO']) && (
                                     <Nav.Link onClick={() => handleNavigate("tipo-documento")} className="AMARELO"><Icone nome="file-alt" texto="TIPO DOCUMENTO" /></Nav.Link>
                                )}

                                {hasAnyPermission(['GRUPOS_PERMISSOES']) && (
                                    <Nav.Link onClick={() => handleNavigate("admin/grupos")} className="AMARELO"><Icone nome="users-cog" texto="GRUPO DE USUÁRIO" /></Nav.Link>
                                )}

                                 {hasAnyPermission(['GERENCIAR_USUARIO']) && (
                                    <Nav.Link onClick={() => handleNavigate("cadastro")} className="AMARELO"><Icone nome="user-plus" texto="CADASTRO" /></Nav.Link>
                                )}

                            
                                <Nav.Link onClick={handleShowPasswordModal} className="AMARELO"><Icone nome="key" texto="ALTERAR SENHA" /></Nav.Link>
                                <Nav.Link onClick={handleSair} className="AMARELO"><Icone nome="sign-out" texto="SAIR" /></Nav.Link>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>

        
            <Modal show={showPasswordModal} onHide={handleClosePasswordModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Alterar Senha</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleChangePasswordSubmit}>
                    <Modal.Body>
                        {mensagemSenha.texto && <Alert variant={mensagemSenha.tipo!} className="mt-2 mb-3">{mensagemSenha.texto}</Alert>}
                        <Form.Group className="mb-3" controlId="formSenhaAtualModal">
                            <Form.Label>Senha Atual</Form.Label>
                            <Form.Control type="password" value={senhaAtual} onChange={(e: ChangeEvent<HTMLInputElement>) => setSenhaAtual(e.target.value)} required autoFocus/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formNovaSenhaModal">
                            <Form.Label>Nova Senha</Form.Label>
                            <Form.Control type="password" value={novaSenha} onChange={(e: ChangeEvent<HTMLInputElement>) => setNovaSenha(e.target.value)} required/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formConfirmaNovaSenhaModal">
                            <Form.Label>Confirmar Nova Senha</Form.Label>
                            <Form.Control type="password" value={confirmaNovaSenha} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmaNovaSenha(e.target.value)} required/>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClosePasswordModal} disabled={loadingSenha}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loadingSenha}>
                            {loadingSenha ? 'Alterando...' : 'Confirmar Alteração'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default Header;

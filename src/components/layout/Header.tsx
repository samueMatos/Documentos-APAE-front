// src/components/layout/Header.tsx

import { ReactElement, useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Nav, Button, Modal, Form, Alert, Container, Navbar, Offcanvas, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { logout, hasAnyPermission, getDecodedToken } from "../../services/auth";
import api from "../../services/api";

// --- Interfaces ---
interface MensagemState {
    tipo: 'success' | 'danger' | null;
    texto: string;
}

interface NavLinkItem {
  path: string;
  text: string;
  icon: string;
  permissions: string[];
}

// --- Componente Header Refatorado ---
const Header = (): ReactElement => {
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [senhaAtual, setSenhaAtual] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [confirmaNovaSenha, setConfirmaNovaSenha] = useState<string>("");
    const [mensagemSenha, setMensagemSenha] = useState<MensagemState>({ tipo: null, texto: "" });
    const [loadingSenha, setLoadingSenha] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>("Usuário");

    useEffect(() => {
        const tokenData = getDecodedToken();
        if (tokenData) {
            // Usa o 'nome' se existir no token, senão, usa o 'sub' (email)
            setUserName(tokenData.nome || tokenData.sub);
        }
    }, []);

    // Lista centralizada de links de navegação
    const navLinks: NavLinkItem[] = [
        { path: "/", text: "Início", icon: "fa-solid fa-house", permissions: ["ALUNOS", "DOCUMENTOS", "TIPO_DOCUMENTO", "GRUPOS_PERMISSOES", "GERENCIAR_USUARIO"] },
        { path: "/alunos", text: "Alunos", icon: "fa-solid fa-address-book", permissions: ["ALUNOS"] },
        { path: "/documentos", text: "Documentos", icon: "fa-solid fa-folder-open", permissions: ["DOCUMENTOS"] },
        { path: "/tipo-documento", text: "Tipos de Documento", icon: "fa-solid fa-file-alt", permissions: ["TIPO_DOCUMENTO"] },
        { path: "/admin/grupos", text: "Grupos de Usuários", icon: "fa-solid fa-users-cog", permissions: ["GRUPOS_PERMISSOES"] },
        { path: "/cadastro", text: "Cadastrar Usuário", icon: "fa-solid fa-user-plus", permissions: ["GERENCIAR_USUARIO"] },
    ];
    
    // --- Handlers (sem alterações na lógica) ---
    const handleSair = () => {
        if (window.confirm("Deseja realmente sair?")) {
            logout();
            window.location.href = '/entrar';
        }
    };

    const handleShowPasswordModal = () => {
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmaNovaSenha("");
        setMensagemSenha({ tipo: null, texto: "" });
        setShowPasswordModal(true);
    };

    const handleClosePasswordModal = () => setShowPasswordModal(false);

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
            setTimeout(() => handleClosePasswordModal(), 2000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Erro ao alterar senha.';
            setMensagemSenha({ tipo: 'danger', texto: errorMsg });
        } finally {
            setLoadingSenha(false);
        }
    };

    return (
        <>
            <Navbar expand="lg" bg="primary" variant="dark" className="shadow-sm px-md-3" sticky="top">
                <Container fluid>
                    <LinkContainer to="/">
                        <Navbar.Brand className="d-flex align-items-center">
                            <img
                                src="/img/logo.png"
                                width="35"
                                height="35"
                                className="d-inline-block align-top me-2"
                                alt="Logo da APAE"
                            />
                            <span className="d-none d-sm-inline">Gestão APAE</span>
                        </Navbar.Brand>
                    </LinkContainer>
                    
                    <div className="ms-auto d-flex align-items-center">
                        <NavDropdown
                            title={
                                <>
                                    <i className="fa-solid fa-user-circle fa-lg text-white"></i>
                                    <span className="d-none d-md-inline ms-2 text-white">{userName}</span>
                                </>
                            }
                            id="user-profile-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item onClick={handleShowPasswordModal}>
                                <i className="fa-solid fa-key me-2"></i>Alterar Senha
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleSair} className="text-danger">
                                <i className="fa-solid fa-sign-out me-2"></i>Sair
                            </NavDropdown.Item>
                        </NavDropdown>

                        <Navbar.Toggle aria-controls="offcanvasNavbar" className="ms-2 border-0" />
                    </div>

                    <Navbar.Offcanvas
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        placement="end"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id="offcanvasNavbarLabel">Menu Principal</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                {navLinks.map((link) =>
                                    hasAnyPermission(link.permissions) && (
                                        <LinkContainer to={link.path} key={link.path}>
                                            <Nav.Link className="fs-5 mb-2 d-flex align-items-center">
                                                <i className={`${link.icon} me-3 fa-fw`}></i>{link.text}
                                            </Nav.Link>
                                        </LinkContainer>
                                    )
                                )}
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
            
            {/* Modal de Alteração de Senha (sem alterações) */}
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
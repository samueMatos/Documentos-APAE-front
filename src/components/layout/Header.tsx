import { ReactElement, useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Nav, Button, Modal, Form, Alert, Container, Navbar, NavDropdown, Dropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { logout, hasAnyPermission, getDecodedToken } from "../../services/auth";
import api from "../../services/api";

import ModalGenerico from "../modals/ModalGenerico";

interface MensagemState {
    tipo: 'success' | 'danger' | null;
    texto: string;
}


interface NavLinkItem {
    path?: string; 
    text: string;
    icon: string;
    permissions: string[];
    subItems?: NavLinkItem[];
}


const Header = (): ReactElement => {
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [senhaAtual, setSenhaAtual] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [confirmaNovaSenha, setConfirmaNovaSenha] = useState<string>("");
    const [mensagemSenha, setMensagemSenha] = useState<MensagemState>({ tipo: null, texto: "" });
    const [loadingSenha, setLoadingSenha] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>("Usuário");
    const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

    useEffect(() => {
        const tokenData = getDecodedToken();
        if (tokenData) {
            setUserName(tokenData.nome || tokenData.sub);
        }
    }, []);


    const navLinks: NavLinkItem[] = [
        { path: "/", text: "Início", icon: "fa-solid fa-house", permissions: ["ALUNOS", "DOCUMENTOS", "TIPO_DOCUMENTO", "GRUPOS_PERMISSOES", "GERENCIAR_USUARIO"] },
        { path: "/alunos", text: "Alunos", icon: "fa-solid fa-address-book", permissions: ["ALUNOS"] },
        { 
            text: "Documentos", 
            icon: "fa-solid fa-folder-open", 
            permissions: ["DOCUMENTOS", "TIPO_DOCUMENTO"],
            subItems: [
                {
                    text: "Gerenciar Documentos",
                    icon: "fa-solid fa-folder-open",
                    permissions: ["DOCUMENTOS"],
                    subItems: [
                        { path: "/documentos/alunos", text: "Alunos", icon: "fa-solid fa-user-graduate", permissions: ["DOCUMENTOS"] },
                        { path: "/documentos/colaboradores", text: "Colaboradores", icon: "fa-solid fa-user-tie", permissions: ["DOCUMENTOS"] },
                        { path: "/documentos/instituicao", text: "Instituição", icon: "fa-solid fa-building-columns", permissions: ["DOCUMENTOS"] },
                    ]
                },
                { path: "/tipo-documento", text: "Tipos de Documento", icon: "fa-solid fa-file-alt", permissions: ["TIPO_DOCUMENTO"] },
            ]
        },
        { 
            text: "Administração", 
            icon: "fa-solid fa-shield-halved", 
            permissions: ["GRUPOS_PERMISSOES", "GERENCIAR_USUARIO"],
            subItems: [
                { path: "/usuarios", text: "Gerenciar Usuários", icon: "fas fa-user-cog", permissions: ["GERENCIAR_USUARIO"] },
                { path: "/admin/grupos", text: "Grupos e Permissões", icon: "fa-solid fa-users-cog", permissions: ["GRUPOS_PERMISSOES"] },
            ]
        },
    ];
    
    const handleSairClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logout();
        window.location.href = '/entrar';
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

 
    const renderNavItems = () => navLinks.map((link) => {
        if (!hasAnyPermission(link.permissions)) {
            return null;
        }

      
        if (link.subItems) {
            return (
                <NavDropdown
                    title={<><i className={`${link.icon} me-2`}></i>{link.text}</>}
                    id={`nav-dropdown-${link.text}`}
                    key={link.text}
                >
                    {link.subItems.map(subItem => {
                        if (!hasAnyPermission(subItem.permissions)) {
                            return null;
                        }

                        if (subItem.subItems) {
                            return (
                                <Dropdown drop="end" key={subItem.text}>
                                    <Dropdown.Toggle as="a" className="dropdown-item">
                                        <i className={`${subItem.icon} me-2 fa-fw`}></i>{subItem.text}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {subItem.subItems.map(nestedItem =>
                                            hasAnyPermission(nestedItem.permissions) && (
                                                <LinkContainer to={nestedItem.path!} key={nestedItem.path}>
                                                    <Dropdown.Item>
                                                        <i className={`${nestedItem.icon} me-2 fa-fw`}></i>{nestedItem.text}
                                                    </Dropdown.Item>
                                                </LinkContainer>
                                            )
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            );
                        }

                        return (
                            <LinkContainer to={subItem.path!} key={subItem.path}>
                                <NavDropdown.Item>
                                    <i className={`${subItem.icon} me-2 fa-fw`}></i>{subItem.text}
                                </NavDropdown.Item>
                            </LinkContainer>
                        );
                    })}
                </NavDropdown>
            );
        }


        return (
            <LinkContainer to={link.path!} key={link.path}>
                <Nav.Link>
                    <i className={`${link.icon} me-2`}></i>{link.text}
                </Nav.Link>
            </LinkContainer>
        );
    });

    return (
        <>
            <Navbar expand="lg" bg="primary" variant="dark" className="shadow-sm px-md-3 py-2" sticky="top">
                <Container fluid>
                    <LinkContainer to="/">
                        <Navbar.Brand className="d-flex align-items-center">
                            <img src="/img/logo.png" width="45" height="45" className="d-inline-block align-top me-2" alt="Logo da APAE" />
                            <span className="d-none d-sm-inline">Gestão APAE</span>
                        </Navbar.Brand>
                    </LinkContainer>
                  
                    <Navbar.Toggle aria-controls="main-navbar-nav" />
                    <Navbar.Collapse id="main-navbar-nav">
                        <Nav className="me-auto">
                            {renderNavItems()}
                        </Nav>
                    </Navbar.Collapse>

                
                    <div className="ms-auto d-flex align-items-center">
                        <NavDropdown
                            title={
                                <>
                                    <i className="fa-solid fa-user-circle fa-lg"></i>
                                    <span className="d-none d-md-inline ms-2">{userName}</span>
                                </>
                            }
                            id="user-profile-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item onClick={handleShowPasswordModal}>
                                <i className="fa-solid fa-key me-2"></i>Alterar Senha
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleSairClick} className="text-danger">
                                <i className="fa-solid fa-sign-out me-2"></i>Sair
                            </NavDropdown.Item>
                        </NavDropdown>
                    </div>
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

            <ModalGenerico
                visivel={showLogoutModal}
                titulo="Confirmar Saída"
                mensagem="Deseja realmente sair do sistema?"
                aoConfirmar={confirmLogout}
                aoCancelar={() => setShowLogoutModal(false)}
                textoConfirmar="Sair"
                textoCancelar="Cancelar"
            />
        </>
    );
};

export default Header;
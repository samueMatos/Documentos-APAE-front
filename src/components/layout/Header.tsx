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
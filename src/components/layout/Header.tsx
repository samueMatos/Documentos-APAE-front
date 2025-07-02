import React, { ReactElement, useState, FormEvent, ChangeEvent } from "react"; // Adicionado useState, FormEvent, ChangeEvent
import { Nav, Button, Modal, Form, Alert } from "react-bootstrap"; // Adicionado Button, Modal, Form, Alert
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { FaBars } from "react-icons/fa";
import { logout } from "../../services/auth";
import api from "../../services/api"; // Importar sua instância do Axios
import "../../assets/css/pages/header.css"
import Icone from "../common/Icone";
import { useNavigate } from "react-router-dom";

// Interface para o estado das mensagens (opcional, mas bom para tipagem)
interface MensagemState {
    tipo: 'success' | 'danger' | null;
    texto: string;
}

const Header = (): ReactElement => {
    const navigate = useNavigate();

    // --- INÍCIO: Estados para o Modal de Alterar Senha ---
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [senhaAtual, setSenhaAtual] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [confirmaNovaSenha, setConfirmaNovaSenha] = useState<string>("");
    const [mensagemSenha, setMensagemSenha] = useState<MensagemState>({ tipo: null, texto: "" });
    const [loadingSenha, setLoadingSenha] = useState<boolean>(false);
    // --- FIM: Estados para o Modal de Alterar Senha ---

    const handleSair = () => {
        if (window.confirm("Deseja realmente sair?")) {
            logout();
            // navigate('/entrar'); // Considerar usar navigate para uma experiência mais fluida
            location.reload();
        }
    };

    const handleNavigate = (rota: string) => {
        navigate(rota);
        // Se o offcanvas estiver aberto e você quiser fechá-lo ao navegar,
        // você precisaria de uma referência a ele ou controlar seu estado aqui.
        // Para simplificar, vamos assumir que ele se fecha ou o usuário o fecha.
    };

    // --- INÍCIO: Funções para o Modal de Alterar Senha ---
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
        if (!novaSenha || novaSenha.length < 6) { // Exemplo de validação de tamanho
            setMensagemSenha({ tipo: 'danger', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
            return;
        }
        setLoadingSenha(true);
        try {
            await api.put("/user/change-password", {
                senhaAtual,
                novaSenha,
            });
            setMensagemSenha({ tipo: 'success', texto: 'Senha alterada com sucesso!' });
            // Limpar campos e fechar modal após um tempo
            setTimeout(() => {
                handleClosePasswordModal();
                // Não precisa limpar os estados aqui pois handleShowPasswordModal já faz isso ao reabrir
            }, 2000);
        } catch (error: any) {
            console.error("Erro ao alterar senha:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Erro ao alterar senha. Verifique a senha atual e tente novamente.';
            setMensagemSenha({ tipo: 'danger', texto: errorMsg });
        } finally {
            setLoadingSenha(false);
        }
    };
    // --- FIM: Funções para o Modal de Alterar Senha ---

    return (
        <> {/* Adicionado Fragment para o Modal não interferir no fluxo do Navbar */}
            <Navbar expand="md" className="bg-primary">
                <Container>
                    <Navbar.Toggle
                        aria-controls="offcanvasNavbar"
                        className="text-white border-0"
                    >
                        <FaBars size={24} />
                    </Navbar.Toggle>
                    <Navbar.Offcanvas id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="me-auto">
                                <Nav.Link onClick={() => handleNavigate("alunos")} className="AMARELO"><Icone nome="address-book" texto="ALUNOS" /></Nav.Link>
                                <Nav.Link onClick={() => handleNavigate("documentos")} className="AMARELO"><Icone nome="folder-open" texto="DOCUMENTOS" /></Nav.Link>
                                <Nav.Link onClick={() => handleNavigate("admin/grupos")} className="AMARELO"><Icone nome="folder-open" texto="GRUPO DE USUÁRIO" /></Nav.Link>
                                {/* NOVO LINK/BOTÃO PARA ALTERAR SENHA */}
                                <Nav.Link onClick={handleShowPasswordModal} className="AMARELO"><Icone nome="key" texto="ALTERAR SENHA" /></Nav.Link>
                                {/* Você pode escolher outro ícone como "lock" ou "shield-alt" */}

                                <Nav.Link href="#" onClick={handleSair} className="AMARELO"><Icone nome="sign-out" texto="SAIR" /></Nav.Link>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>

            {/* MODAL DE ALTERAÇÃO DE SENHA */}
            <Modal show={showPasswordModal} onHide={handleClosePasswordModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Alterar Senha</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleChangePasswordSubmit}>
                    <Modal.Body>
                        {mensagemSenha.texto && <Alert variant={mensagemSenha.tipo!} className="mt-2 mb-3">{mensagemSenha.texto}</Alert>}
                        
                        <Form.Group className="mb-3" controlId="formSenhaAtualModal">
                            <Form.Label>Senha Atual</Form.Label>
                            <Form.Control
                                type="password"
                                value={senhaAtual}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSenhaAtual(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formNovaSenhaModal">
                            <Form.Label>Nova Senha</Form.Label>
                            <Form.Control
                                type="password"
                                value={novaSenha}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNovaSenha(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formConfirmaNovaSenhaModal">
                            <Form.Label>Confirmar Nova Senha</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmaNovaSenha}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmaNovaSenha(e.target.value)}
                                required
                            />
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
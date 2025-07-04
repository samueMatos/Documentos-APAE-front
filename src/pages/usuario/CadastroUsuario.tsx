import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Card, Spinner } from "react-bootstrap";
import { useNavigate} from "react-router-dom";
import api from "../../services/api";
import { useAlert } from "../../hooks/useAlert";


interface Permission {
    id: number;
    nome: string;
}

interface GrupoUsuario {
    id: number;
    nome: string;
    permissions: Permission[];
}

interface CadastroData {
    nome: string;
    email: string;
    password: string;
    groupId: string;
}

const Cadastro = (): ReactElement => {
 
    const navigate = useNavigate();
    const { showAlert } = useAlert();

  
    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [confSenha, setConfSenha] = useState<string>("");
    const [grupo, setGrupo] = useState<string>(""); 
    const [grupos, setGrupos] = useState<GrupoUsuario[]>([]);
    const [carregandoGrupos, setCarregandoGrupos] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


    useEffect(() => {
        api.get<GrupoUsuario[]>("/grupo_usuario/list")
            .then(res => setGrupos(res.data || []))
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
    };
    const handleConfSenhaChange = (event: ChangeEvent<HTMLInputElement>) => {
        setConfSenha(event.target.value);
    };
    const handleGrupoChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setGrupo(event.target.value);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (senha !== confSenha) {
            showAlert("As senhas não coincidem!", "Atenção", "warning");
            setIsSubmitting(false);
            return;
        }
        if (!grupo) {
            showAlert("Selecione um grupo de usuário!", "Atenção", "warning");
            setIsSubmitting(false);
            return;
        }

        const payload: CadastroData = {
            nome: nome,
            email: email,
            password: senha,
            groupId: grupo
        };

        try {
            await api.post("/user/register", payload);
            showAlert("O novo usuário foi criado com sucesso.", "Usuário Cadastrado!", "success");
            setTimeout(() => navigate("/entrar"), 1500);
        } catch (error) {
            console.error("Erro no cadastro:", error);
            showAlert("Não foi possível criar o usuário. Verifique se o e-mail já está em uso.", "Falha no Cadastro.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
  
        <Container fluid className="bg-light d-flex align-items-center justify-content-center vh-100">
            <Row className="justify-content-center w-100">
                <Col md={6} lg={5} xl={4}>
                    <Card className="shadow-lg border-0">
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h2 className="mt-3 text-primary">Cadastro de usuário</h2>
                            </div>
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formNomeCadastro">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control onChange={handleNomeChange} value={nome} type="text" placeholder="Seu nome completo" required />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="formEmailCadastro">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control onChange={handleEmailChange} value={email} type="email" placeholder="seu@email.com" required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formGrupoCadastro">
                                    <Form.Label>Grupo de Usuário</Form.Label>
                                    <Form.Select value={grupo} onChange={handleGrupoChange} required disabled={carregandoGrupos}>
                                        <option value="" disabled>Selecione um grupo...</option>
                                        {!carregandoGrupos && grupos.map(g => (
                                            <option key={g.id} value={g.id}>{g.nome}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPasswordCadastro">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control type="password" onChange={handleSenhaChange} value={senha} placeholder="Crie uma senha" required />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formConfirmPasswordCadastro">
                                    <Form.Label>Confirmar Senha</Form.Label>
                                    <Form.Control type="password" onChange={handleConfSenhaChange} value={confSenha} placeholder="Confirme sua senha" required />
                                </Form.Group>
                                
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Confirmar'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Cadastro;
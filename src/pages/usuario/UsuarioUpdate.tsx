import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams} from "react-router-dom";
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


interface UserData {
    id: number;
    nome: string;
    email: string;
    userGroup: {
        id: number;
        nome: string;
    }
}

const UsuarioUpdate = (): ReactElement => {
   
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const { showAlert } = useAlert();

   
    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [confSenha, setConfSenha] = useState<string>("");
    const [grupo, setGrupo] = useState<string>("");
    const [grupos, setGrupos] = useState<GrupoUsuario[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

   
    useEffect(() => {
        
        api.get<UserData>(`/user/${id}`)
            .then(res => {
                const { data } = res;
                setNome(data.nome);
                setEmail(data.email);
                setGrupo(String(data.userGroup.id));
            })
            .catch(err => {
                console.error("Erro ao buscar usuário:", err);
                showAlert("Não foi possível carregar os dados do usuário.", "Erro", "error");
                navigate('/admin/usuarios'); 
            });

      
        api.get<GrupoUsuario[]>("/grupo_usuario/list")
            .then(res => setGrupos(res.data || []))
            .catch(() => setGrupos([]))
            .finally(() => setCarregando(false));
            
    }, [id, navigate, showAlert]);


    const handleNomeChange = (event: ChangeEvent<HTMLInputElement>) => setNome(event.target.value);
    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
    const handleSenhaChange = (event: ChangeEvent<HTMLInputElement>) => setSenha(event.target.value);
    const handleConfSenhaChange = (event: ChangeEvent<HTMLInputElement>) => setConfSenha(event.target.value);
    const handleGrupoChange = (event: ChangeEvent<HTMLSelectElement>) => setGrupo(event.target.value);

  
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

      
        if (senha && senha !== confSenha) {
            showAlert("As senhas não coincidem!", "Atenção", "warning");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            nome,
            email,
            
            password: senha || null, 
            groupId: grupo
        };

        try {
            await api.put(`/user/${id}`, payload); 
            showAlert("Usuário atualizado com sucesso.", "Sucesso!", "success");
            navigate("/admin/usuarios"); 
        } catch (error) {
            console.error("Erro na atualização:", error);
            showAlert("Não foi possível atualizar o usuário.", "Falha na Atualização", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (carregando) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container fluid className="bg-light d-flex align-items-center justify-content-center vh-100">
            <Row className="justify-content-center w-100">
                <Col md={6} lg={5} xl={4}>
                    <Card className="shadow-lg border-0">
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h2 className="mt-3 text-primary">Editar Usuário</h2>
                            </div>
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formNomeUpdate">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control onChange={handleNomeChange} value={nome} type="text" required />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="formEmailUpdate">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control onChange={handleEmailChange} value={email} type="email" required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formGrupoUpdate">
                                    <Form.Label>Grupo de Usuário</Form.Label>
                                    <Form.Select value={grupo} onChange={handleGrupoChange} required>
                                        <option value="" disabled>Selecione um grupo...</option>
                                        {grupos.map(g => (
                                            <option key={g.id} value={g.id}>{g.nome}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPasswordUpdate">
                                    <Form.Label>Nova Senha</Form.Label>
                                    <Form.Control type="password" onChange={handleSenhaChange} value={senha} placeholder="Deixe em branco para não alterar" />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formConfirmPasswordUpdate">
                                    <Form.Label>Confirmar Nova Senha</Form.Label>
                                    <Form.Control type="password" onChange={handleConfSenhaChange} value={confSenha} placeholder="Deixe em branco para não alterar" />
                                </Form.Group>
                                
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Salvar Alterações'}
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

export default UsuarioUpdate;
import { ReactElement, useEffect, useState } from "react";
import { Container, Form, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { TipoDocumentoRequest, TipoDocumentoResponse } from "../../models/TipoDocumento";

const FormTipoDocumento = (): ReactElement => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<TipoDocumentoRequest>({ nome: '', validade: '' });
    const [carregando, setCarregando] = useState<boolean>(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setCarregando(true);
            api.get<TipoDocumentoResponse>(`/tipo-documento/${id}`)
                .then((response: { data: TipoDocumentoResponse }) => {
                    const { nome, validade } = response.data;
                    const dataFormatada = validade ? validade.split('T')[0] : '';
                    setFormData({ nome, validade: dataFormatada || '' });
                })
                .catch((err: any) => {
                    setErro("Erro ao buscar o tipo de documento.");
                    console.error(err);
                })
                .finally(() => setCarregando(false));
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        const payload = {
            nome: formData.nome,
            validade: `${formData.validade}T00:00:00.000Z`
        };

        try {
            if (id) {

                await api.put(`/tipo-documento/${id}`, payload);
                alert("Tipo de documento atualizado com sucesso!");
            } else {

                await api.post('/tipo-documento', payload);
                alert("Tipo de documento criado com sucesso!");
            }
            navigate("/tipo-documento");
        } catch (err: any) {
            setErro(err.response?.data?.message || "Erro ao salvar. Verifique os dados.");
            console.error("Erro ao salvar:", err);
        }
    };

    return (
        <Container>
            <h1 className="my-4">{id ? "Editar" : "Criar Novo"} Tipo de Documento</h1>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <Form onSubmit={handleSubmit}>
                    {erro && <Alert variant="danger">{erro}</Alert>}
                    
                    <Form.Group className="mb-3" controlId="nome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                            placeholder="Digite o nome do tipo de documento"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="validade">
                        <Form.Label>Data de Validade</Form.Label>
                        <Form.Control
                            type="date"
                            name="validade"
                            value={formData.validade}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button variant="primary" type="submit">Salvar</Button>
                        <Button variant="secondary" onClick={() => navigate("/tipo-documento")}>Cancelar</Button>
                    </div>
                </Form>
            )}
        </Container>
    );
};

export default FormTipoDocumento;
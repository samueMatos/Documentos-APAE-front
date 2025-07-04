import { ReactElement, useEffect, useState } from "react";
import { Container, Form, Spinner, Alert, Button, InputGroup, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { TipoDocumentoRequest, TipoDocumentoResponse, UnidadeTempo } from "../../models/TipoDocumento";
import { useAlert } from "../../hooks/useAlert";

// Função para decompor os dias na melhor unidade para exibição
const decomporDias = (totalDeDias: number): { valor: number; unidade: UnidadeTempo } => {
    if (totalDeDias > 0 && totalDeDias % 365 === 0) {
        return { valor: totalDeDias / 365, unidade: 'Anos' };
    }
    if (totalDeDias > 0 && totalDeDias % 30 === 0) {
        return { valor: totalDeDias / 30, unidade: 'Meses' };
    }
    return { valor: totalDeDias, unidade: 'Dias' };
};

// Função para calcular o total de dias com base na unidade
const calcularTotalDias = (valor: number, unidade: UnidadeTempo): number => {
    switch (unidade) {
        case 'Anos':
            return valor * 365;
        case 'Meses':
            return valor * 30;
        case 'Dias':
        default:
            return valor;
    }
};

const FormTipoDocumento = (): ReactElement => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Estado para o formulário
    const [nome, setNome] = useState<string>('');
    const [valorValidade, setValorValidade] = useState<number>(1);
    const [unidadeValidade, setUnidadeValidade] = useState<UnidadeTempo>('Dias');
    
    // Estado de controle
    const [carregando, setCarregando] = useState<boolean>(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
    const fetchData = async () => {
        setCarregando(true);
        try {
            const response = await api.get<TipoDocumentoResponse>(`/tipo-documento/${id}`);
            console.log(response.data);
            const { nome, validade } = response.data;
            const { valor, unidade } = decomporDias(validade);
            setNome(nome);
            setValorValidade(valor);
            setUnidadeValidade(unidade);

        } catch (err) {
            setErro("Erro ao buscar o tipo de documento.");
            console.error(err);
        } finally {
            setCarregando(false);
        }
    };

    if (id) {
        fetchData();
    }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        const { showAlert } = useAlert();
        e.preventDefault();
        setErro(null);

        const totalDias = calcularTotalDias(valorValidade, unidadeValidade);

        const payload: TipoDocumentoRequest = {
            nome: nome,
            validade: totalDias
        };

        try {
            if (id) {
                await api.put(`/tipo-documento/${id}`, payload);
                showAlert("Sucesso!", "Tipo de documento atualizado com sucesso!", "success");
            } else {
                await api.post('/tipo-documento', payload);
                showAlert("Sucesso!", "Tipo de documento criado com sucesso!", "success");
            }
            navigate("/tipo-documento");
        } catch (err: any) {
            setErro(err.response?.data?.message || "Erro ao salvar. Verifique os dados.");
            showAlert("Erro ao Salvar", err.response?.data?.message || "Não foi possível salvar o tipo de documento.", "error");
            console.error("Erro ao salvar:", err);
        }
    };

    return (
        <Container>
            <div className="d-flex align-items-center gap-3 my-4">
              <Button
                variant="light"
                onClick={() => navigate(-1)}
                className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }}
                title="Voltar"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                 </svg>
              </Button>
              <h1 className="m-0">{id ? "Editar" : "Criar Novo"} Tipo de Documento</h1>
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <Form onSubmit={handleSubmit}>
                    {erro && <Alert variant="danger">{erro}</Alert>}
                    
                    <Form.Group as={Col} md="6" className="mb-3" controlId="nome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            name="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            placeholder="Digite o nome do tipo de documento"
                        />
                    </Form.Group>

                    <Form.Group as={Col} md="4" className="mb-4" controlId="validade">
                        <Form.Label>Prazo de Validade</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                value={valorValidade}
                                onChange={(e) => setValorValidade(Number(e.target.value))}
                                min="1"
                                required
                            />
                            <Form.Select
                                value={unidadeValidade}
                                onChange={(e) => setUnidadeValidade(e.target.value as UnidadeTempo)}
                                style={{ maxWidth: "120px" }}
                            >
                                <option value="Dias">Dias</option>
                                <option value="Meses">Meses</option>
                                <option value="Anos">Anos</option>
                            </Form.Select>
                        </InputGroup>
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
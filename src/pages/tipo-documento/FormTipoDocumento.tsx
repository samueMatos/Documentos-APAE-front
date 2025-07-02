import { ReactElement, useEffect, useState } from "react";
import { Container, Form, Spinner, Alert, Button, InputGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { TipoDocumentoRequest, TipoDocumentoResponse, UnidadeTempo } from "../../models/TipoDocumento";
import { AxiosError, AxiosResponse } from "axios";

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
            const response = await api.get<TipoDocumentoResponse>(`/api/tipo-documento/${id}`);
            const { nome, validadeEmDias } = response.data;
            const { valor, unidade } = decomporDias(validadeEmDias);

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
        e.preventDefault();
        setErro(null);

        const totalDias = calcularTotalDias(valorValidade, unidadeValidade);

        const payload: TipoDocumentoRequest = {
            nome: nome,
            validadeEmDias: totalDias
        };

        try {
            if (id) {
                await api.put(`/api/tipo-documento/${id}`, payload);
                alert("Tipo de documento atualizado com sucesso!");
            } else {
                await api.post('/api/tipo-documento', payload);
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
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            placeholder="Digite o nome do tipo de documento"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="validade">
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
import { useEffect, useState, useCallback, ChangeEvent, ReactElement } from "react";
import { Container, Spinner, Table, Alert, Form} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { TipoDocumentoResponse } from "../../models/TipoDocumento";
import formatarDataHora from "../../helpers/formatarDataHora";
import Botao from "../../components/common/Botao";
import Icone from "../../components/common/Icone";
import ModalGenerico from "../../components/modals/ModalGenerico";
import { useAlert } from "../../hooks/useAlert";
import "../../assets/css/pages/aluno.css";

const HomeTipoDocumento = (): ReactElement => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumentoResponse[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);
    const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
    const [modalExcluirVisivel, setModalExcluirVisivel] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await api.get<TipoDocumentoResponse[]>('/tipo-documento');
            setTiposDocumento(resposta.data || []);
        } catch (err) {
            setErro("Erro ao buscar os tipos de documento. Tente novamente mais tarde.");
            console.error("Erro ao buscar tipos de documento:", err);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        buscarDados();
    }, [buscarDados]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSelecionar = (e: ChangeEvent<HTMLInputElement>) => {
        const id = Number(e.target.value);
        setSelecionadoId(prevId => prevId === id ? null : id);
    };

    const handleLimparSelecao = () => {
        setSelecionadoId(null);
    };

    const handleEditar = () => {
        if (selecionadoId) {
            navigate(`/tipo-documento/editar/${selecionadoId}`);
        }
    };
    
    const handleExcluir = () => {
        if (selecionadoId) {
            setModalExcluirVisivel(true);
        }
    };

    const confirmarExclusao = async () => {
        if (!selecionadoId) return;
        try {
            await api.delete(`/tipo-documento/${selecionadoId}`);
            showAlert("O tipo de documento foi excluído com sucesso.", "Excluído!", "success");
            setSelecionadoId(null);
            buscarDados();
        } catch (err) {
            showAlert("Não foi possível excluir. Verifique se este tipo de documento não está em uso.", "Erro ao Excluir", "error");
            console.error("Erro ao excluir:", err);
        } finally {
            setModalExcluirVisivel(false);
        }
    };

    const filteredTiposDocumento = tiposDocumento.filter(item =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const itemSelecionado = tiposDocumento.find(item => item.id === selecionadoId);

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary">Tipos de documentos</h2>
                    <Form.Control
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border border-primary rounded-1"
                        style={{ width: '300px' }}
                    />
                </div>
                <div className="d-flex gap-2">
                    <Botao
                        variant="primary"
                        icone={<Icone nome="plus-circle" />}
                        onClick={() => navigate("/tipo-documento/novo")}
                        texto="Criar Novo"
                    />
                     <Botao 
                        variant="primary" 
                        icone={<Icone nome="pencil" />} 
                        onClick={handleEditar} 
                        disabled={!selecionadoId} 
                        texto="Editar" 
                    />
                    <Botao 
                        variant="primary" 
                        icone={<Icone nome="trash" />} 
                        onClick={handleExcluir} 
                        disabled={!selecionadoId} 
                        texto="Excluir" 
                    />
                    {selecionadoId && (
                        <Botao 
                            variant="secondary" 
                            icone={<Icone nome="x-circle" />} 
                            onClick={handleLimparSelecao} 
                            texto="Limpar Seleção" 
                        />
                    )}
                </div>
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : erro ? (
                <Alert variant="danger">{erro}</Alert>
            ) : (
                <Table borderless={true} hover responsive>
                    <thead className="thead-azul">
                        <tr>
                            <th></th>
                            <th>Nome</th>
                            <th>Vigência</th>
                            <th>Data de Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTiposDocumento.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center">Nenhum tipo de documento encontrado.</td>
                            </tr>
                        ) : (
                            filteredTiposDocumento.map(item => (
                                <tr key={item.id} className="border border-primary tr-azul">
                                    <td>
                                        <Form.Check 
                                            type="radio" 
                                            name="tipoDocSelecionado"
                                            value={item.id}
                                            checked={selecionadoId === item.id}
                                            onChange={handleSelecionar}
                                        />
                                    </td>
                                    <td>{item.nome}</td>
                                    <td>{item.validade} dias</td>
                                    <td>{formatarDataHora(item.dataRegistro)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <ModalGenerico
                visivel={modalExcluirVisivel}
                titulo="Confirmar Exclusão"
                mensagem={`Tem certeza que deseja excluir o tipo de documento "${itemSelecionado?.nome}"?`}
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
                aoConfirmar={confirmarExclusao}
                aoCancelar={() => setModalExcluirVisivel(false)}
            />
        </Container>
    );
};

export default HomeTipoDocumento;
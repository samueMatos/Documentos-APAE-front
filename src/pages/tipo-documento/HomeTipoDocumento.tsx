import { ReactElement, useEffect, useState } from "react";
import { Container, Spinner, Table, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { TipoDocumentoResponse } from "../../models/TipoDocumento";
import formatarDataHora from "../../helpers/formatarDataHora";
import Botao from "../../components/common/Botao";
import Icone from "../../components/common/Icone";
import ModalGenerico from "../../components/modals/ModalGenerico";
import { useAlert } from "../../hooks/useAlert";

const HomeTipoDocumento = (): ReactElement => {
    const navigate = useNavigate();
    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumentoResponse[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);
    const [itemParaExcluir, setItemParaExcluir] = useState<TipoDocumentoResponse | null>(null);

    const buscarDados = async () => {
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
    };

    useEffect(() => {
        buscarDados();
    }, []);

    const handleExcluir = async () => {
        const { showAlert } = useAlert();
        if (!itemParaExcluir) return;

        try {
            await api.delete(`/tipo-documento/${itemParaExcluir.id}`);
            showAlert("Excluído!", "O tipo de documento foi excluído com sucesso.", "success");
            setItemParaExcluir(null); // Fecha o modal
            buscarDados(); // Atualiza a lista
        } catch (err) {
            showAlert("Erro ao Excluir", "Não foi possível excluir. Verifique se este tipo de documento não está em uso.", "error");
            console.error("Erro ao excluir:", err);
        }
    };

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary">Gerenciamento de Tipos de Documento</h2>
                <Botao
                    variant="primary"
                    icone={<Icone nome="plus-circle" />}
                    onClick={() => navigate("/tipo-documento/novo")}
                    texto="Criar Novo"
                />
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : erro ? (
                <Alert variant="danger">{erro}</Alert>
            ) : (
                <Table bordered hover responsive>
                    <thead className="thead-azul">
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Vigência</th>
                            <th>Data de Registro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiposDocumento.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center">Nenhum tipo de documento encontrado.</td>
                            </tr>
                        ) : (
                            tiposDocumento.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.nome}</td>
                                    <td>{item.validade} dias</td>
                                    <td>{formatarDataHora(item.dataRegistro)}</td>
                                    <td className="d-flex justify-content-center gap-2">
                                        <Botao variant="info" size="sm" icone={<Icone nome="pencil" />} onClick={() => navigate(`/tipo-documento/editar/${item.id}`)} texto="Editar" />
                                        <Botao variant="danger" size="sm" icone={<Icone nome="trash" />} onClick={() => setItemParaExcluir(item)} texto="Excluir" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <ModalGenerico
                visivel={!!itemParaExcluir}
                titulo="Confirmar Exclusão"
                mensagem={`Tem certeza que deseja excluir o tipo de documento "${itemParaExcluir?.nome}"?`}
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
                aoConfirmar={handleExcluir}
                aoCancelar={() => setItemParaExcluir(null)}
            />
        </Container>
    );
};

export default HomeTipoDocumento;
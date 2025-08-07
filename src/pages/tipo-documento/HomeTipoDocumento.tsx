import { ReactElement, useEffect, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table, InputGroup } from "react-bootstrap";
import { TipoDocumentoRequest, TipoDocumentoResponse, UnidadeTempo } from "../../models/TipoDocumento";
import { Page } from "../../models/Page";
import { tipoDocumentoService } from "../../services/tipoDocumentoService";

import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico";
import formatarDataHora from "../../helpers/formatarDataHora";
import { useAlert } from "../../hooks/useAlert";

import "../../assets/css/pages/aluno.css";


const decomporDias = (totalDeDias: number): { valor: number; unidade: UnidadeTempo } => {
    if (totalDeDias > 0 && totalDeDias % 365 === 0) return { valor: totalDeDias / 365, unidade: 'Anos' };
    if (totalDeDias > 0 && totalDeDias % 30 === 0) return { valor: totalDeDias / 30, unidade: 'Meses' };
    return { valor: totalDeDias, unidade: 'Dias' };
};

const calcularTotalDias = (valor: number, unidade: UnidadeTempo): number => {
    switch (unidade) {
        case 'Anos': return valor * 365;
        case 'Meses': return valor * 30;
        case 'Dias': default: return valor;
    }
};


interface DadosFormTipoDoc {
    nome: string;
    valorValidade: number;
    unidadeValidade: UnidadeTempo;
}

const HomeTipoDocumento = (): ReactElement => {
    const { showAlert } = useAlert();


    const [paginaData, setPaginaData] = useState<Page<TipoDocumentoResponse> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState<boolean>(true);


    const [itemParaInativar, setItemParaInativar] = useState<TipoDocumentoResponse | null>(null);
    const [modalInativarVisivel, setModalInativarVisivel] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [itemEmEdicao, setItemEmEdicao] = useState<TipoDocumentoResponse | null>(null);
    const [dadosForm, setDadosForm] = useState<DadosFormTipoDoc>({
        nome: '',
        valorValidade: 1,
        unidadeValidade: 'Dias'
    });


    const buscarDados = useCallback(async () => {
        setCarregando(true);
        try {

            const resposta = await tipoDocumentoService.listarPaginado(paginaAtual, termoBusca);
            setPaginaData(resposta);
        } catch (err) {
            showAlert("Erro ao buscar os tipos de documento.", "Erro!", "error");
        } finally {
            setCarregando(false);
        }
    }, [paginaAtual, termoBusca, showAlert]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarDados();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarDados]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setDadosForm(prev => ({ ...prev, [name]: value })); };


    const abrirModalCadastro = () => {
        setItemEmEdicao(null);
        setDadosForm({ nome: '', valorValidade: 1, unidadeValidade: 'Dias' });
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (item: TipoDocumentoResponse) => {
        setItemEmEdicao(item);
        const { valor, unidade } = decomporDias(item.validade);
        setDadosForm({ nome: item.nome, valorValidade: valor, unidadeValidade: unidade });
        setModalFormVisivel(true);
    };

    const fecharModalForm = () => setModalFormVisivel(false);

    const handleInativarClick = (e: MouseEvent, item: TipoDocumentoResponse) => {
        e.stopPropagation();
        setItemParaInativar(item);
        setModalInativarVisivel(true);
    };

    const handleSalvar = async () => {
    const totalDias = calcularTotalDias(dadosForm.valorValidade, dadosForm.unidadeValidade);
    const payload: TipoDocumentoRequest = { nome: dadosForm.nome, validade: totalDias, isAtivo: true };

    try {
        if (itemEmEdicao) {
            await tipoDocumentoService.atualizar(itemEmEdicao.id, payload);
            showAlert("Tipo de documento atualizado com sucesso!", "Sucesso", "success");
        } else {
            await tipoDocumentoService.criar(payload);
            showAlert("Tipo de documento criado com sucesso!", "Sucesso", "success");
        }
        fecharModalForm();
        buscarDados();
    } catch (error: any) {


        const errorData = error.response?.data;
        let errorMessage = "Ocorreu um erro ao salvar."; // Mensagem padrão

        if (typeof errorData === 'string' && errorData) {
            
            errorMessage = errorData;
        } else if (typeof errorData === 'object' && errorData?.message) {
   
            errorMessage = errorData.message;
        }

        showAlert(errorMessage, "Erro", "error");
    }
};

    const handleConfirmarInativacao = async () => {
        if (!itemParaInativar) return;
        try {
            await tipoDocumentoService.changeStatus(itemParaInativar.id);
            showAlert("Status do tipo de documento alterado com sucesso!", "Sucesso", "success");
            buscarDados();
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao inativar.", "Erro!", "error");
        } finally {
            setItemParaInativar(null);
            setModalInativarVisivel(false);
        }
    };


    const formatarVigencia = (totalDeDias: number): string => {

        const { valor, unidade } = decomporDias(totalDeDias);


        if (valor === 1) {

            if (unidade === 'Meses') return '1 Mês';
            return `1 ${unidade.slice(0, -1)}`;
        }

        return `${valor} ${unidade}`;
    };

    const renderizarFormulario = () => (
        <fieldset className="border border-primary-subtle rounded p-2 mb-2">
            <legend className="float-none w-auto px-2 h6 m-0 text-primary">Informações</legend>
            <Form>
                <Form.Group className="mb-3" controlId="nome">
                    <Form.Label className="form-label-md">Nome do tipo de documento <span className="text-danger">*</span></Form.Label>
                    <Form.Control size="md" type="text" name="nome" value={dadosForm.nome} onChange={handleFormChange} required />
                </Form.Group>
                <Form.Group controlId="validade">
                    <Form.Label className="form-label-md">Prazo de vigência <span className="text-danger">*</span></Form.Label>
                    <InputGroup size="md">
                        <Form.Control type="number" name="valorValidade" value={dadosForm.valorValidade} onChange={e => {
                            const value = e.target.value;

                            const _dadosForm = {...dadosForm};
                            _dadosForm.valorValidade = Number(value.replace(/[^0-9]/g, ''));
                            setDadosForm(_dadosForm);
                        }} min="1" required />
                        <Form.Select name="unidadeValidade" value={dadosForm.unidadeValidade} onChange={handleFormChange} style={{ maxWidth: "120px" }}>
                            <option value="Dias">Dias</option>
                            <option value="Meses">Meses</option>
                            <option value="Anos">Anos</option>
                        </Form.Select>
                    </InputGroup>
                </Form.Group>
            </Form>
        </fieldset>
    );

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <h2 className="text-primary">Tipos de Documento</h2>
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Pesquisar por nome..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="border-primary rounded-1"
                        />
                        <Botao
                            variant="outline-primary"
                            onClick={() => buscarDados()}
                            icone={<Icone nome="refresh" />}
                            title="Recarregar dados"
                        />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2 ">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Cadastrar" />
                </div>
            </div>

            {carregando ? (<div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead className="thead-azul">
                            <tr>
                                <th className="text-center" style={{ width: '30%' }}>Vigência</th>
                                <th style={{ width: '30%' }}>Nome</th>
                                <th className="text-center d-none d-md-table-cell" style={{ width: '30%' }}>Data de Registro</th>
                                <th className="text-center" style={{ width: '20%' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map(item => (
                                    <tr key={item.id} className="border border-primary tr-azul-hover" onClick={() => abrirModalEdicao(item)} style={{ cursor: 'pointer' }}>
                                        <td className="text-center align-middle">{formatarVigencia(item.validade)}</td>
                                        <td className="align-middle">{item.nome}</td>
                                        <td className="text-center align-middle d-none d-md-table-cell">{formatarDataHora(item.dataRegistro)}</td>
                                        <td className="text-center align-middle">
                                            <Botao variant="link" className="p-0 text-danger" title="Inativar" onClick={(e) => handleInativarClick(e, item)} icone={<Icone nome="ban" />} />
                                        </td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan={4} className="text-center py-4">Nenhum tipo de documento encontrado.</td></tr>)}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p - 1)} disabled={paginaData?.first}>&larr; Anterior</Button>
                        <span>Página {paginaData ? paginaData.number + 1 : 0} de {paginaData?.totalPages ?? 0}</span>
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p + 1)} disabled={paginaData?.last}>Próxima &rarr;</Button>
                    </div>
                </>
            )}

            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={
                    itemEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar tipo de documento </>
                        : <> <Icone nome="plus-square" className="me-2" /> Cadastrar novo tipo de documento </>
                }
                conteudo={renderizarFormulario()}
                textoConfirmar="Salvar"
                textoCancelar="Cancelar"
                aoConfirmar={handleSalvar}
                aoCancelar={fecharModalForm}
                size="lg"
                headerClassName="bg-primary text-white"
                titleClassName="w-100 text-center"
                closeButtonVariant="white"
            />
            <ModalGenerico
                visivel={modalInativarVisivel}
                titulo="Confirmar Inativação"
                mensagem={`Deseja realmente inativar o tipo de documento "${itemParaInativar?.nome}"?`}
                textoConfirmar="Inativar"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarInativacao}
                aoCancelar={() => setModalInativarVisivel(false)}
            />
        </Container>
    );
};

export default HomeTipoDocumento;
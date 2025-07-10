import { ChangeEvent, ReactElement, useEffect, useRef, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table, Row, Col } from "react-bootstrap";
import InputMask from "react-input-mask";


import Aluno from "../../models/Aluno";
import { Page } from "../../models/Page.ts";
import { alunoService } from "../../services/alunoService";
import api from "../../services/api";

import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import SelectEstados from "../../components/alunos/SelectEstados";
import ModalGenerico from "../../components/modals/ModalGenerico.tsx";
import formatarCPF from "../../helpers/formatarCPF";
import formatarData from "../../helpers/formatarData";
import { useAlert } from "../../hooks/useAlert";


import "../../assets/css/pages/aluno.css";

const Home = (): ReactElement => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [paginaData, setPaginaData] = useState<Page<Aluno> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<boolean>(false);
    const { showAlert } = useAlert();

    const [alunoParaInativar, setAlunoParaInativar] = useState<number | null>(null);
    const [modalInativarVisivel, setModalInativarVisivel] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<Aluno>({
        nome: '', dataNascimento: '', cpf: '', matricula: "", isAtivo: true, telefone: '',
        sexo: '', dataEntrada: '', observacoes: '',
        endereco: '', estado: '', cidade: '', bairro: '', rua: '',
        numero: 0, complemento: '', cep: '', ibge: ''
    });

    const buscarDados = useCallback(async () => { setCarregando(true); setErro(false); try { const resposta = await alunoService.listarAlunos(paginaAtual, termoBusca); setPaginaData(resposta); } catch (err: any) { setErro(true); const mensagemErro = err.response?.data || "Erro ao carregar a lista de alunos."; showAlert(mensagemErro, "Erro!", "error"); } finally { setCarregando(false); } }, [paginaAtual, termoBusca, showAlert]);
    useEffect(() => { const timerId = setTimeout(() => { buscarDados(); }, 300); return () => clearTimeout(timerId); }, [buscarDados]);
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setDadosForm(prev => ({ ...prev, [name]: value })); };
    const buscarDadosCep = async (cep: string) => { const response = await api.get(`https://viacep.com.br/ws/${cep}/json/`); return response.data; };
    const handleCepBlur = async () => { const cep = dadosForm.cep.replace(/\D/g, ""); if (cep.length === 8) { try { const data = await buscarDadosCep(cep); if (!data.erro) { setDadosForm(prev => ({ ...prev, estado: data.uf, cidade: data.localidade, bairro: data.bairro, rua: data.logradouro, ibge: data.ibge, })); } else { showAlert("CEP não encontrado", "Atenção", "warning"); } } catch (err) { console.log("Erro ao buscar CEP:", err); } } };
    const abrirModalCadastro = () => { setAlunoEmEdicao(null); setDadosForm({ nome: '', dataNascimento: '', cpf: '', matricula: "", isAtivo: true, telefone: '', sexo: '', dataEntrada: '', observacoes: '', endereco: '', estado: '', cidade: '', bairro: '', rua: '', numero: 0, complemento: '', cep: '', ibge: '' }); setModalFormVisivel(true); };
    const abrirModalEdicao = async (aluno: Aluno) => { setAlunoEmEdicao(aluno); setModalFormVisivel(true); setCarregandoModal(true); try { const response = await alunoService.listarUmAluno(aluno.id!); setDadosForm(response); } catch (error) { showAlert("Erro ao buscar dados do aluno.", "Erro!", "error"); fecharModalForm(); } finally { setCarregandoModal(false); } };
    const fecharModalForm = () => setModalFormVisivel(false);
    const handleSalvar = async () => { try { if (alunoEmEdicao) { await alunoService.atualizarAluno(alunoEmEdicao.id!, dadosForm); showAlert("Aluno atualizado com sucesso!", "Sucesso", "success"); } else { await alunoService.cadastrarAluno(dadosForm); showAlert("Aluno cadastrado com sucesso!", "Sucesso!", "success"); } fecharModalForm(); buscarDados(); } catch (error: any) { const msg = error.response?.data || "Erro ao salvar aluno."; showAlert(msg, "Erro!", "error"); } };
    const handleInativarClick = (e: MouseEvent, id: number) => { e.stopPropagation(); setAlunoParaInativar(id); setModalInativarVisivel(true); };
    const handleConfirmarExclusao = async () => { if (!alunoParaInativar) return; try { await alunoService.deletarAluno(alunoParaInativar); showAlert("Aluno inativo com sucesso.", "Aluno Inativo", "success"); buscarDados(); } catch (err) { showAlert("Não foi possível inativar o aluno.", "Erro ao inativar.", "error"); } finally { setAlunoParaInativar(null); setModalInativarVisivel(false); } };
    const handleCancelarExclusao = () => { setAlunoParaInativar(null); setModalInativarVisivel(false); };
    const handleBuscar = (e: ChangeEvent<HTMLInputElement>) => { setTermoBusca(e.target.value); setPaginaAtual(0); };
    const handleBotaoImportar = () => fileInputRef.current?.click();
    const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => { const files = event.target.files; if (files && files.length > 0) { const arquivoExcel = files[0]; try { await alunoService.importarAlunos(arquivoExcel); showAlert("Planilha importada com sucesso.", "Sucesso!", "success"); buscarDados(); } catch (err) { showAlert("Erro ao importar a planilha.", "Erro!", "error"); } finally { if (fileInputRef.current) { fileInputRef.current.value = ''; } } } };

    const renderizarFormulario = () => (
        <Form>
            <fieldset className="border border-primary-subtle rounded p-2 mb-2">
                <legend className="float-none w-auto px-2 h6 m-0 text-primary">Dados Pessoais</legend>
                <Row className="g-2">
                    <Form.Group as={Col} md={6} controlId="nome"><Form.Label className="form-label-sm">Nome Completo<span className="text-danger">*</span></Form.Label><Form.Control size="sm" type="text" name="nome" value={dadosForm.nome} onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} md={3} controlId="dataNascimento"><Form.Label className="form-label-sm">Nascimento<span className="text-danger">*</span></Form.Label><Form.Control size="sm" type="date" name="dataNascimento" value={dadosForm.dataNascimento ? dadosForm.dataNascimento.split('T')[0] : ''} onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} md={3} controlId="cpf"><Form.Label className="form-label-sm">CPF<span className="text-danger">*</span></Form.Label><InputMask mask="999.999.999-99" value={dadosForm.cpf} onChange={handleFormChange}>{(inputProps: any) => <Form.Control size="sm" {...inputProps} type="text" name="cpf" required />}</InputMask></Form.Group>
                    <Form.Group as={Col} md={4} controlId="matricula"><Form.Label className="form-label-sm">Matrícula<span className="text-danger">*</span></Form.Label><Form.Control size="sm" type="number" name="matricula" value={dadosForm.matricula || ''} onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} md={4} controlId="telefone"><Form.Label className="form-label-sm">Telefone<span className="text-danger">*</span></Form.Label><InputMask mask="(99) 99999-9999" value={dadosForm.telefone} onChange={handleFormChange}>{(inputProps: any) => <Form.Control size="sm" {...inputProps} type="text" name="telefone" required />}</InputMask></Form.Group>
                    <Form.Group as={Col} md={4} controlId="sexo"><Form.Label className="form-label-sm">Sexo<span className="text-danger">*</span></Form.Label><Form.Select size="sm" name="sexo" value={dadosForm.sexo} onChange={handleFormChange} required><option value="">Selecione...</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option> </Form.Select></Form.Group>

                </Row>
            </fieldset>

            <fieldset className="border border-primary-subtle rounded p-2 mb-2">
                <legend className="float-none w-auto px-2 h6 m-0 text-primary">Endereço</legend>
                <Row className="g-2">
                    <Form.Group as={Col} md={3} controlId="cep"><Form.Label className="form-label-sm">CEP<span className="text-danger">*</span></Form.Label><InputMask mask="99999-999" value={dadosForm.cep} onChange={handleFormChange} onBlur={handleCepBlur}>{(inputProps: any) => <Form.Control size="sm" {...inputProps} type="text" name="cep" required />}</InputMask></Form.Group>
                    <Form.Group as={Col} md={3} controlId="estado"><SelectEstados size="sm" name="estado" value={dadosForm.estado} controlId="" onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} md={3} controlId="cidade"><Form.Label className="form-label-sm">Cidade<span className="text-danger">*</span></Form.Label><Form.Control size="sm" type="text" name="cidade" value={dadosForm.cidade} onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} md={3} controlId="bairro"><Form.Label className="form-label-sm">Bairro<span className="text-danger">*</span></Form.Label><Form.Control size="sm" type="text" name="bairro" value={dadosForm.bairro} onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} md={6} controlId="rua"><Form.Label className="form-label-sm">Rua<span className="text-danger">*</span></Form.Label><Form.Control size="sm" type="text" name="rua" value={dadosForm.rua} onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} md={2} controlId="numero"><Form.Label className="form-label-sm">Nº</Form.Label><Form.Control size="sm" type="number" name="numero" value={dadosForm.numero} onChange={handleFormChange} /></Form.Group>
                    <Form.Group as={Col} md={4} controlId="complemento"><Form.Label className="form-label-sm">Complemento</Form.Label><Form.Control size="sm" type="text" name="complemento" value={dadosForm.complemento} onChange={handleFormChange} /></Form.Group>
                </Row>
            </fieldset>

            <fieldset className="border border-primary-subtle rounded p-2">
                <legend className="float-none w-auto px-2 h6 m-0 text-primary">Outras Informações</legend>
                <Row className="g-2">
                    <Form.Group as={Col} md={4} controlId="dataEntrada"><Form.Label className="form-label-sm">Data de Entrada<span className="text-danger">*</span></Form.Label><Form.Control size="sm" type="date" name="dataEntrada" value={dadosForm.dataEntrada ? dadosForm.dataEntrada.split('T')[0] : ''} onChange={handleFormChange} required /></Form.Group>
                    <Form.Group as={Col} controlId="observacoes"><Form.Label className="form-label-sm">Observações</Form.Label><Form.Control size="sm" as="textarea" name="observacoes" value={dadosForm.observacoes} onChange={handleFormChange} rows={1} /></Form.Group>
                </Row>
            </fieldset>
        </Form>
    );

    return (
        <Container fluid>

            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1"><h2 className="text-primary">Alunos</h2>
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Pesquisar por nome, matrícula ou CPF..."
                            value={termoBusca}
                            onChange={handleBuscar}
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
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept=".xls, .xlsx" />
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Cadastrar" />
                    <Botao variant="secondary" icone={<Icone nome="arrow-down" />} onClick={handleBotaoImportar} texto="Importar Planilha" />
                </div>
            </div>


            {carregando ? (<div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th className="text-center align-middle" style={{ width: '15%' }}>Matrícula</th>
                                <th className="align-left" style={{ width: '30%' }}>Nome</th>
                                <th className="text-center align-middle d-none d-md-table-cell" style={{ width: '25%' }}>CPF</th>
                                <th className="text-center align-middle d-none d-md-table-cell" style={{ width: '20%' }}>Data de Nasc.</th>
                                <th className="text-center align-middle" style={{ width: '10%' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {erro ? (<tr><td colSpan={4} className="text-center text-danger">Erro ao buscar alunos.</td></tr>) :
                                paginaData?.content && paginaData.content.length > 0 ? (
                                    paginaData.content.map(aluno => (
                                        <tr key={aluno.id} className="border border-primary tr-azul-hover" onClick={() => abrirModalEdicao(aluno)} style={{ cursor: 'pointer' }}>
                                            <td className="text-center align-middle">{aluno.matricula}</td>
                                            <td className="align-left">{aluno.nome}</td>
                                            <td className="text-center align-middle d-none d-md-table-cell">{formatarCPF(aluno.cpf)}</td>
                                            <td className="text-center align-middle d-none d-md-table-cell">{formatarData(aluno.dataNascimento)}</td>
                                            <td className="text-center align-middle">
                                                <Botao variant="link" className="p-0 text-danger" title="Inativar Aluno" onClick={(e) => handleInativarClick(e, aluno.id!)} icone={<Icone nome="ban" tamanho={20} />} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (<tr><td colSpan={4} className="text-center">Nenhum aluno encontrado.</td></tr>)}
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
                    alunoEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar aluno: {alunoEmEdicao.nome} </>
                        : <> <Icone nome="plus-square" className="me-2" /> Cadastrar novo aluno </>
                }
                conteudo={carregandoModal ? <div className="text-center p-5"><Spinner animation="border" /></div> : renderizarFormulario()}
                textoConfirmar="Salvar"
                textoCancelar="Cancelar"
                aoConfirmar={handleSalvar}
                aoCancelar={fecharModalForm}
                size="xl"
                headerClassName="bg-primary text-white"
                titleClassName="w-100 text-center"
                closeButtonVariant="white"
            />
            <ModalGenerico
                visivel={modalInativarVisivel}
                titulo="Confirmar inativação."
                mensagem="Deseja realmente inativar este aluno?"
                textoConfirmar="Inativar"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarExclusao}
                aoCancelar={handleCancelarExclusao}
            />
        </Container>
    );
};

export default Home;
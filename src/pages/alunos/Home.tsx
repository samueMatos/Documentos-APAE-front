import {ChangeEvent, ReactElement, useEffect, useRef, useState, useCallback} from "react";
import { Button, Container, Form, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Aluno from "../../models/Aluno";
import { alunoService } from "../../services/alunoService";

import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import formatarCPF from "../../helpers/formatarCPF";
import formatarData from "../../helpers/formatarData";
import "../../assets/css/pages/aluno.css";
import {Page} from "../../models/Page.ts";
import { useAlert } from "../../hooks/useAlert";

import ModalGenerico from "../../components/modals/ModalGenerico.tsx"; 

const Home = (): ReactElement => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [paginaData, setPaginaData] = useState<Page<Aluno> | null>(null);
    const [alunoSelecionado, setAlunoSelecionado] = useState<number | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState<string>('');
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<boolean>(false);
    const { showAlert } = useAlert();

   
    const [modalExcluirVisivel, setModalExcluirVisivel] = useState<boolean>(false);

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        setErro(false);
        try {
            const resposta = await alunoService.listarAlunos(paginaAtual, termoBusca);
            setPaginaData(resposta);
        } catch (err: any) {
            setErro(true);
            const mensagemErro = err.response?.data || "Erro ao importar alunos.";
            alert(mensagemErro);
            console.error("Erro ao buscar alunos:", err);
        } finally {
            setCarregando(false);
        }
    }, [paginaAtual, termoBusca]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarDados();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarDados]);

    const handleBuscar = (e: ChangeEvent<HTMLInputElement>) => {
        setTermoBusca(e.target.value);
        setPaginaAtual(0);
    };

    const handleBotaoImportar = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const arquivoExcel = files[0];
            try {
                await alunoService.importarAlunos(arquivoExcel);
                showAlert("Os alunos da planilha foram importados com sucesso.", "Importação Concluída", "success");
                buscarDados();
            } catch (err) {
                showAlert("Ocorreu um erro ao importar a planilha. Verifique o formato do arquivo e os dados.", "Falha na Importação", "error");
                console.error("Erro na importação:", err);
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const handleSelecionarAluno = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idSelecionado = Number(e.target.value);
        setAlunoSelecionado((prevId) => (prevId === idSelecionado ? null : idSelecionado));
    };

    const handleDeselecionar = () => {
        setAlunoSelecionado(null);
    };


    const handleInativarAluno = () => {
        if (alunoSelecionado) {
            setModalExcluirVisivel(true);
        }
    };

  
    const handleConfirmarExclusao = async () => {
        if (!alunoSelecionado) return;

        try {
            await alunoService.deletarAluno(alunoSelecionado);
            showAlert("O aluno foi excluído com sucesso.", "Aluno Excluído", "success");
            setAlunoSelecionado(null);
            buscarDados();
        } catch (err) {
            showAlert("Não foi possível excluir o aluno. Tente novamente mais tarde.", "Erro ao Excluir", "error");
            console.error(err);
        } finally {
            setModalExcluirVisivel(false); 
        }
    };
    
 
    const handleCancelarExclusao = () => {
        setModalExcluirVisivel(false);
    };


    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary">Alunos</h2>
                    <Form.Control
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={termoBusca}
                        onChange={handleBuscar}
                        className="border border-primary rounded-1"
                        style={{ width: '300px' }}
                    />
                </div>
                <div className="d-flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                    <Botao variant="secondary" icone={<Icone nome="arrow-down" />} onClick={handleBotaoImportar} texto="Importar Planilha" />
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={() => navigate("/alunos/cadastrar")} texto="Cadastrar" />
                    <Botao variant="primary" icone={<Icone nome="pencil" />} onClick={() => navigate(`/alunos/editar/${alunoSelecionado}`)} disabled={!alunoSelecionado} texto="Editar" />
                    <Botao variant="primary" icone={<Icone nome="trash" />} onClick={handleInativarAluno} disabled={!alunoSelecionado} texto="Excluir" />
                    {alunoSelecionado && (
                        <Botao variant="secondary" icone={<Icone nome="x-circle" />} onClick={handleDeselecionar} texto="Limpar Seleção" />
                    )}
                </div>
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th></th>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Data de Nascimento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {erro ? (
                                <tr className="border border-primary">
                                    <td colSpan={4} className="text-center text-danger">Erro ao buscar alunos. Tente novamente.</td>
                                </tr>
                            ) : paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map(aluno => (
                                    <tr key={aluno.id} className="border border-primary tr-azul">
                                        <td>
                                            <Form.Check type="radio" name="alunoSelecionado" checked={alunoSelecionado === aluno.id} value={aluno.id} onChange={handleSelecionarAluno} />
                                        </td>
                                        <td>{aluno.nome}</td>
                                        <td>{formatarCPF(aluno.cpf)}</td>
                                        <td>{formatarData(aluno.dataNascimento)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border border-primary">
                                    <td colSpan={4} className="text-center">Nenhum aluno encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center align-items-center gap-2">
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p - 1)} disabled={paginaData?.first}>
                            &larr; Anterior
                        </Button>
                        <span>
                            Página {paginaData ? paginaData.number + 1 : 0} de {paginaData?.totalPages ?? 0}
                        </span>
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p + 1)} disabled={paginaData?.last}>
                            Próxima &rarr;
                        </Button>
                    </div>
                </>
            )}

            <ModalGenerico
                visivel={modalExcluirVisivel}
                titulo="Confirmar Exclusão"
                mensagem="Deseja realmente excluir o aluno selecionado?"
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarExclusao}
                aoCancelar={handleCancelarExclusao}
            />
        </Container>
    );
};

export default Home;
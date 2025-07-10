import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';
import { alunoService } from '../../services/alunoService';
import Aluno from '../../models/Aluno';

interface SelectAlunosProps {
    value: number | null;
    onAlunoSelect: (aluno: Aluno | null) => void;
    required?: boolean;
    disabled?: boolean;
}

const SelectAlunos = ({ value, onAlunoSelect, required, disabled }: SelectAlunosProps) => {
    const [termoBusca, setTermoBusca] = useState('');
    const [resultados, setResultados] = useState<Aluno[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (termoBusca.length < 2 || !mostrarResultados) {
            setResultados([]);
            return;
        }
        
        const timer = setTimeout(() => {
            setCarregando(true);
            alunoService.listarAlunos(0,termoBusca)
                .then(response => {
                    console.log("Resposta da API de busca de alunos:", response);
                    if (response && Array.isArray(response.content)) {
                        setResultados(response.content);
                    } else {
                        console.warn("A resposta da API não tem o formato esperado (ex: { content: [...] }). Usando array vazio.");
                        setResultados([]);
                    }
                })
                .catch(error => {
                    console.error("Erro ao buscar alunos:", error);
                    setResultados([]);
                })
                .finally(() => {
                    setCarregando(false);
                });
        }, 500);
        
        return () => clearTimeout(timer);
    }, [termoBusca, mostrarResultados]); 

    useEffect(() => {
        if (value && !termoBusca) {
            alunoService.listarUmAluno(value).then(aluno => {
                if (aluno) {
                    setTermoBusca(aluno.nome);
                }
            });
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setMostrarResultados(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelecionarAluno = (aluno: Aluno) => {
        setTermoBusca(aluno.nome);
        onAlunoSelect(aluno);
        setMostrarResultados(false);
    };

    const handleChangeBusca = (e: ChangeEvent<HTMLInputElement>) => {
        const novoValor = e.target.value;
        setTermoBusca(novoValor);
        setMostrarResultados(true);
        if (novoValor === '') {
            onAlunoSelect(null);
        }
    };

    return (
        <Form.Group ref={wrapperRef} className="mb-3" style={{ position: 'relative' }}>
            <Form.Label>Aluno</Form.Label>
            <Form.Control
                type="text"
                placeholder="Digite o nome, matrícula ou CPF do aluno para buscar..."
                value={termoBusca}
                onChange={handleChangeBusca}
                onFocus={() => setMostrarResultados(true)}
                autoComplete="off"
                required={required}
                disabled={disabled}
            />
            {mostrarResultados && termoBusca.length > 1 && (
                <ListGroup style={{ position: 'absolute', zIndex: 1000, width: '100%', maxHeight: '200px', overflowY: 'auto', borderTop: 'none' }}>
                    {carregando && <ListGroup.Item><Spinner as="span" animation="border" size="sm" /> Carregando...</ListGroup.Item>}
                    {!carregando && resultados.length === 0 && termoBusca.length > 1 && <ListGroup.Item>Nenhum aluno encontrado.</ListGroup.Item>}
                    {!carregando && resultados.map(aluno => (
                        <ListGroup.Item key={aluno.id} action onClick={() => handleSelecionarAluno(aluno)}>
                            {aluno.nome}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Form.Group>
    );
};

export default SelectAlunos;
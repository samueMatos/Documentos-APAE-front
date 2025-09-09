import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';
import { ColaboradorResponse, colaboradorService } from '../../services/colaboradorService';

interface SelectColaboradoresProps {
    value?: number | null;
    onColaboradorSelect: (colaborador: ColaboradorResponse | null) => void;
    required?: boolean;
    disabled?: boolean;
    initialColaborador?: ColaboradorResponse | null;
}

const SelectColaboradores: React.FC<SelectColaboradoresProps> = ({ onColaboradorSelect, required, disabled, initialColaborador }) => {
    const [termoBusca, setTermoBusca] = useState('');
    const [resultados, setResultados] = useState<ColaboradorResponse[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialColaborador) {
            setTermoBusca(initialColaborador.nome);
        }
    }, [initialColaborador]);

    useEffect(() => {
        if (termoBusca.length < 2 || !mostrarResultados) {
            setResultados([]);
            return;
        }

        const timer = setTimeout(() => {
            setCarregando(true);
            colaboradorService.findAll(0, 50)
                .then(response => {
                    const filteredOptions = response.content.filter(c =>
                        c.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                        c.cpf.includes(termoBusca)
                    );
                    setResultados(filteredOptions);
                })
                .catch(error => {
                    console.error("Erro ao buscar colaboradores:", error);
                    setResultados([]);
                })
                .finally(() => {
                    setCarregando(false);
                });
        }, 500);

        return () => clearTimeout(timer);
    }, [termoBusca, mostrarResultados]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setMostrarResultados(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelecionarColaborador = (colaborador: ColaboradorResponse) => {
        setTermoBusca(colaborador.nome);
        onColaboradorSelect(colaborador);
        setMostrarResultados(false);
    };

    const handleChangeBusca = (e: ChangeEvent<HTMLInputElement>) => {
        const novoValor = e.target.value;
        setTermoBusca(novoValor);
        setMostrarResultados(true);
        if (novoValor === '') {
            onColaboradorSelect(null);
        }
    };

    return (
        <Form.Group ref={wrapperRef} className="mb-3" style={{ position: 'relative' }}>
            <Form.Label>Colaborador <span className="text-danger">*</span></Form.Label>
            <Form.Control
                type="text"
                placeholder="Digite para buscar um colaborador..."
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
                    {!carregando && resultados.length === 0 && termoBusca.length > 1 && <ListGroup.Item>Nenhum colaborador encontrado.</ListGroup.Item>}
                    {!carregando && resultados.map(colaborador => (
                        <ListGroup.Item key={colaborador.id} action onClick={() => handleSelecionarColaborador(colaborador)}>
                            <strong>{colaborador.nome}</strong><br />
                            <small>CPF: {colaborador.cpf}</small>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Form.Group>
    );
};

export default SelectColaboradores;
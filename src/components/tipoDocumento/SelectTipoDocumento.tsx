import { ChangeEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import api from '../../services/api';

interface TipoDocumento {
    id: number;
    nome: string;
}

type Props = {
    name: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    required?: boolean;
};

const SelectTipoDocumento = ({ name, value, onChange, required }: Props) => {
    const [tipos, setTipos] = useState<TipoDocumento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        const fetchTiposDocumento = async () => {
            try {
                const response = await api.get<TipoDocumento[]>('/tipo-documento/ativos');

                if (Array.isArray(response.data)) {
                    setTipos(response.data);
                } else {
                    setErro("Formato de resposta inválido.");
                    setTipos([]);
                }

            } catch (error) {
                console.error("Erro ao buscar os tipos de documento:", error);
                setErro("Não foi possível carregar os tipos.");
                setTipos([]);
            } finally {
                setCarregando(false);
            }
        };

        fetchTiposDocumento();
    }, []);

    return (
        <Form.Group className="mb-3" controlId="tipoDocumento">
            <Form.Label>Tipo de Documento</Form.Label>
            <Form.Control
                as="select"
                name={name}
                value={value}
                onChange={onChange}
                disabled={carregando || !!erro}
                required={required}
            >
                <option value="">
                    {carregando && "Carregando..."}
                    {erro && erro}
                    {!carregando && !erro && "Selecione o tipo de documento"}
                </option>

                {tipos.map(tipo => (
                    <option key={tipo.id} value={tipo.nome}>
                        {tipo.nome}
                    </option>
                ))}
            </Form.Control>
        </Form.Group>
    );
};

export default SelectTipoDocumento;
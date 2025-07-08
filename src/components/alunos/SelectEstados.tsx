import { ChangeEvent } from 'react';
import { Col, Form } from 'react-bootstrap';

type Props = {
    name: string;
    controlId: string;
    className?: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    value: string;
    size:'sm';
    required?: boolean;
    
}

type Estado = {
    abreviacao: string;
    nome: string;
};


const SelectEstados = (props: Props) => {
    const estados: Estado[] = [
        { abreviacao: "AC", nome: "Acre" },
        { abreviacao: "AL", nome: "Alagoas" },
        { abreviacao: "AP", nome: "Amapá" },
        { abreviacao: "AM", nome: "Amazonas" },
        { abreviacao: "BA", nome: "Bahia" },
        { abreviacao: "CE", nome: "Ceará" },
        { abreviacao: "DF", nome: "Distrito Federal" },
        { abreviacao: "ES", nome: "Espírito Santo" },
        { abreviacao: "GO", nome: "Goiás" },
        { abreviacao: "MA", nome: "Maranhão" },
        { abreviacao: "MT", nome: "Mato Grosso" },
        { abreviacao: "MS", nome: "Mato Grosso do Sul" },
        { abreviacao: "MG", nome: "Minas Gerais" },
        { abreviacao: "PA", nome: "Pará" },
        { abreviacao: "PB", nome: "Paraíba" },
        { abreviacao: "PR", nome: "Paraná" },
        { abreviacao: "PE", nome: "Pernambuco" },
        { abreviacao: "PI", nome: "Piauí" },
        { abreviacao: "RJ", nome: "Rio de Janeiro" },
        { abreviacao: "RN", nome: "Rio Grande do Norte" },
        { abreviacao: "RS", nome: "Rio Grande do Sul" },
        { abreviacao: "RO", nome: "Rondônia" },
        { abreviacao: "RR", nome: "Roraima" },
        { abreviacao: "SC", nome: "Santa Catarina" },
        { abreviacao: "SP", nome: "São Paulo" },
        { abreviacao: "SE", nome: "Sergipe" },
        { abreviacao: "TO", nome: "Tocantins" }
    ];

    return (
        <Form.Group controlId={props.controlId} as={Col} className={props.className}>
            <Form.Label className='form-label-sm'>Estado<span className="text-danger">*</span></Form.Label>
            <Form.Control
                as="select"
                required={true}
                name={props.name}
                onChange={props.onChange}
                value={props.value}
                size="sm"
            >
                <option disabled value="">Selecione um Estado</option>
                {estados.map((estado, i) => (
                    <option key={i} value={estado.abreviacao}>
                        {estado.nome}
                    </option>
                ))}
            </Form.Control>
        </Form.Group>
    )
}

export default SelectEstados;
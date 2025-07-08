import { ReactElement } from "react";

interface IconeProps {
    nome: string;
    texto?: string;
    tamanho?: number;
    className?: string;
}


const Icone = (props: IconeProps): ReactElement => {
    return (
        <>
            <i className={`fa fa-${props.nome} mx-1`}></i>
            {props.texto}
        </>
    )
};

export default Icone;
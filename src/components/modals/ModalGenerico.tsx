import React, { ReactNode, ReactElement } from "react";
import { Modal, Button } from "react-bootstrap";

export interface ModalGenericoProps {
  visivel: boolean;
  titulo?: React.ReactNode;
  mensagem?: string;
  conteudo?: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  esconderBotaoFechar?: boolean;
  size?: 'sm' | 'lg' | 'xl';
  headerClassName?: string;
  titleClassName?: string; 
  closeButtonVariant?: 'white'; 
  aoConfirmar?: () => void;
  aoCancelar?: () => void;
  confirmarDisabled?: boolean;
  botoesFooter?: ReactNode;
}

const ModalGenerico = ({
  visivel,
  titulo,
  mensagem,
  conteudo,
  textoConfirmar,
  textoCancelar,
  esconderBotaoFechar,
  size,
  headerClassName,
  titleClassName, 
  closeButtonVariant,
  aoConfirmar,
  aoCancelar,
  confirmarDisabled,
  botoesFooter,
}: ModalGenericoProps): ReactElement => (
  <Modal show={visivel} onHide={aoCancelar} centered size={size}>
    {titulo && (
     
      <Modal.Header closeButton={!esconderBotaoFechar} className={headerClassName} closeVariant={closeButtonVariant}>
        <Modal.Title className={titleClassName}>{titulo}</Modal.Title>
      </Modal.Header>
    )}
    <Modal.Body>
      {mensagem && <p>{mensagem}</p>}
      {conteudo}
    </Modal.Body>
    <Modal.Footer>
        {botoesFooter ? (
            botoesFooter
        ) : (
            <>
                {aoCancelar && <Button variant="secondary" onClick={aoCancelar}>{textoCancelar}</Button>}
                {aoConfirmar && <Button variant="primary" onClick={aoConfirmar} disabled={confirmarDisabled}>{textoConfirmar}</Button>}
            </>
        )}
    </Modal.Footer>
  </Modal>
);

export default ModalGenerico;
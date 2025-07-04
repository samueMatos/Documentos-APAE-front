import { Row, Col, Image, Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import perfil from '../../assets/css/perfil.png';
import { useNavigate } from 'react-router-dom';

function DetalhesUsuario() {
    const navigate = useNavigate();
    return (
        <Container className="my-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <Button
                  variant="light"
                  onClick={() => navigate(-1)}
                  className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                  style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }}
                  title="Voltar"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                   </svg>
                </Button>
                <h1 className="m-0">Detalhes do Usuário</h1>
            </div>
            <Row className="d-flex flex-lg-row flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Col 
                    className="mx-3 d-flex flex-column align-items-center" 
                    style={{ minHeight: '50vh', flexGrow: 1 }}
                >
                    <Image src={perfil} width={350} rounded className="img-fluid" />
                </Col>

                <Col 
                    className="mx-3 d-flex flex-column" 
                    style={{ minHeight: '50vh', flexGrow: 1 }}
                >
                    <Button variant="primary" className="mb-3">Informações</Button>
                    <Table striped bordered hover responsive className='flex-fill'>
                        <tbody>
                            <tr>
                                <th>Nome</th>
                                <td></td>
                            </tr>
                            <tr>
                                <th>Data de Nascimento</th>
                                <td></td>
                            </tr>
                            <tr>
                                <th>CPF</th>
                                <td></td>
                            </tr>
                            <tr>
                                <th>Endereço</th>
                                <td></td>
                            </tr>
                            <tr>
                                <th>Nome da Mãe</th>
                                <td></td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>

                <Col 
                    className="mx-3 d-flex flex-column" 
                    style={{ minHeight: '50vh', flexGrow: 1 }}
                >
                    <Button variant="primary" className="mb-3">Últimos Arquivos</Button>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Arquivo</th>
                                <th>Data</th>
                                <th>Opções</th>
                            </tr>
                        </thead>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}

export default DetalhesUsuario;

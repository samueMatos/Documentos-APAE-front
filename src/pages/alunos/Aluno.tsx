import { ReactElement, useEffect, useState } from "react";
import { Col, Container, Form, InputGroupProps, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import ModelAluno from "../../models/Aluno";
import InputMask from "react-input-mask";
import SelectEstados from "../../components/alunos/SelectEstados";
import Botao from "../../components/common/Botao";
import {alunoService} from "../../services/alunoService.ts";

/**
 * @description Página de Cadastro de Alunos.
 * @since 25/11/2024
 * @author Lucas Ronchi <@lucas0headshot> & Manuella <@manuela.sventnickas>
 */
const Aluno = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState<boolean>(false);
  const [formData, setFormData] = useState<ModelAluno>({
    nome: '',
    dataNascimento: '',
    cpf: '',
    isAtivo: true,
    telefone: '',
    sexo: '',
    deficiencia: new File([], ''),
    dataEntrada: '',
    observacoes: '',
    endereco: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: 0,
    complemento: '',
    cep: '',
    ibge: ''
  });

  useEffect(() => {
    if (id) {
      fetchAluno();
    }
  }, [id]);

  const fetchAluno = async () => {
    setCarregando(true);

    try {
      const response = await alunoService.listarUmAluno(Number(id));
      console.log(response);
      setFormData((prevData) => ({
        ...prevData,
        ...response,
      }));

      const cep = response.cep.replace(/\D/g, "");
      if (cep.length === 8) {
        const data = await buscarDadosCep(cep);
        if (!data.erro) {
          setFormData((prevData) => ({
            ...prevData,
            estado: data.uf,
            cidade: data.localidade,
            bairro: data.bairro,
            rua: data.logradouro,
            ibge: data.ibge,
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao buscar aluno ou CEP:", err);
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Campo alterado: ${name}, Valor: ${value}`)
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const aplicarMascaraCep = (cep: string): string => {
    return cep.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const buscarDadosCep = async (cep: string) => {
    const response = await api.get(`https://viacep.com.br/ws/${cep}/json/`);
    return response.data;
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const data = await buscarDadosCep(cep);
        if (!data.erro) {
          setFormData({
            ...formData,
            estado: data.uf,
            cidade: data.localidade,
            bairro: data.bairro,
            rua: data.logradouro,
            ibge: data.ibge,
          });
        } else {
          alert("CEP não encontrado");
        }
      } catch (err) {
        console.log("Erro ao buscar CEP:", err);
      }
    } else {
      alert("CEP inválido!");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
    try {
      if (id) {
        await alunoService.atualizarAluno(Number(id), formData);
      } else {
        await alunoService.cadastrarAluno(formData);
      }

      alert(`Aluno ${id ? "editado" : "cadastrado"} com sucesso!`);
      navigate("/alunos");
    } catch (err) {
      console.error("Erro ao realizar POST/PUT em aluno:", err);
    }
  };

  return (
    <Container>
      <h1 className="my-4">{ id ? "Editar" : "Cadastrar" } Aluno</h1>

      {carregando ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
          <Row className="gap-2 p-0 m-0 row-cols-1">
            <Form.Group controlId="nome" as={Col}>
              <Form.Label>Nome</Form.Label>
              <Form.Control type="text" name="nome" minLength={3} value={formData.nome} onChange={handleChange} required placeholder="Digite o nome" />
            </Form.Group>

            <Form.Group controlId="dataNascimento" as={Col}>
              <Form.Label>Data de Nascimento</Form.Label>
              <Form.Control type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} max={new Date().toISOString().split("T")[0]} required />
            </Form.Group>

            <Form.Group controlId="cpf" as={Col}>
              <Form.Label>CPF</Form.Label>
              <InputMask mask="999.999.999-99" value={formData.cpf} onChange={handleChange} >
                {(inputProps: InputGroupProps) => (
                  <Form.Control {...inputProps} type="text" name="cpf" placeholder="Digite o CPF" required />
                )}
              </InputMask>
            </Form.Group>

            <Form.Group controlId="telefone" as={Col}>
              <Form.Label>Telefone</Form.Label>
              <InputMask mask="(99) 99999-9999" value={formData.telefone} onChange={handleChange} >
                {(inputProps: InputGroupProps) => (
                  <Form.Control {...inputProps} type="text" name="telefone" placeholder="Digite o telefone" required />
                )}
              </InputMask>
            </Form.Group>

            <Form.Group controlId="sexo" as={Col}>
              <Form.Label>Sexo</Form.Label>
              <Form.Select name="sexo" value={formData.sexo} onChange={handleChange} required >
                <option selected disabled value="">Selecione o sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="dataEntrada" as={Col}>
              <Form.Label>Data de Entrada</Form.Label>
              <Form.Control type="date" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
            </Form.Group>

            <Form.Group controlId="deficiencia" as={Col}>
              <Form.Label>Deficiência</Form.Label>
              <Form.Control type="data" name="deficiencia" value={formData.deficiencia} onChange={handleChange} placeholder="Digite a deficiência" />
            </Form.Group>

            <Form.Group controlId="observacoes" as={Col}>
              <Form.Label>Observações</Form.Label>
              <Form.Control as="textarea" name="observacoes" value={formData.observacoes} onChange={handleChange} placeholder="Adicione observações" rows={3} />
            </Form.Group>

            <Form.Group controlId="endereco" as={Col}>
              <Form.Label>Endereço</Form.Label>
              <Row className="gap-2">

                <Form.Label>CEP</Form.Label>
                <InputMask
                    mask="99999-999"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: aplicarMascaraCep(e.target.value) })}
                    onBlur={handleCepBlur}
                >
                  {(inputProps) => (
                      <Form.Control
                          {...inputProps}
                          type="text"
                          name="cep"
                          placeholder="Digite o CEP"
                          required
                      />
                  )}
                </InputMask>

                <Col sm={6}>
                  <SelectEstados controlId="estado" value={formData.estado} onChange={handleChange} />
                </Col>

                <Col>
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control type="text" name="cidade" value={formData.cidade} onChange={handleChange} required placeholder="Digite a cidade" />
                </Col>

                <Col>
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control type="text" name="bairro" value={formData.bairro} onChange={handleChange} required placeholder="Digite o bairro" />
                </Col>
              </Row>
              <Row className="gap-2">
                <Col>
                  <Form.Label>Rua</Form.Label>
                  <Form.Control type="text" name="rua" value={formData.rua} onChange={handleChange} required placeholder="Digite a rua" />
                </Col>

                <Col>
                  <Form.Label>Número</Form.Label>
                  <Form.Control type="number" name="numero" value={formData.numero} onChange={handleChange} required min={1} placeholder="Digite o número" />
                </Col>

                <Col>
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control type="text" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Digite o complemento" />
                </Col>
              </Row>
            </Form.Group>
          </Row>

          <div className="d-flex justify-content-center gap-2">
            <Botao texto="Salvar" icone={<></>} type="submit" className="btn-md" />
            <Botao texto="Cancelar" icone={<></>} type="button" variant="secondary" onClick={() => navigate("alunos")} className="btn-md" />
          </div>
        </Form>
      )}
    </Container>
  );
};

export default Aluno;

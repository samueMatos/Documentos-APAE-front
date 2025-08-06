import { ReactElement } from "react";
import { Col, Container, Row, Card as BootstrapCard } from "react-bootstrap";
import { Link } from "react-router-dom";
import { hasAnyPermission } from "../services/auth";


const styles = `
  .home-dashboard {
    background-color: #f4f7fc;
    padding-top: 2rem;
    padding-bottom: 2rem;
    min-height: calc(100vh - 56px); // Ajustar conforme a altura do seu Header
  }

  .welcome-header {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .welcome-header h1 {
    color: var(--azul); // Usando a variável de cor do seu projeto
    font-size: 2rem;
    font-weight: 600;
  }

  .welcome-header p {
    color: #6c757d;
    font-size: 1.1rem;
  }

  .section-title {
    color: #343a40;
    font-weight: 500;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .action-card {
    background-color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
  }

  .action-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    color: inherit;
  }

  .action-card-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex-grow: 1;
  }

  .action-card-icon {
    font-size: 3rem;
    color: var(--azul);
    margin-bottom: 1rem;
    line-height: 1;
  }

  .action-card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #343a40;
    margin-bottom: 0.5rem;
  }

  .action-card-text {
    color: #6c757d;
    font-size: 0.95rem;
    flex-grow: 1;
  }
`;

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  permission: string[];
}

const ActionCard = ({ title, description, icon, link, permission }: ActionCardProps) => {
  if (!hasAnyPermission(permission)) {
    return null;
  }

  return (
    <Col md={6} lg={4} className="mb-4">
      <BootstrapCard as={Link} to={`/${link}`} className="action-card">
        <BootstrapCard.Body className="action-card-body">
          <div className="action-card-icon">
            <i className={`fa-solid ${icon}`}></i>
          </div>
          <BootstrapCard.Title className="action-card-title">{title}</BootstrapCard.Title>
          <BootstrapCard.Text className="action-card-text">{description}</BootstrapCard.Text>
        </BootstrapCard.Body>
      </BootstrapCard>
    </Col>
  );
};


/**
 * @description Página inicial repaginada com um layout de dashboard.
 * @author Gemini
 * @since 04/07/2025
 */
const Home = (): ReactElement => {
  
  const actionCards: ActionCardProps[] = [
    {
      title: "Gerenciar Alunos",
      description: "Cadastre, edite, importe e visualize informações completas dos alunos da instituição.",
      icon: "fa-address-book",
      link: "alunos",
      permission: ["ALUNOS"],
    },
    {
      title: "Gerenciar Documentos",
      description: "Faça o upload, organize e consulte os documentos e laudos vinculados aos alunos.",
      icon: "fa-folder-open",
      link: "documentos",
      permission: ["DOCUMENTOS"],
    },
    {
      title: "Tipos de Documento",
      description: "Crie e gerencie os tipos e prazos de validade dos documentos utilizados no sistema.",
      icon: "fa-file-alt",
      link: "tipo-documento",
      permission: ["TIPO_DOCUMENTO"],
    },
    {
        title: "Gerenciar Usuários",
        description: "Visualize os usuários do sistema, concedendo ou revogando permissões.",
        icon: "fas fa-user-cog",
        link: "usuarios",
        permission: ["GERENCIAR_USUARIO"],
    },
    {
      title: "Grupos e Permissões",
      description: "Administre os grupos de usuários e defina os níveis de acesso a cada módulo.",
      icon: "fa-users-cog",
      link: "admin/grupos",
      permission: ["GRUPOS_PERMISSOES"],
    },
  ];

  return (
    <>
      <style>{styles}</style>
      <Container fluid className="home-dashboard">
        <Row>
          <Col xs={12}>
            <div className="welcome-header">
              <h1>Bem-vindo(a) ao Sistema de Gestão APAE</h1>
              <p>Utilize os cards abaixo para navegar pelas funcionalidades do sistema.</p>
            </div>
          </Col>
        </Row>
        
        <h2 className="section-title">Ações Rápidas</h2>
        <Row>
          {actionCards.map((card, index) => (
            <ActionCard key={index} {...card} />
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Home;
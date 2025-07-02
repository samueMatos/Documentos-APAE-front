import React from 'react';
import { Alert, Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { hasPermission } from '../services/auth';

interface ProtectedRouteProps {
  permission: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission }) => {
  const userHasPermission = hasPermission(permission);

  if (userHasPermission) {
    return <Outlet />;
  }

  return (
    <Container className="mt-5 text-center">
      <Alert variant="danger">
        <Alert.Heading>Acesso Negado</Alert.Heading>
        <p>
          Você não tem a permissão necessária para acessar este módulo.
        </p>
      </Alert>
    </Container>
  );
};

export default ProtectedRoute;
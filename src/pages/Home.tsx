import { ReactElement } from "react";
import "../assets/css/pages/home.css";
import Card from "../components/Home/Card";

// 1. Importe a função de verificação de permissão
import { hasAnyPermission } from "../services/auth";

/**
 * @description Página inicial.
 * @uses components/layout/Layout.tsx
 * @since 31/10/2024
 * @author Lucas Ronchi <@lucas0headshot> & Bruno Jucoski <@brunojucoski>
 */
const Home = (): ReactElement => (
  
    <>
    
        {hasAnyPermission(['DOCUMENTOS']) && (
            <Card titulo="Documentos" icone={<i className="fa-solid fa-folder-open icones"></i>} link="documentos" />
        )}

        {hasAnyPermission(['ALUNOS']) && (
            <Card titulo="Alunos" icone={<i className="fa-solid fa-address-book icones"></i>} link="alunos" />
        )}

        {hasAnyPermission(['TIPO_DOCUMENTO']) && (
            <Card titulo="Tipos de Documento" icone={<i className="fa-solid fa-file-text icones"></i>} link="tipo-documento" />
        )}

        {hasAnyPermission(['GERENCIAR_USUARIO']) && (
            <Card titulo="Cadastro" icone={<i className="fa-solid fa-user-plus icones"></i>} link="cadastrar" />
        )}

        {hasAnyPermission(['GRUPOS_PERMISSOES']) && (
            <Card titulo="Grupo de Usuário" icone={<i className="fa-solid fa-users-cog icones"></i>} link="/admin/grupos" />
        )}
    </>
);

export default Home;
import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../components/layout/Layout";
import HomeAlunos from "../pages/alunos/Home";
import DocumentosPage from "../pages/documentos/DocumentosPage";
import DocumentosCadastro from "../pages/documentos/DocumentosCadastro";
import Aluno from "../pages/alunos/Aluno";
import DetalhesUsuario from "../pages/usuario/DetalhesUsuario";
import GroupListPage from "../pages/group/GroupListPage";
import GroupCreatePage from "../pages/group/GroupCreatePage";
import GroupEditPage from "../pages/group/GroupEditPage";
import HomeTipoDocumento from "../pages/tipo-documento/HomeTipoDocumento";
import FormTipoDocumento from "../pages/tipo-documento/FormTipoDocumento";

/**
 * @description Rotas privadas da App.
 * @since 25/11/2024
 * @author Lucas Ronchi <@lucas0headshot>
 * @see https://dev.to/franklin030601/route-protection-with-react-router-dom-12gm
 */
const RotasPrivadas = (): ReactElement => (
    <Routes>
        <Route path="/" element={<Layout />}>
       
            <Route index element={<Home />} />
            
            
            <Route path="alunos">
                <Route index element={<HomeAlunos />} />
                <Route path="cadastrar" element={<Aluno />} />
                <Route path="editar/:id" element={<Aluno />} />
                <Route path="*" element={<Navigate to="/alunos" replace />} />
            </Route>


            <Route path="tipo-documento">
                <Route index element={<HomeTipoDocumento/>} />
                <Route path="novo" element={<FormTipoDocumento/>} />
                <Route path="editar/:id" element={<FormTipoDocumento/>} />
                <Route path="*" element={<Navigate to="/tipo-documento" replace />} />
            </Route>

        
            <Route path="documentos" element={<DocumentosPage />} />
            <Route path="/cadastrar" element={<DocumentosCadastro />} />
            
        
            <Route path="usuario" element={<DetalhesUsuario />} />

           
            <Route path="admin/grupos">
             
                <Route index element={<GroupListPage />} />
            
                <Route path="novo" element={<GroupCreatePage />} />
              
                <Route path="editar/:id" element={<GroupEditPage />} />
              
                <Route path="*" element={<Navigate to="/admin/grupos" replace />} />
            </Route>

          
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
    </Routes>
);

export default RotasPrivadas;
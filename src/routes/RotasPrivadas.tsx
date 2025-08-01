import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../components/layout/Layout";
import HomeAlunos from "../pages/alunos/Home";
import DetalhesUsuario from "../pages/usuario/DetalhesUsuario";
import GroupListPage from "../pages/group/GroupListPage";
import GroupCreatePage from "../pages/group/GroupCreatePage";
import GroupEditPage from "../pages/group/GroupEditPage";
import HomeTipoDocumento from "../pages/tipo-documento/HomeTipoDocumento";
import ProtectedRoute from "./ProtectedRoute";
import Cadastro from "../pages/usuario/CadastroUsuario";
import GerenciamentoUsuario from "../pages/usuario/GerenciamentoUsuario";
import UsuarioUpdate from "../pages/usuario/UsuarioUpdate";
import HomeDocumentos from "../pages/documentos/HomeDocumentos";

const RotasPrivadas = (): ReactElement => (
    <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
            <Route element={<ProtectedRoute permission="ALUNOS" />}>
                <Route path="alunos">
                    <Route index element={<HomeAlunos />} />
                    <Route path="*" element={<Navigate to="/alunos" replace />} />
                </Route>
            </Route>

        
            <Route element={<ProtectedRoute permission="TIPO_DOCUMENTO" />}>
                <Route path="tipo-documento">
                    <Route index element={<HomeTipoDocumento/>} />
                    <Route path="*" element={<Navigate to="/tipo-documento" replace />} />
                </Route>
            </Route>
            
            <Route element={<ProtectedRoute permission="DOCUMENTOS" />}>
            <Route path="documentos" element={<HomeDocumentos />} />
            </Route>


            <Route element={<ProtectedRoute permission="GERENCIAR_USUARIO" />}>
            <Route path="usuario" element={<DetalhesUsuario />} />
            <Route path="cadastro" element={<Cadastro />} />
            <Route path="usuario/list" element={<GerenciamentoUsuario />} />
            <Route path="usuario/editar/:id" element={<UsuarioUpdate />} />
            </Route>

            <Route element={<ProtectedRoute permission="GRUPOS_PERMISSOES" />}>
                <Route path="admin/grupos">
                    <Route index element={<GroupListPage />} />
                    <Route path="novo" element={<GroupCreatePage />} />
                    <Route path="editar/:id" element={<GroupEditPage />} />
                    <Route path="*" element={<Navigate to="/admin/grupos" replace />} />
                </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
    </Routes>
);

export default RotasPrivadas;
import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../components/layout/Layout";
import HomeAlunos from "../pages/alunos/Home";
import HomeTipoDocumento from "../pages/tipo-documento/HomeTipoDocumento";
import ProtectedRoute from "./ProtectedRoute";
import HomeUsuario from "../pages/usuario/HomeUsuario";
import HomeDocumentos from "../pages/documentos/HomeDocumentos";
import DocsColaboradores from "../pages/documentos/DocsColaboradores";
import DocsInstituicao from "../pages/documentos/DocsInstituicao";
import HomeGroup from "../pages/group/HomeGroup";

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
                <Route path="documentos">
                    <Route index element={<Navigate to="alunos" replace />} />
                    <Route path="alunos" element={<HomeDocumentos />} />
                    <Route path="colaboradores" element={<DocsColaboradores />} />
                    <Route path="instituicao" element={<DocsInstituicao />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute permission="GERENCIAR_USUARIO" />}>
                <Route path="usuarios" element={<HomeUsuario />} />
            </Route>

            {/* Bloco de rotas de grupo ATUALIZADO */}
            <Route element={<ProtectedRoute permission="GRUPOS_PERMISSOES" />}>
                <Route path="admin/grupos">
                    <Route index element={<HomeGroup />} />
                    <Route path="*" element={<Navigate to="/admin/grupos" replace />} />
                </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
    </Routes>
);

export default RotasPrivadas;
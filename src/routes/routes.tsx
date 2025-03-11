import { BrowserRouter, Route, Routes } from "react-router-dom";

import Sample from "../pages/default/index";
import Login from "../pages/Login/index";

//import Products from "../pages/produto"

import '../style/global.css';

import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";


function MainRoutes(){
    enum ID {
        Admin,
        Gestor,
        Funcionario,
        Estagiario
    }

    return(
        <BrowserRouter>
            <Routes>
                {/* Rota de Login */}
                <Route path="/" element={<Login />} />
                <Route path="/cadastro" element={<Login />} />
                
                {/* Rotas com layout */}
                <Route element={<Layout />}>
                    {/* Rota protótipo */}
                    <Route path="/hi" element={<Sample />}/>
                    {/* Rotas protegidas */}
                    <Route path="/inicio" element={<ProtectedRoute allowedRoles={[ID.Admin, ID.Funcionario]}><Sample /></ProtectedRoute>}/>
                    <Route path="/horas" element={<ProtectedRoute allowedRoles={[ID.Admin, ID.Funcionario]}><Sample /></ProtectedRoute>}/>
                    <Route path="/ausencias" element={<ProtectedRoute allowedRoles={[ID.Admin]}><Sample /></ProtectedRoute>}/>
                    <Route path="/falhas" element={<ProtectedRoute allowedRoles={[ID.Admin]}><Sample /></ProtectedRoute>}/>
                    <Route path="/colaboradores" element={<ProtectedRoute allowedRoles={[ID.Admin]}><Sample /></ProtectedRoute>}/>
                    <Route path="/calendario" element={<ProtectedRoute allowedRoles={[ID.Admin]}><Sample /></ProtectedRoute>}/>
                    <Route path="/solicitacoes" element={<ProtectedRoute allowedRoles={[ID.Admin, ID.Funcionario]}><Sample /></ProtectedRoute>}/>
                    <Route path="/espelho" element={<ProtectedRoute allowedRoles={[ID.Admin, ID.Funcionario]}><Sample /></ProtectedRoute>}/>
                    <Route path="/jornada" element={<ProtectedRoute allowedRoles={[ID.Admin]}><Sample /></ProtectedRoute>}/>
                    <Route path="/pendencias" element={<ProtectedRoute allowedRoles={[ID.Funcionario]}><Sample /></ProtectedRoute>}/>
                    


                </Route>

                {/* Rota de não autorizado */}
                <Route path="/unauthorized" element={<div>Não autorizado</div>} />
            </Routes>
        </BrowserRouter>
    )
}

export default MainRoutes

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Widgets from "./pages/Widgets";
import ApiPlayground from "./pages/ApiPlayground";
import EmployeeManagement from "./pages/EmployeeManagement";
import SqlPlayground from "./pages/SqlPlayground";
import Repository from "./pages/Repository";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/widgets" element={<Widgets />} />
          <Route path="/api" element={<ApiPlayground />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/repositories" element={<Repository />} />
          <Route path="/sql" element={<SqlPlayground />} />
          <Route path="/admin" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import Widgets from "./pages/Widgets";
import ApiPlayground from "./pages/ApiPlayground";
import EmployeeManagement from "./pages/EmployeeManagement";
import SqlPlayground from "./pages/SqlPlayground";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/widgets" element={<Widgets />} />
          <Route path="/api" element={<ApiPlayground />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/sql" element={<SqlPlayground />} />
          <Route path="/admin" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
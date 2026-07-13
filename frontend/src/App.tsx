import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import Widgets from "./pages/Widgets";
import ApiPlayground from "./pages/ApiPlayground";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/widgets" element={<Widgets />} />
        <Route path="/api" element={<ApiPlayground />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
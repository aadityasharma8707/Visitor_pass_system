import { Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import VisitorRequest from "./pages/VisitorRequest";
import HostDashboard from "./pages/HostDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import AdminDashboard from "./pages/AdminDashboard"; 

function App() {

  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="app">
      <h2>Visitor Pass System</h2>

      <nav>
        <div>
          <NavLink to="/">Visitor</NavLink>
          <NavLink to="/host">Host</NavLink>
          <NavLink to="/security">Security</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </div>

        <div
          className="theme-switch"
          onClick={() => setDark(!dark)}
        >
          <div className="theme-knob"></div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<VisitorRequest />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/security" element={<SecurityDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
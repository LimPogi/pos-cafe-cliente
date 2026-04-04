import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Cashier from './pages/Cashier';
<Route path="/cashier" element={<Cashier />} />
// A simple helper to protect routes based on login status
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Only Admins can see this */}
        <Route path="/admin" element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Only Cashiers (and Admins) can see this */}
        <Route path="/cashier" element={
          <ProtectedRoute>
            <Cashier />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
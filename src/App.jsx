import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Cashier from './pages/Cashier';

// Improved Helper to protect routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role')?.toLowerCase(); // Standardize to lowercase

  // 1. If no token, kick them back to login
  if (!token) return <Navigate to="/" />;

  // 2. If roles are specified, check if the user's role is in the allowed list
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Login Page */}
        <Route path="/" element={<Login />} />
        
        {/* 2. Admin Only Route (Looking for 'admin') */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 3. Cashier Route (Accessible by both 'cashier' and 'admin') */}
        <Route path="/cashier" element={
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <Cashier />
          </ProtectedRoute>
        } />

        {/* 4. Catch-all: Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
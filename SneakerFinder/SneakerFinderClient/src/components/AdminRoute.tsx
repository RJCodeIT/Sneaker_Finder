import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, userData } = useAuth();

  if (!isAuthenticated || !userData) {
    return <Navigate to="/sneakerFinder/login" replace />;
  }

  if (userData.role !== 'admin') {
    return <Navigate to="/sneakerFinder" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

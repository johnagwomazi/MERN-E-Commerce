import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import { getStoredAuthToken } from '@/utils/authStorage';

const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const bootstrapping = useAppStore((state) => state.bootstrapping);
  const hasStoredToken = Boolean(token || getStoredAuthToken());

  if (bootstrapping || (hasStoredToken && !user)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!hasStoredToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

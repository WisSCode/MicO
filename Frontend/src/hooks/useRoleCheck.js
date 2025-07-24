import { useContext } from 'react';
import { UserContext } from './UserContext';

export const useRoleCheck = () => {
  const { user } = useContext(UserContext);

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const hasAnyRole = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!(token && user);
  };

  const getUserRole = () => {
    return user?.role || null;
  };

  const isUsuarioNormal = () => hasRole('usuarionormal');
  const isRepartidor = () => hasRole('repartidor');
  const isEmpresa = () => hasRole('empresa');
  const isAdmin = () => hasRole('admin');

  return {
    hasRole,
    hasAnyRole,
    isAuthenticated,
    getUserRole,
    isUsuarioNormal,
    isRepartidor,
    isEmpresa,
    isAdmin,
    user
  };
};

export default useRoleCheck;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';

const ProtectedRoutes = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('das');

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 54000);

  useTimer({
    expiryTimestamp,
    onExpire: () => {
      localStorage.removeItem('das');
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('name');
      window.location.reload();
    }
  });

  if (!isAuthenticated) {
    navigate('/');
    return null; // or a loading indicator, or some other fallback UI
  }

  return children;
};

export default ProtectedRoutes;

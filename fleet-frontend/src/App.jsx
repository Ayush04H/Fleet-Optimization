import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TelematicsMap from './pages/TelematicsMap';
import Vehicles from './pages/Vehicles';
import Assignments from './pages/Assignments';
import Drivers from './pages/Drivers';
import RoutesConfig from './pages/Routes';
import { ToastProvider, useToast } from './components/ui/Toast';
import { apiEventBus } from './api/axiosConfig';
import { wsService } from './api/websocket';

const GlobalListener = () => {
  const { addToast } = useToast();
  
  useEffect(() => {
    // Connect WebSockets when App starts
    wsService.connect();
    
    // Listen for global Axios errors
    const handleApiError = (data) => {
      addToast(data.message, data.type || 'error', data.title);
    };
    
    apiEventBus.on('api_error', handleApiError);
    
    return () => {
      wsService.disconnect();
    };
  }, [addToast]);
  
  return null;
};

function App() {
  return (
    <ToastProvider>
      <GlobalListener />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="map" element={<TelematicsMap />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="routes" element={<RoutesConfig />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;

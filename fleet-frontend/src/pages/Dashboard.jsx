import React, { useState, useEffect } from 'react';
import { Truck, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig';
import { wsService } from '../api/websocket';
import './Dashboard.css';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  const fetchData = async () => {
    try {
      const vehRes = await api.get('/vehicles');
      setVehicles(vehRes.data);
      
      const assRes = await api.get('/assignments').catch(() => ({ data: [] }));
      const active = assRes.data.filter(a => a.status === 'ACTIVE');
      setActiveAssignments(active);
      
      setLiveEvents(prev => prev.length > 0 ? prev : assRes.data.slice(0, 8).map(a => ({
        id: a.id,
        status: a.status || 'ACTIVE',
        timestamp: new Date(a.date || Date.now()),
        delayReason: a.delayReason
      })));
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  useEffect(() => {
    fetchData();
    
    const unsubscribe = wsService.subscribeToAlerts((payload) => {
      setLiveEvents(prev => [
        { id: Date.now(), ...payload, timestamp: new Date() },
        ...prev
      ].slice(0, 10));
      
      fetchData(); 
    });

    return () => unsubscribe();
  }, []);

  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE_REQUIRED').length;
  const totalProfit = vehicles.reduce((sum, v) => sum + (v.netProfit || 0), 0);

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Fleet Dashboard</h1>
      <p className="page-subtitle">Real-time overview of your fleet operations</p>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(36, 95, 115, 0.1)', color: 'var(--primary-color)' }}>
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <h4>Active Trucks</h4>
            <h2>{activeVehicles}</h2>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(115, 62, 36, 0.1)', color: 'var(--accent-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-content">
            <h4>Needs Maintenance</h4>
            <h2>{maintenanceVehicles}</h2>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h4>Total Fleet Profit</h4>
            <h2>${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(187, 189, 188, 0.2)', color: 'var(--text-secondary)' }}>
            <Truck size={24} />
          </div>
          <div className="metric-content">
            <h4>Total Fleet</h4>
            <h2>{vehicles.length}</h2>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content-grid">
        <div className="card">
          <h3>Fleet Status Overview</h3>
          <div className="overview-content">
             <div className="progress-bar-container">
               <div className="progress-bar-fill bg-primary" style={{ width: `${(activeVehicles / (vehicles.length || 1)) * 100}%` }}></div>
             </div>
             <p className="text-sm">
               {((activeVehicles / (vehicles.length || 1)) * 100).toFixed(1)}% of fleet is currently on the road.
             </p>
          </div>
          
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Active Assignments</h3>
          <div>
             {activeAssignments.length === 0 ? (
               <p className="empty-state" style={{ padding: '1rem 0' }}>No trucks currently on the road.</p>
             ) : (
               <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {activeAssignments.map(a => (
                   <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: '4px' }}>
                     <span>Truck #{a.vehicle?.id} &rarr; {a.route?.endLocation}</span>
                     <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>En Route</span>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
        
        <div className="card stream-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <h3>Live Telematics Stream</h3>
            <span className="live-dot"></span>
          </div>
          
          <div className="live-stream-container">
            {liveEvents.length === 0 ? (
              <p className="empty-state">Waiting for incoming telemetry data...</p>
            ) : (
              <ul className="live-events-list">
                {liveEvents.map(event => (
                  <li key={event.id} className="live-event-item">
                    <div className="event-time">{event.timestamp.toLocaleTimeString()}</div>
                    <div className="event-details">
                      <span className={`badge badge-${(event.status || 'info').toLowerCase()}`}>{event.status || 'UPDATE'}</span>
                      {event.delayReason ? (
                        <span className="event-alert">{event.delayReason}</span>
                      ) : (
                        <span className="event-info">Assignment #{event.id} updated</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import api from '../api/axiosConfig';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown data
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Form State
  const [userId, setUserId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [date, setDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assRes, usrRes, vehRes, rtsRes] = await Promise.all([
        api.get('/assignments').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/vehicles/available').catch(() => ({ data: [] })),
        api.get('/routes').catch(() => ({ data: [] }))
      ]);
      setAssignments(assRes.data || []);
      setUsers(usrRes.data || []);
      setVehicles(vehRes.data || []);
      setRoutes(rtsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!userId || !vehicleId || !routeId || !date) return;
    
    try {
      await api.post('/assignments', {
        userId: parseInt(userId),
        vehicleId: parseInt(vehicleId),
        routeId: parseInt(routeId),
        date
      });
      
      // Reset form
      setUserId('');
      setVehicleId('');
      setRouteId('');
      setDate('');
      fetchData(); // Refresh everything
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to dispatch assignment');
    }
  };
  
  const handleComplete = async (id) => {
    try {
      await api.put(`/assignments/${id}/complete`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to complete route');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Dispatch drivers and monitor active routes</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        {/* Dispatch Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>New Dispatch</h3>
          <form onSubmit={handleDispatch}>
            <div className="form-group">
              <label className="form-label">Driver</label>
              <select className="form-control" value={userId} onChange={e => setUserId(e.target.value)} required>
                <option value="" disabled>Select a driver...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} (ID: {u.id})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Available Vehicle</label>
              <select className="form-control" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                <option value="" disabled>Select a vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>Truck #{v.id} (Cap: {v.capacity}kg)</option>
                ))}
              </select>
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Only IDLE vehicles shown.</small>
            </div>
            <div className="form-group">
              <label className="form-label">Route</label>
              <select className="form-control" value={routeId} onChange={e => setRouteId(e.target.value)} required>
                <option value="" disabled>Select a route...</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.startLocation} to {r.endLocation} ({r.distance}km)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Dispatch Truck
            </button>
          </form>
        </div>
        
        {/* Active Dispatch Board */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)' }}>
             <h3 style={{ margin: 0 }}>Active Dispatch Board</h3>
          </div>
          {loading ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td>{a.user?.name || `ID: ${a.user?.id}` || 'N/A'}</td>
                      <td>Truck #{a.vehicle?.id || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${a.status.toLowerCase()}`}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        {a.status === 'ACTIVE' && (
                          <button className="btn btn-accent" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleComplete(a.id)}>
                             <Play size={14} style={{ marginRight: '4px' }} /> Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        No active assignments. Dispatches will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignments;

import React, { useState, useEffect } from 'react';
import { Map, MapPin } from 'lucide-react';
import api from '../api/axiosConfig';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [requiredCapacity, setRequiredCapacity] = useState('');

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/routes');
      setRoutes(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!startLocation || !endLocation || !distance || !requiredCapacity) return;
    
    try {
      await api.post('/routes', { 
        startLocation, 
        endLocation, 
        distance: parseFloat(distance), 
        requiredCapacity: parseFloat(requiredCapacity) 
      });
      setStartLocation('');
      setEndLocation('');
      setDistance('');
      setRequiredCapacity('');
      fetchRoutes();
    } catch (error) {
      // Handled globally
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 className="page-title">Routes Configuration</h1>
          <p className="page-subtitle">Manage service locations and distance metrics</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        {/* Add Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <MapPin size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Create Route</h3>
          </div>
          <form onSubmit={handleAddRoute}>
            <div className="form-group">
              <label className="form-label">Start Location</label>
              <input type="text" className="form-control" value={startLocation} onChange={e => setStartLocation(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Location (City)</label>
              <input type="text" className="form-control" placeholder="e.g. London" value={endLocation} onChange={e => setEndLocation(e.target.value)} required />
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Must be a real city for Open-Meteo Weather API</small>
            </div>
            <div className="form-group">
              <label className="form-label">Distance (km)</label>
              <input type="number" step="0.1" className="form-control" value={distance} onChange={e => setDistance(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Required Capacity (kg)</label>
              <input type="number" step="0.1" className="form-control" value={requiredCapacity} onChange={e => setRequiredCapacity(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Add Route
            </button>
          </form>
        </div>
        
        {/* Data Grid */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Map size={20} color="var(--text-secondary)" />
             <h3 style={{ margin: 0 }}>Available Routes</h3>
          </div>
          {loading ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Path</th>
                    <th>Distance</th>
                    <th>Capacity Req.</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map(r => (
                    <tr key={r.id}>
                      <td><strong>#{r.id}</strong></td>
                      <td>{r.startLocation} &rarr; {r.endLocation}</td>
                      <td>{r.distance?.toLocaleString()} km</td>
                      <td>{r.requiredCapacity?.toLocaleString()} kg</td>
                    </tr>
                  ))}
                  {routes.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        No routes found.
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

export default Routes;

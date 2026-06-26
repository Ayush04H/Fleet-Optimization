import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Wrench, Truck, X } from 'lucide-react';
import api from '../api/axiosConfig';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [capacity, setCapacity] = useState('');
  const [maintenanceThreshold, setMaintenanceThreshold] = useState('');
  const [baseCostPerKm, setBaseCostPerKm] = useState('');
  const [revenuePerKm, setRevenuePerKm] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleMaintenance = async (id) => {
    try {
      await api.put(`/vehicles/${id}/maintenance`);
      fetchVehicles();
    } catch (error) {
      // Toast handles error
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!capacity || !maintenanceThreshold || !baseCostPerKm || !revenuePerKm) return;
    
    try {
      await api.post('/vehicles', {
        capacity: parseFloat(capacity),
        maintenanceThreshold: parseFloat(maintenanceThreshold),
        baseCostPerKm: parseFloat(baseCostPerKm),
        revenuePerKm: parseFloat(revenuePerKm)
      });
      // Reset
      setCapacity('');
      setMaintenanceThreshold('');
      setBaseCostPerKm('');
      setRevenuePerKm('');
      setShowAddForm(false);
      fetchVehicles();
    } catch (error) {
      // Toast handles error
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">Manage your fleet and track maintenance</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button className="btn" onClick={fetchVehicles} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
            <RefreshCw size={16} style={{ marginRight: '8px' }} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <X size={16} style={{ marginRight: '8px' }} /> : <Plus size={16} style={{ marginRight: '8px' }} />}
            {showAddForm ? 'Cancel' : 'Add Vehicle'}
          </button>
        </div>
      </div>
      
      {showAddForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)', animation: 'slideInLeft 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Truck size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Register New Vehicle</h3>
          </div>
          <form onSubmit={handleAddVehicle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Capacity (kg)</label>
              <input type="number" step="0.1" className="form-control" value={capacity} onChange={e => setCapacity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Maintenance Threshold (km)</label>
              <input type="number" step="0.1" className="form-control" value={maintenanceThreshold} onChange={e => setMaintenanceThreshold(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Base Cost per Km ($)</label>
              <input type="number" step="0.01" className="form-control" value={baseCostPerKm} onChange={e => setBaseCostPerKm(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Revenue per Km ($)</label>
              <input type="number" step="0.01" className="form-control" value={revenuePerKm} onChange={e => setRevenuePerKm(e.target.value)} required />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Save Vehicle</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Capacity (kg)</th>
                  <th>Odometer (km)</th>
                  <th>Profit ($)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td><strong>#{v.id}</strong></td>
                    <td>{v.capacity?.toLocaleString()} kg</td>
                    <td>
                      {v.currentMileage?.toLocaleString()} / {v.maintenanceThreshold?.toLocaleString()}
                    </td>
                    <td style={{ color: (v.netProfit || 0) < 0 ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                      ${(v.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge badge-${v.status.toLowerCase()}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {v.status === 'MAINTENANCE_REQUIRED' && (
                        <button 
                          className="btn btn-accent" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleMaintenance(v.id)}
                        >
                          <Wrench size={14} style={{ marginRight: '4px' }} /> Fix
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;

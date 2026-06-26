import React, { useState, useEffect } from 'react';
import { UserPlus, Users } from 'lucide-react';
import api from '../api/axiosConfig';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setDrivers(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!name) return;
    
    try {
      await api.post('/users', { name });
      setName('');
      fetchDrivers();
    } catch (error) {
      // Handled globally
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 className="page-title">Drivers Directory</h1>
          <p className="page-subtitle">Manage personnel and driver profiles</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        {/* Add Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <UserPlus size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Onboard Driver</h3>
          </div>
          <form onSubmit={handleAddDriver}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. John Doe"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Add Driver
            </button>
          </form>
        </div>
        
        {/* Data Grid */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Users size={20} color="var(--text-secondary)" />
             <h3 style={{ margin: 0 }}>Active Drivers</h3>
          </div>
          {loading ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Driver ID</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(d => (
                    <tr key={d.id}>
                      <td><strong>#{d.id}</strong></td>
                      <td>{d.name}</td>
                    </tr>
                  ))}
                  {drivers.length === 0 && (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        No drivers found.
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

export default Drivers;

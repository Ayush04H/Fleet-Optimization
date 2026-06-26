import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axiosConfig';
import { geocodeCity } from '../api/geocoder';
import './Dashboard.css'; // Reusing some base styles

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom generic truck icon
const truckIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23245F73" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const TelematicsMap = () => {
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);

  const fetchMapData = async () => {
    try {
      const assRes = await api.get('/assignments').catch(() => ({ data: [] }));
      const active = assRes.data.filter(a => a.status === 'ACTIVE');
      setActiveAssignments(active);
      
      const markerData = [];
      for (const assignment of active) {
        if (assignment.route) {
          const start = await geocodeCity(assignment.route.startLocation);
          const end = await geocodeCity(assignment.route.endLocation);
          if (start && end) {
            const midLat = (start.lat + end.lat) / 2;
            const midLon = (start.lon + end.lon) / 2;
            
            markerData.push({
              assignmentId: assignment.id,
              vehicleId: assignment.vehicle?.id,
              driverName: assignment.user?.name,
              routeObj: assignment.route,
              startCoords: [start.lat, start.lon],
              endCoords: [end.lat, end.lon],
              currentCoords: [midLat, midLon]
            });
          }
        }
      }
      setMapMarkers(markerData);
    } catch (error) {
      console.error("Failed to fetch map data", error);
    }
  };

  useEffect(() => {
    fetchMapData();
    // Setting up a polling interval for the map specifically
    const interval = setInterval(() => {
      fetchMapData();
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <div>
          <h1 className="page-title">Live Telematics</h1>
          <p className="page-subtitle">Real-time geographical tracking of active fleet operations</p>
        </div>
        <div>
          <span className="badge badge-active">{activeAssignments.length} Active Routes</span>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0, flex: 1, overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <MapContainer center={[48.8566, 2.3522]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mapMarkers.map(m => (
            <React.Fragment key={m.assignmentId}>
              <Polyline positions={[m.startCoords, m.endCoords]} color="var(--primary-color)" weight={3} opacity={0.6} dashArray="5, 10" />
              <Marker position={m.startCoords}>
                <Popup>Start: {m.routeObj.startLocation}</Popup>
              </Marker>
              <Marker position={m.endCoords}>
                <Popup>Destination: {m.routeObj.endLocation}</Popup>
              </Marker>
              <Marker position={m.currentCoords} icon={truckIcon}>
                <Popup>
                  <strong>Truck #{m.vehicleId}</strong><br/>
                  Driver: {m.driverName}<br/>
                  En route to {m.routeObj.endLocation}
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TelematicsMap;

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RiskZonesControl, RiskZonesLegend } from './RiskZonesLayer';

// Fix for default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon creator
const createCustomIcon = (color, emoji, size = 28) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: ${size > 30 ? 20 : 14}px; border: 2px solid white;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const ICONS = {
  school: createCustomIcon('#eab308', '🏫', 26),
  school_secondary: createCustomIcon('#f59e0b', '🎓', 26),
  bus_stop: createCustomIcon('#3b82f6', '🚌', 22),
  train_station: createCustomIcon('#ef4444', '🚉', 30),
  tram_stop: createCustomIcon('#10b981', '🚊', 26),
  religion: createCustomIcon('#a855f7', '⛪', 22),
  religion_mosque: createCustomIcon('#059669', '🕌', 22),
  religion_temple: createCustomIcon('#d97706', '🛕', 22),
  religion_synagogue: createCustomIcon('#6366f1', '🕍', 22),
  supermarket: createCustomIcon('#10b981', '🛒'),
  park: createCustomIcon('#22c55e', '🌲'),
  cafe: createCustomIcon('#f97316', '☕'),
  health: createCustomIcon('#ef4444', '🏥')
};

function ChangeView({ center, boundary, schoolZone }) {
  const map = useMap();
  React.useEffect(() => {
    if (schoolZone && schoolZone.geojson) {
      try {
        const geoJsonLayer = L.geoJSON(schoolZone.geojson);
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      } catch (e) {
        console.error("Invalid school zone bounds", e);
      }
    } else if (boundary) {
      try {
        const geoJsonLayer = L.geoJSON(boundary);
        map.fitBounds(geoJsonLayer.getBounds());
      } catch (e) {
        console.error("Invalid boundary bounds", e);
      }
    } else if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 14);
    }
  }, [center, boundary, map, schoolZone]);
  return null;
}

export function AmenityMap({ 
  center, 
  amenities, 
  boundary, 
  schools, 
  transitStops, 
  schoolZone, 
  religions, 
  onMarkerClick,
  bushfireZones,
  floodZones 
}) {
  const [showBushfire, setShowBushfire] = React.useState(false);
  const [showFlood, setShowFlood] = React.useState(false);

  if (!center || !center.lat || !center.lng) {
    return <div className="map-placeholder">Location data not available</div>;
  }

  // Generate sample risk zones relative to center if no real data provided
  const generateSampleBushfireZones = () => {
    const { lat, lng } = center;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { riskLevel: "high", name: "Bushfire Prone Area - North", source: "State Fire Authority" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lng - 0.03, lat + 0.01],
              [lng - 0.01, lat + 0.01],
              [lng - 0.01, lat + 0.025],
              [lng - 0.03, lat + 0.025],
              [lng - 0.03, lat + 0.01]
            ]]
          }
        },
        {
          type: "Feature",
          properties: { riskLevel: "medium", name: "Bushfire Management Overlay", source: "Planning Dept" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lng + 0.01, lat - 0.01],
              [lng + 0.03, lat - 0.01],
              [lng + 0.03, lat + 0.005],
              [lng + 0.01, lat + 0.005],
              [lng + 0.01, lat - 0.01]
            ]]
          }
        },
        {
          type: "Feature",
          properties: { riskLevel: "low", name: "Low Risk Buffer Zone", source: "Planning Dept" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lng - 0.02, lat - 0.02],
              [lng + 0.005, lat - 0.02],
              [lng + 0.005, lat - 0.01],
              [lng - 0.02, lat - 0.01],
              [lng - 0.02, lat - 0.02]
            ]]
          }
        }
      ]
    };
  };

  const generateSampleFloodZones = () => {
    const { lat, lng } = center;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { riskLevel: "high", name: "Flood Prone Area", source: "Water Authority", aep: "1%" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lng - 0.015, lat - 0.015],
              [lng + 0.005, lat - 0.015],
              [lng + 0.005, lat - 0.005],
              [lng - 0.015, lat - 0.005],
              [lng - 0.015, lat - 0.015]
            ]]
          }
        },
        {
          type: "Feature",
          properties: { riskLevel: "medium", name: "Overland Flow Path", source: "Water Authority", aep: "0.5%" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lng + 0.005, lat - 0.025],
              [lng + 0.02, lat - 0.025],
              [lng + 0.02, lat - 0.015],
              [lng + 0.005, lat - 0.015],
              [lng + 0.005, lat - 0.025]
            ]]
          }
        }
      ]
    };
  };

  const bushfireData = bushfireZones || generateSampleBushfireZones();
  const floodData = floodZones || generateSampleFloodZones();

  const markers = [];
  
   // Standard amenities
   if (amenities) {
     Object.entries(amenities).forEach(([category, items]) => {
       if (items && Array.isArray(items)) {
         items.forEach((item) => {
           const lng = item.lng || item.lon;
           if (item.lat && lng) {
             markers.push({ ...item, lng, category });
           }
         });
       }
     });
   }
   
   // Religious markers
   if (religions && Array.isArray(religions)) {
     religions.forEach((place) => {
       const lng = place.lng || place.lon;
       if (place.lat && lng) {
         const religion = (place.religion || '').toLowerCase();
         let category = 'religion';
         if (religion.includes('islam') || religion.includes('muslim')) category = 'religion_mosque';
         else if (religion.includes('hindu')) category = 'religion_temple';
         else if (religion.includes('jewish') || religion.includes('judaism')) category = 'religion_synagogue';
         markers.push({ ...place, lng, category });
       }
     });
   }
   
   // School markers
   if (schools && Array.isArray(schools)) {
     schools.forEach((school) => {
       const lng = school.lng || school.lon;
       if (school.lat && lng) {
         markers.push({
           ...school,
           lng,
           category: school.type === 'Primary' ? 'school' : 'school_secondary'
         });
       }
     });
   }
   
   // Transit stop markers
   if (transitStops && Array.isArray(transitStops)) {
     transitStops.forEach((stop) => {
       const lng = stop.lng || stop.lon;
       if (stop.lat && lng) {
         markers.push({
           ...stop,
           lng,
           category: stop.category || 'bus_stop'
         });
       }
     });
   }

   return (
    <div className="map-wrapper">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={14} 
        style={{ height: '600px', width: '100%', borderRadius: '12px', zIndex: 1 }}
      >
        <ChangeView center={center} boundary={boundary} schoolZone={schoolZone} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {boundary && (
          <GeoJSON 
            data={boundary} 
            style={{
              color: 'var(--primary-color, #2563eb)',
              weight: 2,
              opacity: 0.8,
              fillColor: 'var(--primary-color, #2563eb)',
              fillOpacity: 0.1
            }} 
          />
        )}

        {schoolZone && schoolZone.geojson && (
          <GeoJSON 
            key={schoolZone.name + (schoolZone.type || '')}
            data={schoolZone.geojson} 
            style={() => {
              const color = schoolZone.type === 'Secondary' ? '#8b5cf6' : '#3b82f6';
              return {
                fillColor: color,
                fillOpacity: 0.2,
                color: color,
                weight: 3,
                dashArray: '5 5'
              };
            }}
          />
        )}

        {/* Bushfire Risk Zones */}
        {showBushfire && (
          <GeoJSON 
            data={bushfireData}
            style={(feature) => {
              const riskLevel = feature?.properties?.riskLevel || 'low';
              const colors = {
                low: { fill: '#fef3c7', stroke: '#f59e0b' },
                medium: { fill: '#fed7aa', stroke: '#f97316' },
                high: { fill: '#fecaca', stroke: '#ef4444' },
                extreme: { fill: '#fca5a5', stroke: '#dc2626' }
              };
              const c = colors[riskLevel] || colors.low;
              return {
                fillColor: c.fill,
                fillOpacity: 0.4,
                color: c.stroke,
                weight: 2,
                dashArray: '5 5'
              };
            }}
            onEachFeature={(feature, layer) => {
              const props = feature.properties;
              layer.bindPopup(`
                <div style="min-width: 200px;">
                  <strong>${props.name || 'Bushfire Zone'}</strong>
                  <hr style="margin: 8px 0;" />
                  <div style="font-size: 12px;">
                    <div><strong>Type:</strong> 🔥 Bushfire Risk</div>
                    <div><strong>Risk Level:</strong> ${props.riskLevel || 'N/A'}</div>
                    <div><strong>Source:</strong> ${props.source || 'N/A'}</div>
                  </div>
                </div>
              `);
            }}
          />
        )}

        {/* Flood Risk Zones */}
        {showFlood && (
          <GeoJSON 
            data={floodData}
            style={(feature) => {
              const riskLevel = feature?.properties?.riskLevel || 'low';
              const colors = {
                low: { fill: '#dbeafe', stroke: '#3b82f6' },
                medium: { fill: '#bfdbfe', stroke: '#2563eb' },
                high: { fill: '#93c5fd', stroke: '#1d4ed8' },
                extreme: { fill: '#60a5fa', stroke: '#1e40af' }
              };
              const c = colors[riskLevel] || colors.low;
              return {
                fillColor: c.fill,
                fillOpacity: 0.4,
                color: c.stroke,
                weight: 2
              };
            }}
            onEachFeature={(feature, layer) => {
              const props = feature.properties;
              layer.bindPopup(`
                <div style="min-width: 200px;">
                  <strong>${props.name || 'Flood Zone'}</strong>
                  <hr style="margin: 8px 0;" />
                  <div style="font-size: 12px;">
                    <div><strong>Type:</strong> 🌊 Flood Risk</div>
                    <div><strong>Risk Level:</strong> ${props.riskLevel || 'N/A'}</div>
                    ${props.aep ? `<div><strong>AEP:</strong> ${props.aep}</div>` : ''}
                    <div><strong>Source:</strong> ${props.source || 'N/A'}</div>
                  </div>
                </div>
              `);
            }}
          />
        )}

        {markers.map((marker, idx) => {
          const icon = ICONS[marker.category] || ICONS.park;
          return (
            <Marker 
              key={idx} 
              position={[marker.lat, marker.lng]} 
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(marker);
                }
              }}
            >
              <Popup>
                <strong>{marker.name}</strong><br />
                <span className="text-sm text-gray-600 capitalize">{marker.category.replace('_', ' ')}</span>
                {marker.distance_km && <span className="text-xs"> • {marker.distance_km} km</span>}
                {marker.type && <span className="text-xs"> • {marker.type}</span>}
              </Popup>
            </Marker>
          );
        })}

        {/* Risk Zones Control Panel */}
        <RiskZonesControl
          showBushfire={showBushfire}
          showFlood={showFlood}
          onToggleBushfire={setShowBushfire}
          onToggleFlood={setShowFlood}
        />
      </MapContainer>
      
      <div className="map-legend">
        <span><span className="legend-dot" style={{background:'#eab308'}}></span> Primary School</span>
        <span><span className="legend-dot" style={{background:'#f59e0b'}}></span> Secondary School</span>
        <span><span className="legend-dot" style={{background:'#3b82f6'}}></span> Bus Stop</span>
        <span><span className="legend-dot" style={{background:'#ef4444'}}></span> Train Station</span>
        <span><span className="legend-dot" style={{background:'#a855f7'}}></span> Place of Worship</span>
        <span><span className="legend-dot" style={{background:'#10b981'}}></span> Supermarket</span>
      </div>
      
      {/* Risk Zones Legend */}
      <RiskZonesLegend showBushfire={showBushfire} showFlood={showFlood} />
    </div>
  );
}

import React from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Risk zone color configurations
const RISK_COLORS = {
  bushfire: {
    low: { fill: '#fef3c7', stroke: '#f59e0b', label: 'Low Risk' },
    medium: { fill: '#fed7aa', stroke: '#f97316', label: 'Medium Risk' },
    high: { fill: '#fecaca', stroke: '#ef4444', label: 'High Risk' },
    extreme: { fill: '#fca5a5', stroke: '#dc2626', label: 'Extreme Risk' }
  },
  flood: {
    low: { fill: '#dbeafe', stroke: '#3b82f6', label: 'Low Risk (1% AEP)' },
    medium: { fill: '#bfdbfe', stroke: '#2563eb', label: 'Medium Risk (0.5% AEP)' },
    high: { fill: '#93c5fd', stroke: '#1d4ed8', label: 'High Risk (0.2% AEP)' },
    extreme: { fill: '#60a5fa', stroke: '#1e40af', label: 'Extreme Risk' }
  }
};

// Sample bushfire risk zones (GeoJSON format)
// In production, this would come from government data sources
const SAMPLE_BUSHFIRE_ZONES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        riskLevel: "high",
        name: "Bushfire Prone Area - North",
        source: "CFA/DELWP"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [145.05, -37.80],
          [145.08, -37.80],
          [145.08, -37.78],
          [145.05, -37.78],
          [145.05, -37.80]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        riskLevel: "medium",
        name: "Bushfire Management Overlay",
        source: "CFA/DELWP"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [145.08, -37.82],
          [145.12, -37.82],
          [145.12, -37.80],
          [145.08, -37.80],
          [145.08, -37.82]
        ]]
      }
    }
  ]
};

// Sample flood risk zones (GeoJSON format)
const SAMPLE_FLOOD_ZONES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        riskLevel: "high",
        name: "Flood Prone Area",
        source: "Melbourne Water",
        aep: "1%"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [145.02, -37.82],
          [145.05, -37.82],
          [145.05, -37.80],
          [145.02, -37.80],
          [145.02, -37.82]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        riskLevel: "medium",
        name: "Overland Flow Path",
        source: "Melbourne Water",
        aep: "0.5%"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [145.00, -37.79],
          [145.02, -37.79],
          [145.02, -37.77],
          [145.00, -37.77],
          [145.00, -37.79]
        ]]
      }
    }
  ]
};

function RiskZoneLayer({ data, riskType, visible }) {
  if (!visible || !data) return null;

  const colors = RISK_COLORS[riskType];
  if (!colors) return null;

  const styleFeature = (feature) => {
    const riskLevel = feature.properties.riskLevel || 'low';
    const colorConfig = colors[riskLevel] || colors.low;
    
    return {
      fillColor: colorConfig.fill,
      fillOpacity: 0.4,
      color: colorConfig.stroke,
      weight: 2,
      dashArray: riskType === 'bushfire' ? '5 5' : undefined
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    const riskLevel = props.riskLevel || 'low';
    const colorConfig = colors[riskLevel] || colors.low;
    
    layer.bindPopup(`
      <div style="min-width: 200px;">
        <strong style="font-size: 14px;">${props.name || 'Risk Zone'}</strong>
        <hr style="margin: 8px 0; border-color: ${colorConfig.stroke};" />
        <div style="font-size: 12px; line-height: 1.6;">
          <div><strong>Type:</strong> ${riskType === 'bushfire' ? '🔥 Bushfire' : '🌊 Flood'}</div>
          <div><strong>Risk Level:</strong> <span style="color: ${colorConfig.stroke}; font-weight: 600;">${colorConfig.label}</span></div>
          ${props.aep ? `<div><strong>AEP:</strong> ${props.aep}</div>` : ''}
          <div><strong>Source:</strong> ${props.source || 'N/A'}</div>
        </div>
      </div>
    `);
  };

  return (
    <GeoJSON 
      data={data} 
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}

export function RiskZonesControl({ 
  bushfireZones, 
  floodZones, 
  showBushfire, 
  showFlood, 
  onToggleBushfire, 
  onToggleFlood 
}) {
  return (
    <div className="risk-zones-control" style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      background: 'var(--surface)',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      minWidth: '180px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
        ⚠️ Risk Zones
      </h4>
      
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        cursor: 'pointer',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <input
          type="checkbox"
          checked={showBushfire}
          onChange={(e) => onToggleBushfire(e.target.checked)}
          style={{ accentColor: '#ef4444' }}
        />
        <span style={{ 
          width: '12px', 
          height: '12px', 
          background: '#fecaca', 
          border: '2px solid #ef4444',
          borderRadius: '2px',
          display: 'inline-block'
        }}></span>
        Bushfire Risk
      </label>
      
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        cursor: 'pointer',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <input
          type="checkbox"
          checked={showFlood}
          onChange={(e) => onToggleFlood(e.target.checked)}
          style={{ accentColor: '#3b82f6' }}
        />
        <span style={{ 
          width: '12px', 
          height: '12px', 
          background: '#bfdbfe', 
          border: '2px solid #2563eb',
          borderRadius: '2px',
          display: 'inline-block'
        }}></span>
        Flood Risk
      </label>
      
      <div style={{ 
        marginTop: '10px', 
        paddingTop: '10px', 
        borderTop: '1px solid var(--border-color)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        lineHeight: 1.4
      }}>
        Data: State Govt planning schemes
      </div>
    </div>
  );
}

export function RiskZonesLegend({ showBushfire, showFlood }) {
  if (!showBushfire && !showFlood) return null;

  return (
    <div className="risk-zones-legend" style={{
      marginTop: '12px',
      padding: '10px',
      background: 'var(--surface-alt)',
      borderRadius: '8px',
      fontSize: '11px'
    }}>
      <strong style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Risk Zones</strong>
      
      {showBushfire && (
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#ef4444' }}>🔥 Bushfire</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(RISK_COLORS.bushfire).map(([level, config]) => (
              <span key={level} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ 
                  width: '10px', 
                  height: '10px', 
                  background: config.fill, 
                  border: `1px solid ${config.stroke}`,
                  borderRadius: '2px'
                }}></span>
                {config.label}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {showFlood && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#2563eb' }}>🌊 Flood</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(RISK_COLORS.flood).map(([level, config]) => (
              <span key={level} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ 
                  width: '10px', 
                  height: '10px', 
                  background: config.fill, 
                  border: `1px solid ${config.stroke}`,
                  borderRadius: '2px'
                }}></span>
                {config.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export sample data for demonstration
export const SAMPLE_DATA = {
  bushfire: SAMPLE_BUSHFIRE_ZONES,
  flood: SAMPLE_FLOOD_ZONES
};

// Export color configs for external use
export { RISK_COLORS };
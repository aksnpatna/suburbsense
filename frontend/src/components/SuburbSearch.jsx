import React, { useState, useEffect, useCallback, useRef } from 'react';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export function SuburbSearch({ onSelect, placeholder = "Search suburbs...", className = "" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const fetchResults = useCallback(
    debounce(async (searchQuery, setLoader, setRes) => {
      if (searchQuery.length < 2) {
        setRes([]);
        return;
      }

      try {
        setLoader(true);
        const response = await fetch(`/api/suburbs/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data = await response.json();
        setRes(data.results);
      } catch (error) {
        console.error('Search error:', error);
        setRes([]);
      } finally {
        setLoader(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchResults(value, setLoading, setResults);
    setShowResults(true);
  };

  const handleSelect = (suburb) => {
    setQuery(`${suburb.name}, ${suburb.state} ${suburb.postcode}`);
    setShowResults(false);
    if (onSelect) {
      onSelect(suburb);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.suburb-search')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`suburb-search ${className}`}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="suburb-search-input"
          aria-label="Search suburbs"
        />
        {loading && <div className="search-loading">Loading...</div>}
      </div>
      
      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((suburb, index) => (
            <div
              key={suburb.id}
              className="search-result-item"
              onClick={() => handleSelect(suburb)}
            >
              <div className="result-name">{suburb.name}</div>
              <div className="result-location">
                {suburb.state}, {suburb.postcode}
              </div>
              {suburb.demographics?.population_2021 && (
                <div className="result-population">
                  {suburb.demographics.population_2021.toLocaleString()} residents
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="search-results">
          <div className="no-results">
            No suburbs found matching "{query}"
          </div>
        </div>
      )}
    </div>
  );
}

export function ScoreChips({ scores, className = "" }) {
  const scoreConfig = [
    { key: 'schools', label: 'Schools', color: '#2ecc71', icon: '🏫' },
    { key: 'transit', label: 'Transit', color: '#3498db', icon: '🚌' },
    { key: 'parks', label: 'Parks', color: '#9b59b6', icon: '🌳' },
    { key: 'shopping', label: 'Shopping', color: '#f39c12', icon: '🛒' },
    { key: 'health', label: 'Health', color: '#e74c3c', icon: '🏥' }
  ];

  return (
    <div className={`score-chips ${className}`}>
      {scoreConfig.map((config) => {
        const score = scores[config.key];
        const percentage = Math.round(score);
        
        return (
          <div key={config.key} className="score-chip">
            <div className="score-icon">{config.icon}</div>
            <div className="score-content">
              <div className="score-label">{config.label}</div>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: config.color 
                  }}
                ></div>
              </div>
              <div className="score-percentage">{percentage}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AmenityMap({ center, amenities, className = "" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const boundaryLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) {
      console.warn('Leaflet not available or map element not found');
      return;
    }

    // Initialize map if not already initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView(
        [center.lat, center.lng],
        13
      );

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([center.lat, center.lng], 13);
    }

    // Cleanup previous boundary
    if (boundaryLayerRef.current) {
      mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    // Draw boundary if available
    if (center.boundary) {
      boundaryLayerRef.current = window.L.geoJSON(center.boundary, {
        style: {
          color: 'var(--primary-color, #2563eb)',
          weight: 2,
          opacity: 0.8,
          fillColor: 'var(--primary-color, #2563eb)',
          fillOpacity: 0.1
        }
      }).addTo(mapInstanceRef.current);
      
      // Fit map to boundary
      mapInstanceRef.current.fitBounds(boundaryLayerRef.current.getBounds());
    }

    // Add markers for amenities
    const categories = [
      { key: 'supermarket', icon: '🛒', color: 'blue' },
      { key: 'school', icon: '🏫', color: 'red' },
      { key: 'health', icon: '🏥', color: 'green' },
      { key: 'cafe', icon: '☕', color: 'orange' },
      { key: 'park', icon: '🌳', color: 'purple' },
      { key: 'train_station', icon: '🚂', color: 'black' },
      { key: 'transit', icon: '🚌', color: 'gray' }
    ];

    categories.forEach((category) => {
      amenities[category.key]?.forEach((amenity) => {
        const marker = window.L.marker([amenity.lat, amenity.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="popup">
              <h4>${amenity.name}</h4>
              <p>${category.icon} ${category.key}</p>
              <p>Distance: ${amenity.distance_km}km</p>
            </div>
          `);
      });
    });

    // Add center marker
    const centerMarker = window.L.marker([center.lat, center.lng])
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div class="popup">
          <h4>📍 ${center.name || 'Suburb Center'}</h4>
          <p>Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}</p>
        </div>
      `)
      .openPopup();

    return () => {
      // Cleanup markers if component unmounts (but keep map instance)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof window.L.Marker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });
        if (boundaryLayerRef.current) {
          mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
          boundaryLayerRef.current = null;
        }
      }
    };
  }, [center, amenities]);

  return (
    <div className={`amenity-map ${className}`}>
      <div className="map-container" ref={mapRef} style={{ height: '400px', borderRadius: '8px' }}></div>
      <div className="map-legend">
        <h3>Map Legend</h3>
        <div className="legend-items">
          {[
            { icon: '🛒', label: 'Supermarkets', color: 'blue' },
            { icon: '🏫', label: 'Schools', color: 'red' },
            { icon: '🏥', label: 'Healthcare', color: 'green' },
            { icon: '☕', label: 'Dining', color: 'orange' },
            { icon: '🌳', label: 'Parks', color: 'purple' },
            { icon: '🚂', label: 'Train Stations', color: 'black' },
            { icon: '🚌', label: 'Transit', color: 'gray' }
          ].map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-icon">{item.icon}</span>
              <span className="legend-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

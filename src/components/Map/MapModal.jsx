import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** * PROFESSIONAL MARKER CONFIGURATION
 * Solves the missing icon issue in Leaflet + Webpack/Vite
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click: (e) => onLocationSelect(e.latlng),
    });
    return null;
};

const MapModal = ({ 
    showMapModal, 
    onClose, 
    formData, 
    onLocationSelect, 
    selectedLocation, 
    setSelectedLocation 
}) => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const mapRef = useRef(null);

    const defaultCenter = [27.7172, 85.3240]; // Kathmandu

    // Sync address when selectedLocation changes
    useEffect(() => {
        if (selectedLocation) {
            reverseGeocode(selectedLocation.lat, selectedLocation.lng);
        }
    }, [selectedLocation]);

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`http://localhost:5000/api/maps/reverse-geocode?lat=${lat}&lng=${lng}`);
            const data = await response.json();
            if (data.success) setAddress(data.address);
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    };

    const handleLocationChange = useCallback((latlng) => {
        setSelectedLocation(latlng);
        if (mapRef.current) {
            mapRef.current.flyTo(latlng, mapRef.current.getZoom(), { duration: 1.5 });
        }
    }, [setSelectedLocation]);

    const handleSearch = async () => {
        if (!searchInput.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/maps/geocode?address=${encodeURIComponent(searchInput + ', Nepal')}`);
            const data = await response.json();
            if (data.success) {
                const newLoc = { lat: data.location.lat, lng: data.location.lng };
                handleLocationChange(newLoc);
                setAddress(data.formatted_address);
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            alert('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                handleLocationChange(newLoc);
                setLoading(false);
            },
            () => setLoading(false)
        );
    };

    const handleConfirm = () => {
        if (!selectedLocation) return;
        const parts = address.split(',').map(p => p.trim());
        onLocationSelect({
            latitude: selectedLocation.lat.toString(),
            longitude: selectedLocation.lng.toString(),
            address: parts[0] || formData.address,
            city: parts[1] || formData.city,
            formatted_address: address
        });
        onClose();
    };

    if (!showMapModal) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[85vh] overflow-hidden flex flex-col border border-slate-200">
                
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Select Property Location</h2>
                        <p className="text-sm text-slate-500">Search for an address or click directly on the map</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-slate-50 flex gap-2 items-center">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search city, neighborhood, or street..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button 
                        onClick={handleSearch} 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    <button 
                        onClick={useCurrentLocation}
                        className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
                    >
                        <span className="text-blue-500">⦿</span> My Location
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Map */}
                    <div className="flex-1 relative border-r">
                        <MapContainer
                            center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : defaultCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            ref={mapRef}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapClickHandler onLocationSelect={handleLocationChange} />
                            {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lng]} />}
                        </MapContainer>
                    </div>

                    {/* Info Sidebar */}
                    <div className="w-80 bg-white p-6 flex flex-col justify-between hidden md:flex">
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Selection Details</h3>
                            {selectedLocation ? (
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Latitude / Longitude</p>
                                        <p className="text-sm font-mono text-blue-900">{selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Detected Address</p>
                                        <p className="text-sm text-slate-800 leading-relaxed">{address || 'Fetching address...'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-4xl mb-3">📍</div>
                                    <p className="text-sm text-slate-500">No location selected yet.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-xs text-amber-700 leading-tight">
                                <strong>Tip:</strong> You can drag the map and click precisely where the entrance of your property is.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedLocation}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                    >
                        Confirm & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
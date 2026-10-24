import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../lib/api.js";
import { formatPrice } from "../lib/format.js";
import TypeBadge from "../components/TypeBadge.jsx";
import "leaflet/dist/leaflet.css";

// Leaflet default icon fix for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [41.3111, 69.2797]; // Toshkent
const DEFAULT_RADIUS = 10;

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null); // { lat, lng }
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | requesting | granted | denied | error
  const [geoError, setGeoError] = useState("");
  const [address, setAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mapRef = useRef(null);

  const fetchNearby = useCallback(async (lat, lng, rad) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/circles", {
        params: { lat, lng, radiusKm: rad, sort: "nearest", limit: 50 },
      });
      setItems(res.data.data.items);
    } catch {
      setError(t("home.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      setGeoError("Brauzeringiz geolokatsiyani qo'llamaydi");
      return;
    }
    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setGeoStatus("granted");
        fetchNearby(coords.lat, coords.lng, radius);
      },
      (err) => {
        setGeoStatus("denied");
        setGeoError(
          err.code === 1
            ? "Joylashuvga ruxsat berilmadi. Manzilni qo'lda kiriting."
            : "Joylashuv aniqlanmadi. Manzilni qo'lda kiriting."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchNearby, radius]);

  useEffect(() => {
    requestGeolocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setAddressLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { "Accept-Language": "uz" } }
      );
      const data = await res.json();
      if (!data.length) {
        setError("Manzil topilmadi. Boshqacha yozib ko'ring.");
        setAddressLoading(false);
        return;
      }
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      setLocation(coords);
      setGeoStatus("granted");
      fetchNearby(coords.lat, coords.lng, radius);
    } catch {
      setError("Manzilni aniqlashda xatolik yuz berdi");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleRadiusChange = (val) => {
    setRadius(val);
    if (location) fetchNearby(location.lat, location.lng, val);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {/* Sidebar */}
      <div
        className={`absolute left-0 top-0 z-[1000] h-full w-full max-w-sm transform border-r border-line bg-paper shadow-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line bg-primary-wash/40 px-4 py-3">
            <h2 className="font-display text-lg font-bold text-ink">📍 {t("map.title")}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-ink-soft transition hover:bg-paper hover:text-ink"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Location status */}
            {geoStatus === "requesting" && (
              <div className="mb-4 rounded-xl border border-primary/20 bg-primary-wash/30 p-3 text-sm text-primary">
                📡 Joylashuv aniqlanmoqda...
              </div>
            )}

            {geoStatus === "denied" && (
              <div className="mb-4 rounded-xl border border-amber-300/40 bg-amber-500/10 p-3 text-sm text-amber-600">
                ⚠ {geoError}
              </div>
            )}

            {/* Address input (shown when geo denied or as fallback) */}
            {(geoStatus === "denied" || geoStatus === "idle") && (
              <form onSubmit={handleAddressSubmit} className="mb-4">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                  {t("map.addressLabel")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("map.addressPlaceholder")}
                    className="flex-1 rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addressLoading}
                    className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
                  >
                    {addressLoading ? "..." : "→"}
                  </button>
                </div>
              </form>
            )}

            {geoStatus === "granted" && location && (
              <button
                onClick={() => {
                  setLocation(null);
                  setGeoStatus("idle");
                  setItems([]);
                }}
                className="mb-4 w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-xs font-medium text-ink-soft transition hover:border-primary/40 hover:text-primary"
              >
                📍 {t("map.changeLocation")}
              </button>
            )}

            {/* Radius slider */}
            {location && (
              <div className="mb-4">
                <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
                  <span>{t("map.radius")}</span>
                  <span className="text-primary">{radius} km</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={radius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {/* Results */}
            {loading && (
              <div className="py-8 text-center text-sm text-muted">{t("home.loading")}</div>
            )}

            {error && !loading && (
              <div className="rounded-xl border border-danger/20 bg-danger-wash p-3">
                <p className="text-sm text-danger">{error}</p>
                <button
                  onClick={() => location && fetchNearby(location.lat, location.lng, radius)}
                  className="mt-2 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/20"
                >
                  🔄 Qayta urinish
                </button>
              </div>
            )}

            {!loading && !error && location && items.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">
                {t("map.noResults")}
              </div>
            )}

            {!loading && items.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {items.length} {t("map.found")}
                </p>
                {items.map((c) => (
                  <Link
                    key={c.id}
                    to={`/togarak/${c.id}`}
                    className="block rounded-xl border border-line bg-paper-raised p-3 transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      {c.images?.[0] ? (
                        <img
                          src={c.images[0]}
                          alt={c.name}
                          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-wash">
                          <span className="font-display text-lg font-bold text-primary/40">
                            {c.direction?.[0] || "T"}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {c.type && <TypeBadge type={c.type} />}
                          {c.distanceKm != null && (
                            <span className="text-xs font-medium text-primary">
                              {c.distanceKm} km
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm font-semibold text-ink">{c.name}</p>
                        <p className="truncate text-xs text-muted">{c.address || c.direction}</p>
                        <p className="mt-0.5 font-mono text-xs font-semibold text-primary">
                          {formatPrice(c)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle sidebar button (when closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-3 top-3 z-[1000] rounded-xl border border-line bg-paper-raised p-2.5 shadow-lg transition hover:border-primary/40"
        >
          <svg className="h-5 w-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Map */}
      <MapContainer
        ref={mapRef}
        center={location || DEFAULT_CENTER}
        zoom={location ? 13 : 11}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={location || DEFAULT_CENTER} />

        {location && (
          <>
            <Circle
              center={[location.lat, location.lng]}
              radius={radius * 1000}
              pathOptions={{ color: "#6366f1", fillColor: "#6366f1", fillOpacity: 0.08, weight: 1.5 }}
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div className="text-center text-sm font-semibold">📍 {t("map.youAreHere")}</div>
              </Popup>
            </Marker>
          </>
        )}

        {items
          .filter((c) => c.latitude != null && c.longitude != null)
          .map((c) => (
            <Marker key={c.id} position={[c.latitude, c.longitude]}>
              <Popup>
                <div className="min-w-[180px]">
                  <Link to={`/togarak/${c.id}`} className="block font-semibold text-primary hover:underline">
                    {c.name}
                  </Link>
                  {c.direction && <p className="mt-0.5 text-xs text-muted">{c.direction}</p>}
                  {c.distanceKm != null && (
                    <p className="mt-1 text-xs font-medium text-primary">{c.distanceKm} km</p>
                  )}
                  <p className="mt-0.5 font-mono text-xs font-semibold text-ink">{formatPrice(c)}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

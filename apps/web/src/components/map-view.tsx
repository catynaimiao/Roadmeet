'use client';

import { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    label?: string;
    color?: string;
    html?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    className?: string;
  }>;
  polylines?: Array<{
    positions: [number, number][];
    color: string;
    dashArray?: string;
  }>;
  className?: string;
  style?: React.CSSProperties;
}

export function MapView({ center, zoom = 13, markers = [], polylines = [], className, style }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const layersRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const leafletRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || initializingRef.current) return;

    initializingRef.current = true;

    const initMap = async () => {
      try {
        const mod = await import('leaflet');
        const L = (mod as any).default || mod;
        leafletRef.current = L;
        // @ts-ignore - CSS import handled by bundler
        await import('leaflet/dist/leaflet.css');

        // Check if container already has a map (React Strict Mode)
        const container = mapRef.current as any;
        if (!container || container._leaflet_id) {
          initializingRef.current = false;
          return;
        }

        // Initialize new map
        const m = L.map(container, {
          zoomControl: false,
          attributionControl: false,
        }).setView(center, zoom);

        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(m);

        if (!isMountedRef.current) {
          m.remove();
          initializingRef.current = false;
          return;
        }

        mapInstanceRef.current = m;
        layersRef.current = L.layerGroup().addTo(m);
        setMapReady(true);
        initializingRef.current = false;
      } catch (error) {
        console.error('Map initialization error:', error);
        initializingRef.current = false;
      }
    };

    initMap();

    return () => {
      if (layersRef.current) {
        try {
          layersRef.current.remove();
        } catch (error) {
          console.warn('Error removing layers:', error);
        }
        layersRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.warn('Error removing map:', error);
        }
      }
      initializingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom, { animate: false });
  }, [center, zoom]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !leafletRef.current || !layersRef.current) return;
    const L = leafletRef.current;
    const group = layersRef.current;

    try {
      group.clearLayers();
    } catch (error) {
      console.warn('Error clearing layers:', error);
    }

      // Add markers
      markers.forEach((m) => {
        const color = m.color || '#000000';
        const icon = L.divIcon({
          className: m.className || 'custom-marker',
          html:
            m.html ||
            `<div style="
              width: 32px; height: 32px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              display: flex; align-items: center; justify-content: center;
              color: white; font-size: 12px; font-weight: 700;
            ">${m.label || ''}</div>`,
          iconSize: m.iconSize || [32, 32],
          iconAnchor: m.iconAnchor || [16, 16],
        });
        L.marker(m.position, { icon }).addTo(group);
      });

      // Add polylines
      polylines.forEach((p) => {
        if (p.positions.length < 2) return;
        L.polyline(p.positions, {
          color: p.color,
          weight: 4,
          opacity: 0.8,
          dashArray: p.dashArray,
          lineJoin: 'round',
        }).addTo(group);
      });

  }, [mapReady, markers, polylines]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: '100%', height: '300px', ...style }}
    />
  );
}

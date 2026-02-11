'use client';

import { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    label?: string;
    color?: string;
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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || initializingRef.current) return;

    initializingRef.current = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
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

        mapInstanceRef.current = m;
      } catch (error) {
        console.error('Map initialization error:', error);
        initializingRef.current = false;
      }
    };

    initMap();

    return () => {
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
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require('leaflet');
    const map = mapInstanceRef.current;

    // Clear previous layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    markers.forEach((m) => {
      const color = m.color || '#000000';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px; height: 32px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 12px; font-weight: 700;
        ">${m.label || ''}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker(m.position, { icon }).addTo(map);
    });

    // Add polylines
    polylines.forEach((p) => {
      L.polyline(p.positions, {
        color: p.color,
        weight: 4,
        opacity: 0.8,
        dashArray: p.dashArray,
        lineJoin: 'round',
      }).addTo(map);
    });
  }, [mapInstanceRef.current, markers, polylines]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: '100%', height: '300px', ...style }}
    />
  );
}

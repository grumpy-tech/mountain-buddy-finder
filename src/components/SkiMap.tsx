import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SessionMember } from '@/hooks/useSession';

// Big White Ski Resort center coordinates
const BIG_WHITE_CENTER: L.LatLngExpression = [49.7258, -118.9317];
const DEFAULT_ZOOM = 14;

const COLORS = [
  '#38bdf8', '#f97316', '#4ade80', '#f472b6',
  '#a78bfa', '#fbbf24', '#fb923c', '#34d399',
];

function createMemberIcon(color: string, isMe: boolean) {
  const size = isMe ? 20 : 14;
  const pulse = isMe
    ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${size * 2.5}px;height:${size * 2.5}px;border-radius:50%;background:${color}33;animation:pulse-ring 2s ease-out infinite;"></div>`
    : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="position:absolute;top:0;left:0;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 12px ${color}88;"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface SkiMapProps {
  members: SessionMember[];
  myMemberId: string | null;
}

export default function SkiMap({ members, myMemberId }: SkiMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const colorMapRef = useRef<Map<string, string>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: BIG_WHITE_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    // Clean white/snow-toned base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Ski piste overlay — runs, lifts, trails
    L.tileLayer('https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://opensnowmap.org">OpenSnowMap</a>',
      maxZoom: 18,
      opacity: 0.9,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Assign colors
    members.forEach((member) => {
      if (!colorMapRef.current.has(member.id)) {
        colorMapRef.current.set(member.id, COLORS[colorMapRef.current.size % COLORS.length]);
      }
    });

    const currentIds = new Set(members.map(m => m.id));

    // Remove markers for members who left
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Update/add markers
    const locatedMembers = members.filter(m => m.latitude && m.longitude);

    locatedMembers.forEach((member) => {
      const isMe = member.id === myMemberId;
      const color = colorMapRef.current.get(member.id) || COLORS[0];
      const pos: L.LatLngExpression = [member.latitude!, member.longitude!];

      const timeSince = getTimeSince(member.last_seen);

      const existing = markersRef.current.get(member.id);
      if (existing) {
        existing.setLatLng(pos);
        existing.setIcon(createMemberIcon(color, isMe));
        existing.setPopupContent(
          `<div style="font-weight:600;color:${color}">${member.username}${isMe ? ' (You)' : ''}</div><div style="font-size:11px;color:#888">${timeSince}</div>`
        );
      } else {
        const marker = L.marker(pos, { icon: createMemberIcon(color, isMe) })
          .addTo(map)
          .bindPopup(
            `<div style="font-weight:600;color:${color}">${member.username}${isMe ? ' (You)' : ''}</div><div style="font-size:11px;color:#888">${timeSince}</div>`
          );
        markersRef.current.set(member.id, marker);
      }
    });

    // Fit bounds if we have located members
    if (locatedMembers.length === 1) {
      map.setView([locatedMembers[0].latitude!, locatedMembers[0].longitude!], 15);
    } else if (locatedMembers.length > 1) {
      const bounds = L.latLngBounds(
        locatedMembers.map(m => [m.latitude!, m.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [members, myMemberId]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}

function getTimeSince(lastSeen: string | null): string {
  if (!lastSeen) return 'No signal';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

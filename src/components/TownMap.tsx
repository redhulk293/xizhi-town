import React, { useState, useRef, useEffect } from 'react';
import {
  LotState,
  Player,
  BusinessTile,
} from '../types';
import { LOT_DEFINITIONS, DISTRICTS } from '../data/districts';
import { BUSINESS_DEFINITIONS } from '../data/businesses';
import { sound } from '../utils/soundEngine';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Hammer,
} from 'lucide-react';

interface TownMapProps {
  lots: Record<string, LotState>;
  players: Player[];
  activePlayer: Player;
  selectedLotId: string | null;
  selectedTileForPlacement: BusinessTile | null;
  activeDistrictIds: string[];
  highlightedLotIds?: string[];
  onSelectLot: (lotId: string) => void;
  onBuildTileOnLot: (tileId: string, lotId: string) => void;
}

export const TownMap: React.FC<TownMapProps> = ({
  lots,
  players,
  activePlayer,
  selectedLotId,
  selectedTileForPlacement,
  activeDistrictIds,
  highlightedLotIds = [],
  onSelectLot,
  onBuildTileOnLot,
}) => {
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(zoom);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLargeMap = activeDistrictIds.includes('G') || activeDistrictIds.includes('H');
  const boardWidth = isLargeMap ? 2260 : 1700;
  const boardHeight = isLargeMap ? 1120 : 960;

  // Auto-center camera on mount based on viewport
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialZoom = Math.max(0.65, Math.min(1.1, rect.width / (boardWidth * 1.05)));
      setZoom(initialZoom);
      setPan({
        x: (rect.width - boardWidth * initialZoom) / 2,
        y: (rect.height - boardHeight * initialZoom) / 2,
      });
    }
  }, [boardWidth, boardHeight]);

  const getPlayer = (playerId: string | null | undefined): Player | undefined => {
    if (!playerId) return undefined;
    return players.find((p) => p.id === playerId);
  };

  // Check placement eligibility
  const checkPlacementValidity = (lotId: string): { valid: boolean; reason?: string } => {
    if (!selectedTileForPlacement) return { valid: false };
    const lot = lots[lotId];
    const lotDef = LOT_DEFINITIONS.find((l) => l.id === lotId);
    const bizDef = BUSINESS_DEFINITIONS[selectedTileForPlacement.businessTypeId];

    if (!lot || !lotDef || !bizDef) return { valid: false };
    if (!activeDistrictIds.includes(lotDef.districtId)) {
      return { valid: false, reason: 'District not active in this match' };
    }
    if (lot.ownerId !== activePlayer.id) {
      return { valid: false, reason: 'You do not own this parcel' };
    }
    if (lot.builtBusiness) {
      return { valid: false, reason: 'Parcel already developed' };
    }
    if (bizDef.requiredTag && !lotDef.tags.includes(bizDef.requiredTag)) {
      return { valid: false, reason: `Requires "${bizDef.requiredTag}" parcel` };
    }

    // Contiguity rule
    const existingLotsWithThisBiz = Object.values(lots).filter(
      (l) => l.ownerId === activePlayer.id && l.builtBusiness?.businessTypeId === bizDef.id
    );
    if (existingLotsWithThisBiz.length > 0) {
      const isAdj = existingLotsWithThisBiz.some((ex) => lotDef.adjacentLotIds.includes(ex.id));
      if (!isAdj) {
        return { valid: false, reason: 'Must be adjacent to your existing chain' };
      }
    }

    return { valid: true };
  };

  // Touch pan & pinch-zoom controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      const newZoom = Math.min(2.5, Math.max(0.45, touchStartZoomRef.current * factor));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Mouse pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(2.5, Math.max(0.45, prev * zoomFactor)));
  };

  // Camera focus presets
  const focusOn = (x: number, y: number, newZoom = 1.35) => {
    sound.playMapSelect();
    setZoom(newZoom);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - x * newZoom,
        y: rect.height / 2 - y * newZoom,
      });
    }
  };

  const resetCamera = () => {
    sound.playMapSelect();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialZoom = Math.max(0.65, Math.min(1.05, rect.width / (boardWidth * 1.05)));
      setZoom(initialZoom);
      setPan({
        x: (rect.width - boardWidth * initialZoom) / 2,
        y: (rect.height - boardHeight * initialZoom) / 2,
      });
    }
  };

  const focusMyProperties = () => {
    const myLots = Object.keys(lots).filter((id) => lots[id].ownerId === activePlayer.id);
    if (myLots.length === 0) {
      resetCamera();
      return;
    }
    const firstMyLot = LOT_DEFINITIONS.find((l) => l.id === myLots[0]);
    if (firstMyLot) {
      focusOn(firstMyLot.labelPos[0], firstMyLot.labelPos[1], 1.25);
    }
  };

  // Drag & drop tile placement
  const handleDropOnLot = (e: React.DragEvent, lotId: string) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain');
    if (!tileId) return;

    const placement = checkPlacementValidity(lotId);
    if (placement.valid) {
      sound.playTilePlace();
      onBuildTileOnLot(tileId, lotId);
    }
  };

  // Filter visible lots based on active districts
  const visibleLots = LOT_DEFINITIONS.filter((l) => activeDistrictIds.includes(l.districtId));

  // Compute connecting pipelines for adjacent tiles of same business owned by same player
  const chainConnections: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const processedPairs = new Set<string>();

  visibleLots.forEach((l1) => {
    const s1 = lots[l1.id];
    if (!s1 || !s1.ownerId || !s1.builtBusiness) return;
    const biz1 = s1.builtBusiness;

    l1.adjacentLotIds.forEach((adjId) => {
      const l2 = LOT_DEFINITIONS.find((ld) => ld.id === adjId);
      if (!l2 || !activeDistrictIds.includes(l2.districtId)) return;
      const s2 = lots[adjId];
      if (!s2 || !s2.ownerId || !s2.builtBusiness) return;
      const biz2 = s2.builtBusiness;

      if (
        s1.ownerId === s2.ownerId &&
        biz1.businessTypeId === biz2.businessTypeId
      ) {
        const pairKey = [l1.id, adjId].sort().join('-');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          chainConnections.push({
            x1: l1.labelPos[0],
            y1: l1.labelPos[1],
            x2: l2.labelPos[0],
            y2: l2.labelPos[1],
          });
        }
      }
    });
  });

  // Calculate completion status for a lot's business
  const getLotShopStatus = (lotId: string) => {
    const lot = lots[lotId];
    if (!lot || !lot.ownerId || !lot.builtBusiness) return null;
    const bizTypeId = lot.builtBusiness.businessTypeId;
    const bizDef = BUSINESS_DEFINITIONS[bizTypeId];
    if (!bizDef) return null;

    const sameBizLots = Object.values(lots).filter(
      (l) => l.ownerId === lot.ownerId && l.builtBusiness?.businessTypeId === bizTypeId
    );
    const count = sameBizLots.length;
    const isComplete = count >= bizDef.requiredTiles;
    return {
      code: bizDef.code,
      count,
      required: bizDef.requiredTiles,
      isComplete,
    };
  };

  // Distinct isometric building model renderer for all 12 business codes
  const renderBuildingOnLot = (businessTypeId: string, [cx, cy]: [number, number], shopStatus: { code: string; count: number; required: number; isComplete: boolean } | null) => {
    const bizDef = BUSINESS_DEFINITIONS[businessTypeId];
    const code = bizDef?.code || businessTypeId;

    return (
      <g transform={`translate(${cx - 24}, ${cy - 20})`}>
        {/* Base shadow */}
        <ellipse cx="24" cy="36" rx="20" ry="8" fill="#000000" opacity="0.45" />

        {/* Custom architectural models per business code */}
        {code === 'XZT' && (
          // Xizhi Old Street Tea Shop: traditional pagoda pavilion roof
          <g>
            <polygon points="4,16 24,4 44,16" fill="#15803d" />
            <polygon points="8,12 24,3 40,12" fill="#22c55e" opacity="0.6" />
            <rect x="8" y="16" width="32" height="18" fill="#78350f" rx="1" />
            <rect x="18" y="22" width="12" height="12" fill="#fef08a" opacity="0.9" />
          </g>
        )}

        {code === 'SFD' && (
          // Seafood Market: maritime wharf hut with awning
          <g>
            <rect x="6" y="14" width="36" height="20" fill="#0369a1" rx="1" />
            <path d="M4,14 L16,6 L44,14 Z" fill="#0284c7" />
            <path d="M4,16 L44,16" stroke="#ffffff" strokeWidth="2" strokeDasharray="4,4" />
            <circle cx="24" cy="24" r="5" fill="#38bdf8" />
          </g>
        )}

        {code === 'HSM' && (
          // Night Market: striped food stalls and hanging lanterns
          <g>
            <path d="M4,16 L14,8 L24,16 Z" fill="#ef4444" />
            <path d="M24,16 L34,8 L44,16 Z" fill="#f59e0b" />
            <rect x="6" y="16" width="16" height="18" fill="#7f1d1d" rx="1" />
            <rect x="26" y="16" width="16" height="18" fill="#78350f" rx="1" />
            <circle cx="14" cy="18" r="2" fill="#fef08a" />
            <circle cx="34" cy="18" r="2" fill="#fef08a" />
          </g>
        )}

        {code === 'XFC' && (
          // Fried Chicken Bistro: red & white diner canopy
          <g>
            <polygon points="4,14 24,4 44,14" fill="#dc2626" />
            <rect x="8" y="14" width="32" height="20" fill="#991b1b" rx="2" />
            <rect x="14" y="18" width="20" height="10" fill="#fef08a" />
            <circle cx="24" cy="10" r="3" fill="#ffffff" />
          </g>
        )}

        {code === 'CPE' && (
          // Ceramics & Pottery: artisan brick kiln dome
          <g>
            <path d="M8,32 Q24,6 40,32 Z" fill="#c2410c" />
            <ellipse cx="24" cy="24" rx="8" ry="4" fill="#ea580c" />
            <rect x="20" y="24" width="8" height="10" fill="#7c2d12" />
          </g>
        )}

        {code === 'RVL' && (
          // Riverfront Teahouse: wooden stilts terrace
          <g>
            <polygon points="6,12 24,4 42,12" fill="#047857" />
            <rect x="10" y="12" width="28" height="16" fill="#065f46" rx="1" />
            <line x1="12" y1="28" x2="12" y2="35" stroke="#78350f" strokeWidth="2.5" />
            <line x1="36" y1="28" x2="36" y2="35" stroke="#78350f" strokeWidth="2.5" />
          </g>
        )}

        {code === 'TPD' && (
          // Station Pharmacy: green cross clinic building
          <g>
            <rect x="6" y="12" width="36" height="22" fill="#0f766e" rx="2" />
            <polygon points="6,12 24,4 42,12" fill="#14b8a6" />
            <rect x="22" y="18" width="4" height="10" fill="#ffffff" />
            <rect x="19" y="21" width="10" height="4" fill="#ffffff" />
          </g>
        )}

        {code === 'XTR' && (
          // Logistics Depot: freight warehouse with roll-up doors
          <g>
            <polygon points="4,16 18,8 18,16 32,8 32,16 44,8 44,16" fill="#475569" />
            <rect x="4" y="16" width="40" height="18" fill="#334155" rx="1" />
            <rect x="10" y="22" width="12" height="12" fill="#1e293b" />
            <rect x="26" y="22" width="12" height="12" fill="#1e293b" />
          </g>
        )}

        {code === 'XZD' && (
          // Heavy Machinery Works: industrial sawtooth factory with smokestack
          <g>
            <polygon points="4,18 16,8 16,18 28,8 28,18 42,8 42,18" fill="#52525b" />
            <rect x="4" y="18" width="40" height="18" fill="#27272a" rx="1" />
            <rect x="36" y="2" width="4" height="16" fill="#71717a" />
            <circle cx="38" cy="1" r="3" fill="#d4d4d8" opacity="0.6" />
          </g>
        )}

        {code === 'BCA' && (
          // Coal Mining Archive: historic brick headframe & mine car
          <g>
            <polygon points="8,16 24,6 40,16" fill="#854d0e" />
            <rect x="10" y="16" width="28" height="18" fill="#713f12" rx="1" />
            <circle cx="24" cy="12" r="3" fill="#facc15" />
            <rect x="14" y="26" width="20" height="6" fill="#1c1917" />
          </g>
        )}

        {code === 'XCB' && (
          // Commercial Bank: neo-classical pillared bank facade
          <g>
            <polygon points="4,14 24,4 44,14" fill="#a16207" />
            <rect x="6" y="14" width="36" height="4" fill="#ca8a04" />
            <rect x="8" y="18" width="5" height="16" fill="#fef08a" />
            <rect x="18" y="18" width="5" height="16" fill="#fef08a" />
            <rect x="28" y="18" width="5" height="16" fill="#fef08a" />
            <rect x="35" y="18" width="5" height="16" fill="#fef08a" />
            <rect x="6" y="34" width="36" height="3" fill="#ca8a04" />
          </g>
        )}

        {code === 'KMG' && (
          // Mega Department Store: modern glass tower mall
          <g>
            <rect x="8" y="8" width="32" height="28" fill="#4c1d95" rx="3" />
            <polygon points="6,8 24,1 42,8" fill="#6d28d9" />
            <rect x="12" y="12" width="24" height="20" fill="#38bdf8" opacity="0.85" />
            <line x1="24" y1="12" x2="24" y2="32" stroke="#ffffff" strokeWidth="1" />
            <line x1="12" y1="22" x2="36" y2="22" stroke="#ffffff" strokeWidth="1" />
            <circle cx="24" cy="4" r="2.5" fill="#f472b6" />
          </g>
        )}

        {/* Business Code Tag Badge on roof */}
        <g transform="translate(4, -2)">
          <rect x="0" y="0" width="22" height="9" fill="#0f172a" rx="2" stroke="#amber" strokeWidth="0.8" />
          <text x="11" y="7" fill="#fbbf24" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            {code}
          </text>
        </g>

        {/* Completion Progress Pill: e.g. 4/6 or Crown for Complete */}
        {shopStatus && (
          <g transform="translate(24, -4)">
            <rect
              x="0"
              y="0"
              width="20"
              height="10"
              fill={shopStatus.isComplete ? '#065f46' : '#1c1917'}
              stroke={shopStatus.isComplete ? '#34d399' : '#d97706'}
              strokeWidth="1"
              rx="3"
            />
            <text
              x="10"
              y="7.5"
              fill={shopStatus.isComplete ? '#6ee7b7' : '#fef08a'}
              fontSize="7"
              fontWeight="black"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {shopStatus.isComplete ? '★FULL' : `${shopStatus.count}/${shopStatus.required}`}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div
      id="town-map-viewport"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="absolute inset-0 w-full h-full bg-[#0a0e13] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* Living Town Board Canvas */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <svg
          viewBox={`0 0 ${boardWidth} ${boardHeight}`}
          className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-visible"
          style={{ width: `${boardWidth}px`, height: `${boardHeight}px` }}
        >
          <defs>
            {/* Keelung River Gradient */}
            <linearGradient id="keelungRiverFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>

            {/* Asphalt Roads Pattern */}
            <pattern id="asphaltRoadBig" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#1e293b" />
              <circle cx="6" cy="6" r="1" fill="#334155" opacity="0.5" />
              <circle cx="18" cy="18" r="1" fill="#334155" opacity="0.5" />
            </pattern>

            {/* Plaza Geometric Tiles */}
            <pattern id="plazaPavingBig" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#262626" />
              <rect width="19" height="19" fill="#2d2a29" stroke="#3f3f46" strokeWidth="0.8" />
              <circle cx="10" cy="10" r="1.2" fill="#71717a" opacity="0.4" />
            </pattern>

            {/* Cobblestones for Old Street */}
            <pattern id="oldCobbles" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#1c1917" />
              <circle cx="5" cy="5" r="3" fill="#292524" />
              <circle cx="13" cy="13" r="3" fill="#292524" />
            </pattern>

            {/* Tea Terrace Rows */}
            <pattern id="teaRows" width="24" height="14" patternUnits="userSpaceOnUse">
              <rect width="24" height="14" fill="#064e3b" />
              <line x1="0" y1="7" x2="24" y2="7" stroke="#047857" strokeWidth="3" />
              <circle cx="6" cy="7" r="1.8" fill="#10b981" />
              <circle cx="18" cy="7" r="1.8" fill="#10b981" />
            </pattern>

            {/* Rail Depot Pattern */}
            <pattern id="railDepotPatt" width="16" height="24" patternUnits="userSpaceOnUse">
              <rect width="16" height="24" fill="#1c1917" />
              <rect x="0" y="8" width="16" height="4" fill="#44403c" />
              <line x1="0" y1="4" x2="16" y2="4" stroke="#78716c" strokeWidth="1.5" />
              <line x1="0" y1="16" x2="16" y2="16" stroke="#78716c" strokeWidth="1.5" />
            </pattern>

            {/* Glowing Lot Filters */}
            <filter id="glow-gold-big" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-green-big" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* DISTRICT BASES & LANDSCAPES                             */}
          {/* ======================================================== */}
          {/* Northern Riverfront Base */}
          <rect x="40" y="40" width={boardWidth - 80} height="135" fill="url(#asphaltRoadBig)" rx="12" />

          {/* District A & B & C Row */}
          <rect x="70" y="130" width="460" height="340" fill="url(#oldCobbles)" rx="12" />
          <rect x="535" y="130" width="400" height="340" fill="url(#plazaPavingBig)" rx="12" />
          <rect x="940" y="130" width="650" height="340" fill="url(#asphaltRoadBig)" rx="12" />

          {/* District D & E & F Row */}
          <rect x="70" y="510" width="560" height="340" fill="url(#railDepotPatt)" rx="12" />
          <rect x="635" y="510" width="480" height="340" fill="url(#teaRows)" rx="12" />
          <rect x="1120" y="510" width="480" height="340" fill="#18181b" rx="12" />

          {/* District G & H if Large Map */}
          {isLargeMap && (
            <>
              <rect x="1605" y="125" width="540" height="470" fill="#1c1917" rx="12" />
              <rect x="1605" y="605" width="540" height="470" fill="#111827" rx="12" />
            </>
          )}

          {/* ======================================================== */}
          {/* THE KEELUNG RIVER & BRIDGES (Northern Waterway)          */}
          {/* ======================================================== */}
          <g id="keelung-river">
            <path
              d={`M30,15 C300,25 600,45 900,30 C1200,15 1500,35 ${boardWidth - 40},20 L${boardWidth - 40},65 L30,65 Z`}
              fill="url(#keelungRiverFlow)"
            />
            {/* Suspension Bridge */}
            <g id="keelung-bridge" transform="translate(520, 15)">
              <rect x="0" y="0" width="28" height="55" fill="#64748b" rx="2" />
              <line x1="0" y1="12" x2="28" y2="12" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="36" x2="28" y2="36" stroke="#94a3b8" strokeWidth="2" />
              <line x1="14" y1="0" x2="14" y2="55" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="4,4" />
            </g>
          </g>

          {/* ======================================================== */}
          {/* RAILWAYS & URBAN HIGHWAYS                                */}
          {/* ======================================================== */}
          <g id="transit-network">
            {/* North-South Railways */}
            <line x1="935" y1="130" x2="935" y2="850" stroke="#78716c" strokeWidth="8" />
            <line x1="935" y1="130" x2="935" y2="850" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="6,8" />

            {/* Central Avenue */}
            <line x1="40" y1="490" x2={boardWidth - 40} y2="490" stroke="#0f172a" strokeWidth="14" />
            <line x1="40" y1="490" x2={boardWidth - 40} y2="490" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="8,10" />
          </g>

          {/* ======================================================== */}
          {/* CHAIN PIPELINES                                          */}
          {/* ======================================================== */}
          <g id="chains">
            {chainConnections.map((conn, idx) => (
              <g key={idx}>
                <line
                  x1={conn.x1}
                  y1={conn.y1}
                  x2={conn.x2}
                  y2={conn.y2}
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <line
                  x1={conn.x1}
                  y1={conn.y1}
                  x2={conn.x2}
                  y2={conn.y2}
                  stroke="#fef08a"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>

          {/* ======================================================== */}
          {/* PARCELS / CADASTRAL LOTS                                 */}
          {/* ======================================================== */}
          <g id="parcels">
            {visibleLots.map((lotDef) => {
              const lotState = lots[lotDef.id];
              const owner = getPlayer(lotState?.ownerId);
              const isSelected = selectedLotId === lotDef.id;
              const isHovered = hoveredLotId === lotDef.id;
              const isHighlighted = highlightedLotIds.includes(lotDef.id);

              const placement = checkPlacementValidity(lotDef.id);
              const isValidPlacement = Boolean(selectedTileForPlacement && placement.valid);
              const isInvalidPlacement = Boolean(selectedTileForPlacement && !placement.valid);

              const district = DISTRICTS[lotDef.districtId];
              const polygonStr = lotDef.polygon.map(([x, y]) => `${x},${y}`).join(' ');
              const shopStatus = getLotShopStatus(lotDef.id);

              return (
                <g
                  key={lotDef.id}
                  id={`cadastral-lot-${lotDef.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playMapSelect();
                    if (selectedTileForPlacement) {
                      if (placement.valid) {
                        sound.playTilePlace();
                        onBuildTileOnLot(selectedTileForPlacement.id, lotDef.id);
                      } else {
                        onSelectLot(lotDef.id);
                      }
                    } else {
                      onSelectLot(lotDef.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredLotId(lotDef.id)}
                  onMouseLeave={() => setHoveredLotId(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnLot(e, lotDef.id)}
                  className="cursor-pointer transition-all duration-150"
                >
                  {/* Lot Surface Polygon */}
                  <polygon
                    points={polygonStr}
                    fill={
                      isValidPlacement
                        ? '#065f46'
                        : isHighlighted
                        ? '#78350f'
                        : owner
                        ? `${owner.color}30`
                        : `${district.color}15`
                    }
                    stroke={
                      isValidPlacement
                        ? '#10b981'
                        : isHighlighted
                        ? '#fbbf24'
                        : isSelected
                        ? '#f59e0b'
                        : isHovered
                        ? '#38bdf8'
                        : owner
                        ? owner.color
                        : `${district.color}70`
                    }
                    strokeWidth={
                      isValidPlacement ? 4 : isHighlighted ? 3.5 : isSelected ? 3.5 : isHovered ? 3 : 1.8
                    }
                    strokeDasharray={owner ? 'none' : isHighlighted ? '3,3' : '4,4'}
                    filter={
                      isValidPlacement
                        ? 'url(#glow-green-big)'
                        : isHighlighted || isSelected
                        ? 'url(#glow-gold-big)'
                        : undefined
                    }
                    opacity={isInvalidPlacement ? 0.35 : 1}
                  />

                  {/* Corner Ownership Ribbon */}
                  {owner && (
                    <polygon
                      points={`${lotDef.polygon[0][0]},${lotDef.polygon[0][1]} ${
                        lotDef.polygon[0][0] + 18
                      },${lotDef.polygon[0][1]} ${lotDef.polygon[0][0]},${
                        lotDef.polygon[0][1] + 18
                      }`}
                      fill={owner.color}
                    />
                  )}

                  {/* Built Business or Vacant Cadastral Label */}
                  {lotState?.builtBusiness ? (
                    renderBuildingOnLot(
                      lotState.builtBusiness.businessTypeId,
                      lotDef.labelPos,
                      shopStatus
                    )
                  ) : (
                    <g transform={`translate(${lotDef.labelPos[0]}, ${lotDef.labelPos[1]})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={isHighlighted ? '14' : '12'}
                        fill={isHighlighted ? '#78350f' : '#0f172a'}
                        stroke={isHighlighted ? '#fbbf24' : district.color}
                        strokeWidth={isHighlighted ? '2' : '1.5'}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={isHighlighted ? '#fbbf24' : '#f8fafc'}
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {lotDef.id}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Camera Toolbar */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-1.5 bg-stone-900/90 border border-stone-800 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
        <button
          id="map-zoom-in"
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
          className="p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="map-zoom-out"
          onClick={() => setZoom((z) => Math.max(0.45, z - 0.2))}
          className="p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="map-recenter"
          onClick={resetCamera}
          className="p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          title="Overview Board"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          id="map-my-lots"
          onClick={focusMyProperties}
          className="p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
          title="Focus My Holdings"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Active Placement Banner */}
      {selectedTileForPlacement && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-emerald-600/90 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-2xl border border-emerald-400 backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Hammer className="w-4 h-4 text-emerald-200" />
          <span>
            Deploying [{BUSINESS_DEFINITIONS[selectedTileForPlacement.businessTypeId]?.code}] {BUSINESS_DEFINITIONS[selectedTileForPlacement.businessTypeId]?.name}: Click any glowing parcel on the map
          </span>
        </div>
      )}

      {/* Hover Parcel Tooltip */}
      {hoveredLotId && (
        <div className="absolute bottom-24 right-4 z-10 bg-stone-950/95 border border-stone-800 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs flex items-center gap-2.5 pointer-events-none">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                DISTRICTS[LOT_DEFINITIONS.find((l) => l.id === hoveredLotId)?.districtId || 'A']?.color,
            }}
          />
          <span className="font-mono font-bold text-stone-100 text-sm">Lot {hoveredLotId}:</span>
          <span className="text-stone-300 font-medium">
            {LOT_DEFINITIONS.find((l) => l.id === hoveredLotId)?.name.replace(`Lot ${hoveredLotId} • `, '')}
          </span>
          {lots[hoveredLotId]?.ownerId && (
            <span
              className="text-[11px] px-2 py-0.5 rounded font-bold text-white ml-1"
              style={{ backgroundColor: getPlayer(lots[hoveredLotId]?.ownerId)?.color }}
            >
              {getPlayer(lots[hoveredLotId]?.ownerId)?.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

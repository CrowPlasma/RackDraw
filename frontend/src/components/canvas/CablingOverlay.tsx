import { useEffect, useState } from 'react';
import { useRackStore } from '../../store/useRackStore';

interface CablePath {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  y_border1: number;
  y_border2: number;
  color: string;
  type: string;
  isHighlighted: boolean;
  channelX: number;
  label: string;
}

interface CablingOverlayProps {
  scale: number;
  cablingViewMode: 'all' | 'selected';
  selectedConnectionId: string | null;
}

export default function CablingOverlay({ scale, cablingViewMode, selectedConnectionId }: CablingOverlayProps) {
  const { wirelist, activeDevice, isMultiRackView, racks } = useRackStore();
  const [paths, setPaths] = useState<CablePath[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Calculate coordinates using getBoundingClientRect divided by scale to ensure absolute accuracy
  const getPortCenter = (portId: string, wrapper: HTMLElement) => {
    const el = document.getElementById(`port-${portId}`);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    // Prevent rendering if the element does not have a physical layout yet (zero dimensions)
    if (rect.width === 0 || rect.height === 0) return null;

    // Convert viewport-relative coordinates to unscaled parent wrapper-relative coordinates
    const x = (rect.left - wrapperRect.left) / scale;
    const y = (rect.top - wrapperRect.top) / scale;
    const w = rect.width / scale;
    const h = rect.height / scale;

    return {
      el,
      x: x + w / 2,
      y: y + h / 2,
    };
  };

  // Determine vertical offset (going to top or bottom bezel) based on physical row placement
  const getPortBezelY = (portEl: HTMLElement, absoluteY: number) => {
    const parent = portEl.parentElement;
    if (!parent) return absoluteY - 14;

    const relativeTop = portEl.offsetTop || 0;
    const parentHeight = parent.offsetHeight || 0;

    // Top row -> route along top bezel (go UP by 14px). Bottom row -> route along bottom bezel (go DOWN by 14px)
    if (relativeTop < parentHeight / 2) {
      return absoluteY - 14;
    } else {
      return absoluteY + 14;
    }
  };

  const calculatePositions = () => {
    const wrapper = document.getElementById('rack-content-wrapper');
    if (!wrapper) return;

    const tables = Array.from(wrapper.querySelectorAll('.rack-table-instance')) as HTMLElement[];
    if (tables.length === 0) return;

    const wrapperRect = wrapper.getBoundingClientRect();

    // Map each rack's right edge relative to wrapper (unscaled)
    const rackRightMap = new Map<string, number>();
    let defaultRight = 1080;
    tables.forEach((tbl) => {
      const rId = tbl.getAttribute('data-rack-id');
      const rightEdge = (tbl.getBoundingClientRect().right - wrapperRect.left) / scale;
      if (rId) rackRightMap.set(rId, rightEdge);
      defaultRight = Math.max(defaultRight, rightEdge);
    });

    const newPaths: CablePath[] = [];

    (wirelist || []).forEach((conn, index) => {
      const srcPos = getPortCenter(conn.sourcePortId, wrapper);
      const destPos = getPortCenter(conn.destPortId, wrapper);

      if (srcPos && destPos) {
        const x1 = srcPos.x;
        const y1 = srcPos.y;
        const x2 = destPos.x;
        const y2 = destPos.y;

        // Structured bezel routing calculations
        const y_border1 = getPortBezelY(srcPos.el, y1);
        const y_border2 = getPortBezelY(destPos.el, y2);

        // Determine which rack's runway channel to use
        const srcRackTable = srcPos.el.closest('.rack-table-instance') as HTMLElement | null;
        const srcRackId = srcRackTable?.getAttribute('data-rack-id') || conn.sourcePort?.device?.rackId || '';
        const baseRight = rackRightMap.get(srcRackId) ?? defaultRight;
        const runwayStart = baseRight + 24;

        // Dynamic cabling channel runway starts outside the rack frame.
        const channelX = runwayStart + ((index % 120) * 1.8);

        // Verify all values are valid numbers before pushing
        const isValid = 
          !isNaN(x1) && isFinite(x1) &&
          !isNaN(y1) && isFinite(y1) &&
          !isNaN(x2) && isFinite(x2) &&
          !isNaN(y2) && isFinite(y2) &&
          !isNaN(y_border1) && isFinite(y_border1) &&
          !isNaN(y_border2) && isFinite(y_border2) &&
          !isNaN(channelX) && isFinite(channelX);

        if (!isValid) return; // Skip invalid math paths to prevent browser render cut-offs

        // Calculate highlights
        let isHighlighted = true;
        let shouldDraw = true;

        const touchesActiveDevice = activeDevice && (
          conn.sourcePort?.deviceId === activeDevice.id ||
          conn.destPort?.deviceId === activeDevice.id ||
          activeDevice.ports.some(p => p.id === conn.sourcePortId || p.id === conn.destPortId)
        );

        const isTargetConnection = selectedConnectionId === conn.id;

        const printMode = cablingViewMode === 'selected' && !isPrinting ? 'selected' : 'all';

        if (printMode === 'selected') {
          // SELECTIVE MODE: Prioritize individual interface connection.
          if (selectedConnectionId) {
            shouldDraw = isTargetConnection;
            isHighlighted = isTargetConnection;
          } else {
            shouldDraw = false;
          }
        } else {
          // GENERAL MODE: Draw all cables, highlight selections.
          shouldDraw = true;
          if (isPrinting) {
            isHighlighted = true;
          } else if (selectedConnectionId) {
            isHighlighted = isTargetConnection;
          } else if (activeDevice) {
            isHighlighted = !!touchesActiveDevice;
          } else {
            isHighlighted = true;
          }
        }

        if (shouldDraw) {
          const label = conn.labelTag || `${conn.sourcePort?.name} ➔ ${conn.destPort?.name}`;

          newPaths.push({
            id: conn.id,
            x1,
            y1,
            x2,
            y2,
            y_border1,
            y_border2,
            color: conn.cableColor,
            type: conn.cableType,
            isHighlighted,
            channelX,
            label,
          });
        }
      }
    });

    setPaths(newPaths);
  };

  useEffect(() => {
    // Initial run
    calculatePositions();

    window.addEventListener('resize', calculatePositions);
    
    // Create observer for body resize & rack table resize
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculatePositions);
    });

    observer.observe(document.body);
    const tables = document.querySelectorAll('.rack-table-instance');
    tables.forEach((t) => observer.observe(t));

    // Setup an interval to repeatedly poll for coordinates for the first 3 seconds
    // to handle dynamic browser repaint/CSS scale settling.
    let count = 0;
    const interval = setInterval(() => {
      calculatePositions();
      count++;
      if (count > 10) {
        clearInterval(interval);
      }
    }, 300);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculatePositions);
      clearInterval(interval);
    };
  }, [wirelist, activeDevice, scale, cablingViewMode, selectedConnectionId, isPrinting, isMultiRackView, racks]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(calculatePositions);
    return () => cancelAnimationFrame(animationFrame);
  }, [activeDevice, scale, cablingViewMode, selectedConnectionId, isPrinting, isMultiRackView, racks]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <defs>
        {paths.map((p) => (
          <marker
            key={`arrow-${p.id}`}
            id={`arrow-${p.id}`}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill={p.color} />
          </marker>
        ))}
        {paths.map((p) => (
          <filter key={`glow-${p.id}`} id={`glow-${p.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {paths.map((p) => {
        // Check if fiber to render dotted line, power for dashed line, copper for solid line
        const isFiber = p.type === 'FIBER' || p.type.includes('FIBER');
        const isPower = p.type === 'POWER';
        const strokeDasharray = isFiber ? '4,4' : isPower ? '6,6' : 'none';

        // Structured routing path going vertically into top or bottom bezels, then horizontally to runway
        const pathData = `M ${p.x1} ${p.y1} L ${p.x1} ${p.y_border1} L ${p.channelX} ${p.y_border1} L ${p.channelX} ${p.y_border2} L ${p.x2} ${p.y_border2} L ${p.x2} ${p.y2}`;
        const labelY = (p.y_border1 + p.y_border2) / 2;

        return (
          <g key={p.id}>
            {p.isHighlighted && (
              <path
                d={pathData}
                fill="none"
                stroke={p.color}
                strokeWidth={7}
                opacity={0.25}
                filter={`url(#glow-${p.id})`}
                style={{ transition: 'all 0.3s ease' }}
              />
            )}
            
            <path
              d={pathData}
              fill="none"
              stroke={p.color}
              strokeWidth={p.isHighlighted ? 3 : 1.2}
              opacity={p.isHighlighted ? 0.95 : 0.08}
              markerEnd={`url(#arrow-${p.id})`}
              style={{
                transition: 'all 0.3s ease',
                strokeDasharray,
              }}
            />

            {p.isHighlighted && (
              <g transform={`translate(${p.channelX + 8}, ${labelY})`}>
                <rect
                  x="-2"
                  y="-9"
                  width={p.label.length * 5.2 + 8}
                  height="14"
                  rx="3"
                  fill="var(--bg-panel-solid)"
                  stroke="var(--border-glass)"
                  strokeWidth="1"
                  opacity={0.95}
                />
                <text
                  fill="var(--text-secondary)"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {p.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

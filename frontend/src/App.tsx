import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import RackfaceGrid from './components/rackface/RackfaceGrid';
import CablingOverlay from './components/canvas/CablingOverlay';
import WireListPanel from './components/layout/WireListPanel';
import ConnectionModal from './components/ui/ConnectionModal';
import { useRackStore, Port, Device, Connection } from './store/useRackStore';
import { Cable, RefreshCw, Info, Sun, Moon, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Printer, Download, Globe, Columns, Eye, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const {
    rackDetails,
    activeRack,
    racks,
    isMultiRackView,
    setMultiRackView,
    isViewOnly,
    setViewOnly,
    isLoading,
    error,
    toasts,
    dismissToast,
    wirelist,
    setActiveDevice,
    activeProject,
    showToast
  } = useRackStore();

  // Connection mapping state (Packet Tracer style)
  const [pendingSourcePort, setPendingSourcePort] = useState<Port | null>(null);
  const [pendingSourceDevice, setPendingSourceDevice] = useState<Device | null>(null);
  
  const [destPort, setDestPort] = useState<Port | null>(null);
  const [destDevice, setDestDevice] = useState<Device | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected Connection (for active cables) & Selected Port (for active/inactive ports)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [selectedPortDevice, setSelectedPortDevice] = useState<Device | null>(null);

  // Cabling View Mode ('all' or 'selected')
  const [cablingViewMode, setCablingViewMode] = useState<'all' | 'selected'>('all');

  // Zoom scale state (Draw.io style)
  const [scale, setScale] = useState(0.85);

  // Collapsible Sidebar States
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Theme Management
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('rackdraw-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      return 'light';
    }
    document.documentElement.setAttribute('data-theme', 'dark');
    return 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('rackdraw-theme', newTheme);
  };

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('rackdraw-lang', newLang);
  };

  const handleExportCSV = () => {
    if (!activeRack || !wirelist || wirelist.length === 0) {
      showToast(t("toast.noCablesToExport"), 'info');
      return;
    }

    const headers = ['Etiqueta', 'Equipo Origen', 'Puerto Origen', 'Equipo Destino', 'Puerto Destino', 'Tipo de Cable', 'Color', 'Longitud (Metros)'];
    
    const rows = wirelist.map(conn => {
      const srcDev = conn.sourcePort?.device?.name || 'Desconocido';
      const srcPort = conn.sourcePort?.name || 'Desconocido';
      const destDev = conn.destPort?.device?.name || 'Desconocido';
      const destPort = conn.destPort?.name || 'Desconocido';
      
      // Escape quotes for CSV
      const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;

      return [
        escapeCSV(conn.labelTag || ''),
        escapeCSV(srcDev),
        escapeCSV(srcPort),
        escapeCSV(destDev),
        escapeCSV(destPort),
        escapeCSV(conn.cableType.replace('_', ' ')),
        escapeCSV(conn.cableColor),
        escapeCSV(conn.lengthMeters.toString())
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const bom = '\uFEFF'; // For Excel UTF-8 recognition
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Wirelist_${activeRack.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Zoom scale state (Draw.io style via Ctrl+Scroll) & Right-click Pan (Drag Scroll)
  React.useEffect(() => {
    const container = document.getElementById('rack-container');
    if (!container) return;

    // 1. Ctrl + Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        setScale((prev) => Math.min(2.5, Math.max(0.3, prev + delta)));
      }
    };

    // 2. Right-click Pan (Drag Scroll)
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollLeftStart = 0;
    let scrollTopStart = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) { // Right Click
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        scrollLeftStart = container.scrollLeft;
        scrollTopStart = container.scrollTop;
        container.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      container.scrollLeft = scrollLeftStart - dx;
      container.scrollTop = scrollTopStart - dy;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2 && isPanning) {
        isPanning = false;
        container.style.cursor = 'auto';
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handlePortClick = (port: Port, device: Device) => {
    const existingConn = (wirelist || []).find(
      (c) => c.sourcePortId === port.id || c.destPortId === port.id
    );

    if (!isViewOnly && pendingSourcePort && pendingSourceDevice) {
      if (port.id === pendingSourcePort.id) {
        cancelConnectionMapping();
      } else {
        setDestPort(port);
        setDestDevice(device);
        setIsModalOpen(true);
      }
      return;
    }

    setSelectedPort(port);
    setSelectedPortDevice(device);
    setActiveDevice(device);

    if (existingConn) {
      setSelectedConnection(existingConn);
    } else {
      setSelectedConnection(null);
    }
  };

  const startCablingFromPort = (port: Port, device: Device) => {
    if (isViewOnly) return;
    setSelectedConnection(null);
    setPendingSourcePort(port);
    setPendingSourceDevice(device);
  };

  const cancelConnectionMapping = () => {
    setPendingSourcePort(null);
    setPendingSourceDevice(null);
    setDestPort(null);
    setDestDevice(null);
    setIsModalOpen(false);
  };

  const handleCanvasClick = () => {
    setActiveDevice(null);
    setSelectedConnection(null);
    setSelectedPort(null);
    setSelectedPortDevice(null);
    cancelConnectionMapping();
  };

  const getAppBackground = () => {
    return theme === 'dark'
      ? 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8) 0%, var(--bg-deep) 100%)'
      : 'radial-gradient(circle at 50% 50%, rgba(226, 232, 240, 0.6) 0%, var(--bg-deep) 100%)';
  };

  const getRackEstimatedHeight = () => {
    if (isMultiRackView && racks.length > 0) {
      const maxU = Math.max(...racks.map((r) => r.heightU || 42));
      return maxU * 64 + 600;
    }
    if (!rackDetails) return 2200;
    return rackDetails.heightU * 64 + 600; // Increased to prevent bottom PDU cables from being cut off by SVG container boundary
  };

  const getRackEstimatedWidth = () => {
    if (isMultiRackView && racks.length > 0) {
      return Math.max(1500, racks.length * 1450 + 200);
    }
    return 1500;
  };

  const clearAllSelections = () => {
    setSelectedConnection(null);
    setSelectedPort(null);
    setSelectedPortDevice(null);
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-deep)',
      backgroundImage: getAppBackground(),
      transition: 'background-image 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Header */}
      <header className="no-print" style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: theme === 'dark' ? 'rgba(10, 15, 26, 0.85)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'var(--blur-glass)',
        zIndex: 45,
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-neon-blue), var(--accent-neon-purple))',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-neon)',
          }}>
            <Cable size={20} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>
              Rack<span style={{ color: 'var(--accent-neon-blue)' }}>Draw</span>
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '-2px' }}>
              {t("app.tagline")}
            </span>
          </div>
        </div>

        {/* Global connection/status notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {pendingSourcePort && pendingSourceDevice && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              animation: 'pulse 2s infinite',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--accent-neon-green)',
                borderRadius: '50%',
                boxShadow: 'var(--shadow-neon-green)',
                display: 'inline-block'
              }}></span>
              <span>
                {t("app.origin")} <strong>{pendingSourceDevice.name} / {pendingSourcePort.name}</strong> {t("app.selectDest")}
              </span>
              <button 
                onClick={cancelConnectionMapping}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--accent-neon-blue)',
              borderRadius: '50%',
              boxShadow: 'var(--shadow-neon)',
              display: 'inline-block'
            }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>{t('app.dockerActive')}</span>
          </div>

          {activeProject && racks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Multi-Rack Toggle */}
              <button
                onClick={() => setMultiRackView(!isMultiRackView)}
                className={`btn ${isMultiRackView ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  border: isMultiRackView ? 'none' : '1px solid var(--border-glass)',
                }}
                title="Alternar Vista Multi-Rack / Inter-Rack Cabling"
              >
                <Columns size={16} />
                {isMultiRackView ? t('app.multiRackView') : t('app.singleRackView')}
              </button>

              {/* View-Only vs Edit Mode Toggle */}
              <button
                onClick={() => {
                  const nextMode = !isViewOnly;
                  setViewOnly(nextMode);
                  if (nextMode) cancelConnectionMapping();
                }}
                className="btn btn-secondary"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  border: isViewOnly ? '1px solid var(--accent-neon-yellow)' : '1px solid var(--border-glass)',
                  backgroundColor: isViewOnly ? 'rgba(234, 179, 8, 0.15)' : undefined,
                  color: isViewOnly ? 'var(--accent-neon-yellow)' : 'var(--text-primary)',
                  fontWeight: 600,
                }}
                title="Alternar Modo Lectura / Modo Edición"
              >
                {isViewOnly ? <Eye size={16} /> : <Edit3 size={16} />}
                {isViewOnly ? t('app.viewModeOnly') : t('app.editMode')}
              </button>
            </div>
          )}

          {activeRack && (
            <>
              <button 
                onClick={handleExportCSV}
                className="btn btn-secondary" 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  gap: '6px',
                  border: '1px solid var(--border-glass)',
                }}
                title="Exportar Wirelist a CSV (Excel)"
              >
                <Download size={16} /> {t('app.exportCSV')}
              </button>
              
              <button 
                onClick={() => window.print()}
                className="btn btn-primary" 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  gap: '6px'
                }}
                title={t("app.printPdf")}
              >
                <Printer size={16} /> {t('app.generateReport')}
              </button>
            </>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={toggleLang}
              className="btn btn-secondary" 
              style={{ 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-glass)',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
              title="Cambiar Idioma / Change Language"
            >
              <Globe size={16} color="var(--accent-neon-blue)" /> {i18n.language.toUpperCase()}
            </button>

            <button 
              onClick={toggleTheme}
              className="btn btn-secondary" 
              style={{ 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-glass)',
              }}
            >
              {theme === 'dark' ? <Sun size={16} color="var(--accent-neon-yellow)" /> : <Moon size={16} color="var(--accent-neon-blue)" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* Sleek Floating Left Sidebar Toggle Button */}
        <button
          className="no-print"
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          style={{
            position: 'absolute',
            left: leftCollapsed ? '0px' : 'var(--sidebar-width)',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 42,
            width: '20px',
            height: '60px',
            backgroundColor: 'var(--bg-panel-solid)',
            border: '1px solid var(--border-glass)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
            transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
          }}
          title={leftCollapsed ? "Expandir panel izquierdo" : "Colapsar panel izquierdo"}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-neon-blue)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {leftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Left Sidebar Wrap */}
        <div className="no-print" style={{
          width: leftCollapsed ? '0px' : 'var(--sidebar-width)',
          minWidth: leftCollapsed ? '0px' : 'var(--sidebar-width)',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: leftCollapsed ? 'none' : '1px solid var(--border-glass)',
          backgroundColor: 'var(--bg-panel)',
        }}>
          <Sidebar />
        </div>

        {/* Center Rackface Workspace */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(5, 8, 16, 0.01)',
          padding: '24px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              zIndex: 50,
              fontSize: '0.8rem',
              backgroundColor: 'var(--bg-panel-solid)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              color: 'var(--accent-neon-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <RefreshCw size={14} className="animate-spin" /> Cargando...
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: 'var(--accent-neon-red)',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <Info size={16} /> {error}
            </div>
          )}

          {isViewOnly && (
            <div className="no-print" style={{
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              color: 'var(--accent-neon-yellow)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Eye size={15} /> {t("app.viewOnlyBanner")}
            </div>
          )}

          {/* Print Title (Visible only in PDF/Print) */}
          <h2 className="print-only" style={{ fontSize: '1.6rem', fontWeight: 800, borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center', color: '#0f172a' }}>
            {t("app.rackLayoutWith")}
          </h2>

          <div 
            id="rack-container"
            className="grid-canvas"
            onClick={handleCanvasClick}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              flex: 1,
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto', // Dynamic vertical & horizontal scrolling
              display: 'block', // Block container for browser native scrollbars
              boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              padding: '40px',
            }}
          >
            {activeRack ? (
              /* Infinite Scroll Wrapper: scales boundaries layout inline so scrollbars pop up natively */
              <div 
                className="rack-scroll-wrapper"
                style={{
                  width: `${getRackEstimatedWidth() * scale}px`,
                  height: `${getRackEstimatedHeight() * scale}px`,
                  margin: '0 auto',
                  overflow: 'visible',
                }}
              >
                <div 
                  id="rack-content-wrapper"
                  style={{
                    position: 'relative', 
                    width: `${getRackEstimatedWidth()}px`,
                    height: `${getRackEstimatedHeight()}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {isMultiRackView ? (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '340px', alignItems: 'flex-start' }}>
                      {racks.map((r) => (
                        <div key={r.id} style={{ width: '1100px', flexShrink: 0 }}>
                          <RackfaceGrid
                            rack={r}
                            onPortClick={handlePortClick}
                            pendingSourcePort={pendingSourcePort}
                            selectedPort={selectedPort}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <RackfaceGrid 
                      onPortClick={handlePortClick}
                      pendingSourcePort={pendingSourcePort}
                      selectedPort={selectedPort}
                    />
                  )}
                  
                  {/* Cables render layer */}
                  <CablingOverlay 
                    scale={scale} 
                    cablingViewMode={cablingViewMode}
                    selectedConnectionId={selectedConnection ? selectedConnection.id : null}
                  />
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '12px',
                textAlign: 'center',
                maxWidth: '400px',
                margin: 'auto'
              }}>
                <Cable size={48} color="rgba(128,128,128,0.2)" />
                <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t("app.welcome")}</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                  {t("app.welcomeMsg")}
                </p>
              </div>
            )}
          </div>

          {/* Floating Zoom & Visibility Toolbar */}
          {activeRack && (
            <div className="no-print" style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 10,
            }}>
              {/* Zoom Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--bg-panel-solid)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                backdropFilter: 'var(--blur-glass)',
              }}>
                <button 
                  onClick={() => setScale(s => Math.max(0.3, s - 0.15))}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 8px', borderRadius: '4px', border: 'none' }}
                  title="Alejar vista"
                >
                  <ZoomOut size={15} />
                </button>
                
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)', 
                  minWidth: '52px', 
                  textAlign: 'center',
                  userSelect: 'none'
                }}>
                  {Math.round(scale * 100)}%
                </span>
                
                <button 
                  onClick={() => setScale(s => Math.min(2.5, s + 0.15))}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 8px', borderRadius: '4px', border: 'none' }}
                  title="Acercar vista"
                >
                  <ZoomIn size={15} />
                </button>

                <button 
                  onClick={() => setScale(1.0)}
                  className="btn btn-secondary" 
                  style={{ padding: '5px 8px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 700, border: 'none' }}
                  title="Restaurar escala"
                >
                  100%
                </button>
              </div>

              {/* Cable Visibility HUD Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-panel-solid)',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                backdropFilter: 'var(--blur-glass)',
                gap: '2px',
              }}>
                <button
                  onClick={() => setCablingViewMode('all')}
                  className={`btn ${cablingViewMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', border: 'none' }}
                  title="Ver todas las conexiones del Rack"
                >{t("app.viewAll")}</button>
                <button
                  onClick={() => setCablingViewMode('selected')}
                  className={`btn ${cablingViewMode === 'selected' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', border: 'none' }}
                  title="Ocultar cables no seleccionados"
                >
                  {t("app.selectionOnly")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sleek Floating Right Sidebar Toggle Button */}
        <button
          className="no-print"
          onClick={() => setRightCollapsed(!rightCollapsed)}
          style={{
            position: 'absolute',
            right: rightCollapsed ? '0px' : '380px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 42,
            width: '20px',
            height: '60px',
            backgroundColor: 'var(--bg-panel-solid)',
            border: '1px solid var(--border-glass)',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
            transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
          }}
          title={rightCollapsed ? "Expandir panel derecho" : "Colapsar panel derecho"}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-neon-blue)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {rightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Right Sidebar Wrap */}
        <div className="no-print" style={{
          width: rightCollapsed ? '0px' : '380px',
          minWidth: rightCollapsed ? '0px' : '380px',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: rightCollapsed ? 'none' : '1px solid var(--border-glass)',
          backgroundColor: 'var(--bg-panel)',
        }}>
          <WireListPanel 
            selectedConnection={selectedConnection}
            selectedPort={selectedPort}
            selectedPortDevice={selectedPortDevice}
            onClearSelection={clearAllSelections}
            onStartCabling={startCablingFromPort}
          />
        </div>
      </div>

      {/* Cabling Modal Mapping */}
      {isModalOpen && pendingSourcePort && pendingSourceDevice && destPort && destDevice && (
        <ConnectionModal
          isOpen={isModalOpen}
          onClose={cancelConnectionMapping}
          sourcePort={pendingSourcePort}
          sourceDevice={pendingSourceDevice}
          destPort={destPort}
          destDevice={destDevice}
        />
      )}

      {/* Floating Toast Notification Container */}
      <div className="no-print" style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 200,
        maxWidth: '320px',
        width: '100%',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => {
          const getBorderColor = () => {
            if (toast.type === 'success') return 'var(--accent-neon-green)';
            if (toast.type === 'error') return 'var(--accent-neon-red)';
            return 'var(--accent-neon-blue)';
          };

          return (
            <div
              key={toast.id}
              className="glass-panel"
              style={{
                padding: '12px 16px',
                borderLeft: `4px solid ${getBorderColor()}`,
                backgroundColor: 'var(--bg-panel-solid)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                pointerEvents: 'auto',
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {toast.message}
              </span>
              <button
                onClick={() => dismissToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Print-only Technical Memo Report */}
      {activeRack && rackDetails && (
        <div className="print-report-container">
          {/* PAGE 2 starts here! Since Page 1 is the main screen rack with cables, we trigger a page break at the start of page 2 container */}
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center', color: '#1e293b' }}>
            {t("app.rackLayoutWithout")}
          </h2>
          
          <div className="print-rack-wrapper" style={{ marginBottom: '40px', overflow: 'visible', pageBreakAfter: 'always' }}>
            <RackfaceGrid isPrintCopy={true} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px', color: '#0f172a' }}>
            {t("app.reportTitle")}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', fontSize: '0.9rem' }}>
            <div>
              <p><strong>Proyecto:</strong> {activeProject?.name}</p>
              <p><strong>{t("app.projectDesc")}</strong> {activeProject?.description || 'N/A'}</p>
              <p><strong>Rack / Gabinete:</strong> {rackDetails.name}</p>
              <p><strong>Altura total:</strong> {rackDetails.heightU} U</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p><strong>{t("app.issueDate")}</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Total Equipos Montados:</strong> {rackDetails.devices?.length || 0}</p>
              <p><strong>Total Enlaces Activos:</strong> {wirelist?.length || 0}</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '15px', marginTop: '30px', color: '#1e293b' }}>
            Inventario y Mapeo de Interfaces
          </h3>

          {rackDetails.devices && rackDetails.devices.length === 0 ? (
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No hay equipos montados en este rack.</p>
          ) : (
            (rackDetails.devices || []).map((device) => {
              // Sort ports by name
              const sortedPorts = [...device.ports].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
              
              return (
                <div key={device.id} style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b' }}>
                    📟 Slot {device.positionU} ({device.heightU}U) • {device.brand} {device.name} (Mod: {device.model}, S/N: {device.serialNumber})
                  </h4>
                  
                  <table className="print-report-table">
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Puerto Local</th>
                        <th style={{ width: '20%' }}>Tipo / Vel.</th>
                        <th style={{ width: '55%' }}>Mapeo / Destino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPorts.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ fontStyle: 'italic', fontSize: '0.75rem', textAlign: 'center' }}>
                            Sin puertos configurados.
                          </td>
                        </tr>
                      ) : (
                        sortedPorts.map((port) => {
                          const conn = (wirelist || []).find(
                            (c) => c.sourcePortId === port.id || c.destPortId === port.id
                          );

                          let connectionText = 'No asignado / Disponible';
                          let textStyle: React.CSSProperties = { color: '#64748b', fontStyle: 'italic' };

                          if (conn) {
                            const isSource = conn.sourcePortId === port.id;
                            const otherPort = isSource ? conn.destPort : conn.sourcePort;
                            if (otherPort) {
                              connectionText = `Conecta a: ${otherPort.device?.name} (puerto ${otherPort.name}) | Cable: ${conn.cableType} (${conn.lengthMeters}m) ${conn.labelTag ? `[Etiqueta: ${conn.labelTag}]` : ''}`;
                              textStyle = { color: '#0f172a', fontWeight: 500 };
                            }
                          }

                          return (
                            <tr key={port.id}>
                              <td>
                                🔌 {port.name}
                              </td>
                              <td>
                                {port.type} ({port.speed})
                              </td>
                              <td style={textStyle}>
                                {connectionText}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default App;

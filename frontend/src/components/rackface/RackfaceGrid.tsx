import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from "react-i18next";
import { useRackStore, Device, Port, Rack } from '../../store/useRackStore';
import { Trash2, Cable, GripVertical, Edit3, X, Save, Copy } from 'lucide-react';

interface RackfaceGridProps {
  rack?: Rack;
  onPortClick?: (port: Port, device: Device) => void;
  pendingSourcePort?: Port | null;
  selectedPort?: Port | null;
  isPrintCopy?: boolean;
}

const ROW_HEIGHT = 64; // Height per U slot in pixels (increased from 48px to 64px)
const CARD_GAP = 10;    // Margin gap between adjacent equipment cards (increased from 6px to 10px)

export default function RackfaceGrid({ rack, onPortClick, pendingSourcePort, selectedPort, isPrintCopy = false }: RackfaceGridProps) {
  const { t } = useTranslation();
  const {
    rackDetails: storeRackDetails,
    activeDevice,
    setActiveDevice,
    deleteDevice,
    createDevice,
    wirelist,
    updateDevice,
    showToast,
    isViewOnly,
  } = useRackStore();

  const rackDetails = rack || storeRackDetails;

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Drag and drop states
  const [draggedDevice, setDraggedDevice] = useState<Device | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, device: Device) => {
    if (isViewOnly) {
      e.preventDefault();
      return;
    }
    setDraggedDevice(device);
    e.dataTransfer.setData('text/plain', device.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slot: number) => {
    e.preventDefault();
    if (!draggedDevice) return;
    e.dataTransfer.dropEffect = 'move';

    const rackHeight = rackDetails?.heightU || 48;
    const existingDevices = rackDetails?.devices || [];
    let adjustedSlot = slot;
    let canFit = false;

    // Shift logic to fit the dragged device of height starting at slot
    for (let testSlot = slot; testSlot >= slot - draggedDevice.heightU + 1; testSlot--) {
      const startU = testSlot;
      const endU = testSlot + draggedDevice.heightU - 1;

      if (startU < 1 || endU > rackHeight) {
        continue;
      }

      let hasOverlap = false;
      for (const dev of existingDevices) {
        if (dev.id === draggedDevice.id) continue;
        const devStart = dev.positionU;
        const devEnd = dev.positionU + dev.heightU - 1;
        if (startU <= devEnd && devStart <= endU) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        adjustedSlot = testSlot;
        canFit = true;
        break;
      }
    }

    if (canFit) {
      setDragOverSlot(adjustedSlot);
    } else {
      setDragOverSlot(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, _slot: number) => {
    e.preventDefault();
    if (!draggedDevice || dragOverSlot === null) {
      setDraggedDevice(null);
      setDragOverSlot(null);
      return;
    }

    const targetSlot = dragOverSlot;
    setDraggedDevice(null);
    setDragOverSlot(null);

    if (targetSlot === draggedDevice.positionU) {
      return;
    }

    try {
      await updateDevice(draggedDevice.id, {
        positionU: targetSlot,
      });
    } catch (err) {
      // Handled by store toasts
    }
  };

  // Form states
  const [devName, setDevName] = useState('');
  const [devBrand, setDevBrand] = useState('');
  const [devModel, setDevModel] = useState('');
  const [devSerial, setDevSerial] = useState('');
  const [devHeight, setDevHeight] = useState(1);
  const [devColor, setDevColor] = useState('#38bdf8');
  
  // Custom port counts
  const [copperCount, setCopperCount] = useState(8);
  const [sfpCount, setSfpCount] = useState(2);
  const [gbicCount, setGbicCount] = useState(0);
  const [mgmtCount, setMgmtCount] = useState(1);
  const [powerCount, setPowerCount] = useState(1);

  // Edit Device Modal states
  const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
  const [editTargetDevice, setEditTargetDevice] = useState<Device | null>(null);
  const [editDevName, setEditDevName] = useState('');
  const [editDevBrand, setEditDevBrand] = useState('');
  const [editDevModel, setEditDevModel] = useState('');
  const [editDevSerial, setEditDevSerial] = useState('');
  const [editDevColor, setEditDevColor] = useState('#38bdf8');
  const [editCopperCount, setEditCopperCount] = useState(0);
  const [editSfpCount, setEditSfpCount] = useState(0);
  const [editGbicCount, setEditGbicCount] = useState(0);
  const [editMgmtCount, setEditMgmtCount] = useState(0);
  const [editPowerCount, setEditPowerCount] = useState(0);

  // Delete Confirmation Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetDevice, setDeleteTargetDevice] = useState<Device | null>(null);

  const handleOpenEditDevice = (device: Device) => {
    setEditTargetDevice(device);
    setEditDevName(device.name);
    setEditDevBrand(device.brand);
    setEditDevModel(device.model);
    setEditDevSerial(device.serialNumber);
    setEditDevColor((device.metadata as any)?.color || '#38bdf8');
    setEditCopperCount(device.ports?.filter(p => p.type === 'COPPER').length || 0);
    setEditSfpCount(device.ports?.filter(p => p.type === 'SFP_FIBER').length || 0);
    setEditGbicCount(device.ports?.filter(p => p.type === 'GBIC_FIBER').length || 0);
    setEditMgmtCount(device.ports?.filter(p => p.type === 'MGMT').length || 0);
    setEditPowerCount(device.ports?.filter(p => p.type === 'POWER').length || 0);
    setShowEditDeviceModal(true);
  };

  const handleCloneDevice = async (device: Device) => {
    if (!rackDetails) return;
    
    const rackHeight = rackDetails.heightU;
    const existingDevices = rackDetails.devices || [];
    const heightNeeded = device.heightU;
    
    // Function to check if a range [startU, endU] is completely free
    const isSlotFree = (startU: number, endU: number) => {
      if (startU < 1 || endU > rackHeight) return false;
      for (const dev of existingDevices) {
        const devStart = dev.positionU;
        const devEnd = dev.positionU + dev.heightU - 1;
        if (startU <= devEnd && devStart <= endU) {
          return false;
        }
      }
      return true;
    };

    let targetU = null;
    
    // 1. Try directly above
    if (isSlotFree(device.positionU + device.heightU, device.positionU + device.heightU + heightNeeded - 1)) {
      targetU = device.positionU + device.heightU;
    } 
    // 2. Try directly below
    else if (isSlotFree(device.positionU - heightNeeded, device.positionU - 1)) {
      targetU = device.positionU - heightNeeded;
    }
    // 3. Scan whole rack bottom to top
    else {
      for (let u = 1; u <= rackHeight - heightNeeded + 1; u++) {
        if (isSlotFree(u, u + heightNeeded - 1)) {
          targetU = u;
          break;
        }
      }
    }

    if (targetU === null) {
      showToast('No hay espacio suficiente en el Rack para clonar este equipo.', 'error');
      return;
    }

    try {
      const matchName = device.name.match(/^(.*?)(\s*-\s*Copia\s*(\d+)?)$/i);
      let cloneName = `${device.name} - Copia`;
      if (matchName) {
        const num = parseInt(matchName[3] || '1', 10);
        cloneName = `${matchName[1]} - Copia ${num + 1}`;
      }

      const portsToCreate = (device.ports || []).map(p => ({
        name: p.name,
        type: p.type,
        speed: p.speed,
        direction: p.direction
      }));

      await createDevice({
        rackId: rackDetails.id,
        name: cloneName,
        brand: device.brand,
        model: device.model,
        serialNumber: `${device.serialNumber}-CLON`,
        positionU: targetU,
        heightU: device.heightU,
        metadata: device.metadata,
        ports: portsToCreate
      });
      
      showToast(`${t("app.toast.deviceCloned")}${targetU}.`, 'success');
    } catch (err: any) {
      // Store handles toast error
    }
  };

  const handleSaveEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetDevice) return;
    try {
      await updateDevice(editTargetDevice.id, {
        name: editDevName,
        brand: editDevBrand,
        model: editDevModel,
        serialNumber: editDevSerial,
        metadata: {
          ...((editTargetDevice.metadata as any) || {}),
          color: editDevColor,
        },
        portsSetup: {
          copper: editCopperCount,
          sfp: editSfpCount,
          gbic: editGbicCount,
          mgmt: editMgmtCount,
          power: editPowerCount
        }
      });
      setShowEditDeviceModal(false);
      showToast(t("toast.deviceUpdated"), 'success');
    } catch (_err) {
      // Errors handled by store toasts
    }
  };

  const handleRequestDelete = (device: Device) => {
    setDeleteTargetDevice(device);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetDevice) return;
    setShowDeleteConfirm(false);
    try {
      await deleteDevice(deleteTargetDevice.id);
    } catch (_err) {
      // Errors handled by store toasts
    }
    setDeleteTargetDevice(null);
  };

  if (!rackDetails) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
        gap: '12px'
      }}>
        <Cable size={32} />
        <span>Selecciona un rack para comenzar</span>
      </div>
    );
  }

  const connectedPortIds = new Set<string>();
  const portToConnectionMap = new Map<string, any>();

  (wirelist || []).forEach((c) => {
    connectedPortIds.add(c.sourcePortId);
    connectedPortIds.add(c.destPortId);
    portToConnectionMap.set(c.sourcePortId, c);
    portToConnectionMap.set(c.destPortId, c);
  });

  const isDeviceDinned = (device: Device) => {
    if (!activeDevice) return false;
    if (activeDevice.id === device.id) return false;

    const isConnected = (wirelist || []).some((conn) => {
      const activePorts = activeDevice.ports.map((p) => p.id);
      const targetPorts = device.ports.map((p) => p.id);

      return (
        (activePorts.includes(conn.sourcePortId) && targetPorts.includes(conn.destPortId)) ||
        (activePorts.includes(conn.destPortId) && targetPorts.includes(conn.sourcePortId))
      );
    });

    return !isConnected;
  };

  const handleOpenAddDevice = (slot: number) => {
    if (isViewOnly) return;
    setSelectedSlot(slot);
    setDevName('');
    setDevBrand('');
    setDevModel('');
    setDevSerial(`SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setDevHeight(1);
    setDevColor('#38bdf8');
    setCopperCount(8);
    setSfpCount(2);
    setGbicCount(0);
    setMgmtCount(1);
    setPowerCount(1);
    setShowAddDeviceModal(true);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlot === null) return;

    let ports: any[] = [];
    for (let i = 1; i <= copperCount; i++) {
      ports.push({ name: `P${i}`, type: 'COPPER', speed: '1Gbps' });
    }
    for (let i = 1; i <= sfpCount; i++) {
      ports.push({ name: `SFP${i}`, type: 'SFP_FIBER', speed: '10Gbps' });
    }
    for (let i = 1; i <= gbicCount; i++) {
      ports.push({ name: `GB${i}`, type: 'GBIC_FIBER', speed: '1Gbps' });
    }
    for (let i = 1; i <= mgmtCount; i++) {
      ports.push({ name: `Mg${i}`, type: 'MGMT', speed: '1Gbps' });
    }
    for (let i = 1; i <= powerCount; i++) {
      ports.push({ name: `Pwr${i}`, type: 'POWER', speed: 'N/A', direction: 'IN' });
    }

    // Smart auto-shift logic: if mounting height exceeds the top boundary or overlaps,
    // try to shift the start slot down so it still covers the selected slot but fits.
    const rackHeight = rackDetails.heightU;
    const existingDevices = rackDetails.devices || [];
    let adjustedSlot = selectedSlot;

    for (let testSlot = selectedSlot; testSlot >= selectedSlot - devHeight + 1; testSlot--) {
      const startU = testSlot;
      const endU = testSlot + devHeight - 1;

      // Check boundaries
      if (startU < 1 || endU > rackHeight) {
        continue;
      }

      // Check overlaps
      let hasOverlap = false;
      for (const dev of existingDevices) {
        const devStart = dev.positionU;
        const devEnd = dev.positionU + dev.heightU - 1;
        if (startU <= devEnd && devStart <= endU) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        adjustedSlot = testSlot;
        break;
      }
    }

    try {
      await createDevice({
        rackId: rackDetails.id,
        name: devName,
        brand: devBrand,
        model: devModel,
        serialNumber: devSerial,
        positionU: adjustedSlot,
        heightU: devHeight,
        metadata: { color: devColor },
        ports,
      });
      setShowAddDeviceModal(false);
    } catch (err: any) {
      // Handled in store
    }
  };

  const getBrandBorderColor = (device: Device) => {
    const customColor = (device.metadata as any)?.color;
    if (customColor) return customColor;

    const brand = device.brand;
    const b = brand.toLowerCase();
    if (b.includes('fortinet') || b.includes('fortigate')) return '#ef4444';
    if (b.includes('dell')) return '#0284c7';
    if (b.includes('juniper')) return '#14b8a6';
    if (b.includes('cisco')) return '#06b6d4';
    if (b.includes('hpe') || b.includes('storage') || b.includes('msa')) return '#f97316';
    if (b.includes('panduit') || b.includes('patch')) return '#64748b';
    if (b.includes('f5') || b.includes('application')) return '#ec4899';
    return 'var(--text-muted)';
  };

  const getDeviceStyle = (device: Device, isFocused: boolean) => {
    const brand = device.brand.toLowerCase();
    const model = device.model.toLowerCase();

    const baseStyle: React.CSSProperties = {
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '6px',
      padding: '0px', // Allow the stretched ports container to touch the outer border cleanly
      width: '100%',
    };

    if (brand.includes('fortinet') || brand.includes('fortigate')) {
      return {
        ...baseStyle,
        background: 'var(--device-bg-fortinet)',
        border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-fortinet)',
        boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
      };
    }
    if (brand.includes('dell') || model.includes('poweredge')) {
      return {
        ...baseStyle,
        background: 'var(--device-bg-dell)',
        border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-dell)',
        boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
      };
    }
    if (brand.includes('juniper')) {
      return {
        ...baseStyle,
        background: 'var(--device-bg-juniper)',
        border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-juniper)',
        boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
      };
    }
    if (brand.includes('cisco')) {
      return {
        ...baseStyle,
        background: 'var(--device-bg-cisco)',
        border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-cisco)',
        boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
      };
    }
    if (brand.includes('hpe') || brand.includes('storage') || model.includes('msa')) {
      return {
        ...baseStyle,
        background: 'var(--device-bg-hpe)',
        border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-hpe)',
        boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
      };
    }
    if (brand.includes('panduit') || model.includes('patch')) {
      return {
        ...baseStyle,
        background: 'var(--device-bg-panduit)',
        border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-panduit)',
        boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
      };
    }
    if (brand.includes('f5') || brand.includes('application')) {
      return {
        ...baseStyle,
        background: 'var(--device-bg-f5)',
        border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-f5)',
        boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
      };
    }

    return {
      ...baseStyle,
      background: 'var(--device-bg-generic)',
      border: isFocused ? '2px solid var(--accent-neon-blue)' : '1px solid var(--device-border-generic)',
      boxShadow: isFocused ? 'var(--shadow-neon)' : 'none',
    };
  };

  const renderPort = (port: Port, index: number, portSize: number, isCopper: boolean, totalGroupPorts: number, device: Device) => {
    const isConnected = connectedPortIds.has(port.id);
    const isPendingSource = pendingSourcePort?.id === port.id;
    const isSelected = selectedPort?.id === port.id;
    const conn = portToConnectionMap.get(port.id);
    const cableColor = conn?.cableColor || 'var(--border-glass)';

    const isFiber = (port.type as string) === 'FIBER' || port.type === 'SFP_FIBER' || port.type === 'GBIC_FIBER' || (port.type as string).includes('FIBER');
    const borderRadius = isFiber ? '50%' : '1.5px';

    const tooltip = `${port.name} (${isFiber ? t("wirelist.fiber") : port.type === "POWER" ? t("wirelist.power") : t("wirelist.copper")})
${t("rackface.statusPrefix")}${isConnected ? `${t("rackface.connectedVia")}${conn?.cableType} (${conn?.labelTag || t("rackface.noTag")})` : t("rackface.available")}
${isConnected ? `${t("rackface.route")}${conn?.sourcePort?.device?.name} (${conn?.sourcePort?.name}) ➔ ${conn?.destPort?.device?.name} (${conn?.destPort?.name})` : ''}`;

    const hasSpacing = isCopper && (totalGroupPorts > 12) && ((index + 1) % 6 === 0) && (index + 1 !== totalGroupPorts);

    return (
      <div
        key={port.id}
        id={isPrintCopy ? undefined : `port-${port.id}`}
        onClick={(e) => {
          if (isPrintCopy) return;
          e.stopPropagation();
          onPortClick?.(port, device);
        }}
        title={tooltip}
        style={{
          width: `${portSize}px`,
          height: `${portSize}px`,
          borderRadius,
          backgroundColor: isPendingSource 
            ? 'var(--accent-neon-green)' 
            : isSelected
              ? 'var(--accent-neon-blue)'
              : isConnected
                ? 'rgba(15, 23, 42, 0.75)' 
                : 'var(--port-unconnected-bg)',
          border: isPendingSource
            ? '1.5px solid #fff'
            : isSelected
              ? '1.5px solid #fff'
              : isConnected
                ? `1.5px solid ${cableColor}`
                : '1px solid var(--port-unconnected-border)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          position: 'relative',
          marginRight: hasSpacing ? '6px' : '0px',
          boxShadow: isPendingSource 
            ? 'var(--shadow-neon-green)' 
            : isSelected 
              ? 'var(--shadow-neon)' 
              : 'none',
        }}
      >
        {isConnected && !isPendingSource && !isSelected && (
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: cableColor,
            boxShadow: `0 0 3px ${cableColor}`,
          }} />
        )}
      </div>
    );
  };

  const renderUGrid = () => {
    const rows = [];
    const height = rackDetails.heightU;
    const devices = rackDetails.devices || [];

    const getDeviceAtU = (u: number) => {
      return devices.find((d) => d.positionU <= u && u < d.positionU + d.heightU);
    };

    for (let u = height; u >= 1; u--) {
      const device = getDeviceAtU(u);

      if (device) {
        const isTopU = u === device.positionU + device.heightU - 1;
        if (isTopU) {
          const dimmed = isDeviceDinned(device);
          const isFocused = activeDevice?.id === device.id;
          const totalRowHeight = device.heightU * ROW_HEIGHT;

          const isPatchPanel = device.brand.toLowerCase().includes('panduit') || device.model.toLowerCase().includes('patch');
          const isStorage = device.brand.toLowerCase().includes('hpe') || device.model.toLowerCase().includes('msa');

          const mgmtPorts = device.ports?.filter((p) => p.type === 'MGMT') || [];
          const copperPorts = device.ports?.filter((p) => p.type === 'COPPER') || [];
          const sfpPorts = device.ports?.filter((p) => (p.type as string) === 'FIBER' || p.type === 'SFP_FIBER' || p.type === 'GBIC_FIBER' || (p.type as string).includes('FIBER')) || [];
          const powerPorts = device.ports?.filter((p) => p.type === 'POWER') || [];

          rows.push(
            <tr key={u}>
              {/* COLUMN 1: Device info label (outside the cabinet) */}
              <td 
                rowSpan={device.heightU}
                style={{
                  width: '240px',
                  padding: '4px 16px 4px 0px',
                  verticalAlign: 'middle',
                  border: 'none',
                }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDevice(device);
                  }}
                  style={{
                    width: '220px',
                    backgroundColor: 'var(--bg-card)',
                    borderTop: isFocused ? '1.5px solid var(--accent-neon-blue)' : '1px solid var(--border-glass)',
                    borderRight: isFocused ? '1.5px solid var(--accent-neon-blue)' : '1px solid var(--border-glass)',
                    borderBottom: isFocused ? '1.5px solid var(--accent-neon-blue)' : '1px solid var(--border-glass)',
                    borderLeft: `5px solid ${getBrandBorderColor(device)}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    boxShadow: isFocused ? 'var(--shadow-neon)' : '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    textAlign: 'left',
                    position: 'relative',
                    cursor: 'pointer',
                    opacity: dimmed ? 0.4 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1 }}>
                    {device.brand}
                  </span>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                    {device.name}
                  </strong>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
                    {t("rackface.mod")}: {device.model}
                  </span>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'monospace', lineHeight: 1 }}>
                    {t("rackface.sn")}: {device.serialNumber}
                  </span>

                  {/* Action buttons - shown when device is focused */}
                  {isFocused && !isViewOnly && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDevice(device);
                        }}
                        title={t("rackface.edit")}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(56,189,248,0.1)',
                          border: '1px solid var(--accent-neon-blue)',
                          color: 'var(--accent-neon-blue)',
                          borderRadius: '4px',
                          padding: '3px 7px',
                          fontSize: '0.62rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          letterSpacing: '0.3px',
                          flex: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <Edit3 size={10} /> {t("rackface.edit")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneDevice(device);
                        }}
                        title={t("rackface.cloneTooltip")}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid var(--accent-neon-green)',
                          color: 'var(--accent-neon-green)',
                          borderRadius: '4px',
                          padding: '3px 7px',
                          fontSize: '0.62rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          letterSpacing: '0.3px',
                          flex: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <Copy size={10} /> {t("rackface.clone")}
                      </button>
                    </div>
                  )}

                  {/* Connector line to the rack */}
                  <div style={{
                    position: 'absolute',
                    right: '-16px',
                    top: '55%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '1.5px',
                    backgroundColor: isFocused ? 'var(--accent-neon-blue)' : 'var(--cabinet-border)',
                    opacity: 0.8,
                  }} />
                </div>
              </td>

              {/* COLUMN 2: U Index number (cabinet left rail) */}
              <td style={{
                width: '38px',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                backgroundColor: 'var(--cabinet-bg)',
                borderLeft: '5px solid var(--cabinet-border)',
                borderRight: '2px solid var(--cabinet-border)',
                height: `${ROW_HEIGHT}px`,
                verticalAlign: 'middle',
                borderTop: u === height ? '5px solid var(--cabinet-border)' : 'none',
                borderBottom: u === 1 ? '5px solid var(--cabinet-border)' : 'none',
              }}>
                {u}
              </td>

              {/* COLUMN 3: Device faceplate inside cabinet */}
              <td 
                rowSpan={device.heightU}
                style={{
                  padding: '3px 4px',
                  verticalAlign: 'middle',
                  backgroundColor: 'var(--cabinet-bg)',
                  borderRight: '5px solid var(--cabinet-border)',
                  borderTop: u === height ? '5px solid var(--cabinet-border)' : 'none',
                  borderBottom: u === 1 ? '5px solid var(--cabinet-border)' : 'none',
                  width: '802px',
                  maxWidth: '802px',
                }}
              >
                <div 
                  draggable={!isViewOnly}
                  onDragStart={(e) => handleDragStart(e, device)}
                  style={{
                    ...getDeviceStyle(device, isFocused),
                    height: `${totalRowHeight - CARD_GAP}px`,
                    opacity: dimmed ? 0.35 : 1,
                    filter: dimmed ? 'grayscale(70%)' : 'none',
                  }}
                >
                  {/* Grip handle */}
                  {!isViewOnly && (
                    <div style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'grab',
                      color: 'var(--text-muted)',
                      opacity: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 8,
                    }}>
                      <GripVertical size={16} />
                    </div>
                  )}

                  {/* Drive bays overlay lines for storage */}
                  {isStorage && (
                    <div style={{
                      position: 'absolute',
                      left: '58px',
                      top: '12px',
                      bottom: '12px',
                      display: 'flex',
                      gap: '4px',
                      opacity: 0.12,
                      zIndex: 1,
                    }}>
                      {[1,2,3,4,5,6,7,8].map((i) => (
                        <div key={i} style={{ width: '16px', height: '100%', border: '1px solid var(--text-primary)', borderRadius: '1.5px' }} />
                      ))}
                    </div>
                  )}

                  {/* Stretched Ports Container: width 100%, justifyContent space-between to occupy all freed space */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    width: '100%',
                    backgroundColor: 'var(--port-rack-bg)',
                    padding: '4px 16px 4px 54px', // Extra left padding to leave space for absolute delete button and grab handle
                    borderRadius: '4px',
                    border: '1.5px solid var(--port-rack-border)',
                    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.15)',
                    zIndex: 2,
                    height: '92%',
                    overflow: 'hidden',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease',
                  }}>
                    {isPatchPanel && (
                      <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#fff',
                        borderRadius: '1px',
                        marginBottom: '1px',
                        opacity: 0.8,
                        display: 'flex',
                        justifyContent: 'space-around',
                        fontSize: '3px',
                        color: '#0f172a',
                        fontWeight: 900,
                        alignItems: 'center',
                      }}>
                        <span>PANDUIT CAT6 DATA LINE MODULES</span>
                      </div>
                    )}

                    {/* Leftmost block: Out-of-band management (Mgmt, green) */}
                    {mgmtPorts.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateRows: 'repeat(2, 1fr)',
                          gridAutoFlow: 'column',
                          gap: '4px 5px',
                        }}>
                          {mgmtPorts.map((port, idx) => {
                            return renderPort(port, idx, 14, false, mgmtPorts.length, device);
                          })}
                        </div>
                        <div style={{ width: '2px', height: '28px', backgroundColor: 'var(--cabinet-border)', opacity: 0.5, borderRadius: '1px' }} />
                      </div>
                    )}

                    {/* Central block: RJ45 Copper ports (blue) in 2 rows */}
                    {copperPorts.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateRows: 'repeat(2, 1fr)',
                          gridAutoFlow: 'column',
                          gap: '4px 5px',
                        }}>
                          {copperPorts.map((port, idx) => {
                            let portSize = 13;
                            if (copperPorts.length <= 12) portSize = 18;
                            else if (copperPorts.length <= 24) portSize = 16;

                            return renderPort(port, idx, portSize, true, copperPorts.length, device);
                          })}
                        </div>
                      </div>
                    )}

                    {/* Right block: Fiber / SFP / GBIC ports (orange/purple) in 2 rows */}
                    {sfpPorts.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {copperPorts.length > 0 && (
                          <div style={{ width: '2px', height: '28px', backgroundColor: 'var(--cabinet-border)', opacity: 0.5, borderRadius: '1px' }} />
                        )}
                        <div style={{
                          display: 'grid',
                          gridTemplateRows: 'repeat(2, 1fr)',
                          gridAutoFlow: 'column',
                          gap: '4px 5px',
                        }}>
                          {sfpPorts.map((port, idx) => {
                            let portSize = 16;
                            return renderPort(port, idx, portSize, false, sfpPorts.length, device);
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rightmost block: Power Supply interfaces (yellow/red) */}
                    {powerPorts.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(copperPorts.length > 0 || sfpPorts.length > 0) && (
                          <div style={{ width: '2px', height: '28px', backgroundColor: 'var(--cabinet-border)', opacity: 0.5, borderRadius: '1px' }} />
                        )}
                        <div style={{
                          display: 'grid',
                          gridTemplateRows: 'repeat(2, 1fr)',
                          gridAutoFlow: 'column',
                          gap: '4px 5px',
                        }}>
                          {powerPorts.map((port, idx) => {
                            return renderPort(port, idx, 15, false, powerPorts.length, device);
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Absolutely positioned Delete Button on the far left */}
                  {isFocused && !isViewOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestDelete(device);
                      }}
                      style={{
                        position: 'absolute',
                        left: '28px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--accent-neon-red)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        } else {
          // Span spacer row for multi-U device
          rows.push(
            <tr key={u}>
              <td style={{
                width: '38px',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                backgroundColor: 'var(--cabinet-bg)',
                borderLeft: '5px solid var(--cabinet-border)',
                borderRight: '2px solid var(--cabinet-border)',
                height: `${ROW_HEIGHT}px`,
                verticalAlign: 'middle',
                borderBottom: u === 1 ? '5px solid var(--cabinet-border)' : 'none',
              }}>
                {u}
              </td>
            </tr>
          );
        }
      } else {
        // Render Empty Slot as Sleek Panel Cover at ROW_HEIGHT px
        const isHighlightedDropZone = draggedDevice && dragOverSlot !== null && 
          u >= dragOverSlot && u < dragOverSlot + draggedDevice.heightU;

        rows.push(
          <tr key={u}>
            {/* Column 1: Empty space */}
            <td style={{ width: '240px', border: 'none' }} />

            {/* Column 2: U rail */}
            <td style={{
              width: '38px',
              textAlign: 'center',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              backgroundColor: 'var(--cabinet-bg)',
              borderLeft: '5px solid var(--cabinet-border)',
              borderRight: '2px solid var(--cabinet-border)',
              height: `${ROW_HEIGHT}px`,
              verticalAlign: 'middle',
              transition: 'border-color 0.3s ease',
              borderTop: u === height ? '5px solid var(--cabinet-border)' : 'none',
              borderBottom: u === 1 ? '5px solid var(--cabinet-border)' : 'none',
            }}>
              {u}
            </td>
            
            {/* Column 3: Empty cover inside cabinet */}
            <td style={{
              padding: '1px 2px',
              backgroundColor: 'var(--cabinet-bg)',
              borderRight: '5px solid var(--cabinet-border)',
              borderTop: u === height ? '5px solid var(--cabinet-border)' : 'none',
              borderBottom: u === 1 ? '5px solid var(--cabinet-border)' : 'none',
              width: '802px',
              maxWidth: '802px',
            }}>
              <div 
                onClick={() => handleOpenAddDevice(u)}
                onDragOver={(e) => handleDragOver(e, u)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, u)}
                style={{
                  height: `${ROW_HEIGHT - 6}px`,
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isHighlightedDropZone ? 'var(--accent-neon-blue)' : 'var(--empty-slot-text)',
                  fontSize: '0.7rem',
                  cursor: isViewOnly ? 'default' : 'pointer',
                  backgroundColor: isHighlightedDropZone ? 'rgba(56, 189, 248, 0.15)' : 'var(--empty-slot-bg)', 
                  border: isHighlightedDropZone ? '2px dashed var(--accent-neon-blue)' : '1px solid var(--empty-slot-border)',
                  boxShadow: isHighlightedDropZone ? 'var(--shadow-neon)' : 'none',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (isHighlightedDropZone || isViewOnly) return;
                  e.currentTarget.style.color = 'var(--accent-neon-blue)';
                  e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.05)';
                  e.currentTarget.style.border = '1px dashed rgba(56, 189, 248, 0.3)';
                }}
                onMouseLeave={(e) => {
                  if (isHighlightedDropZone || isViewOnly) return;
                  e.currentTarget.style.color = 'var(--empty-slot-text)';
                  e.currentTarget.style.backgroundColor = 'var(--empty-slot-bg)';
                  e.currentTarget.style.border = '1px solid var(--empty-slot-border)';
                }}
              >
                {isViewOnly
                  ? `U${u}`
                  : isHighlightedDropZone
                    ? `🎯 ${t("rackface.dropToMove")}`
                    : `+ ${t("rackface.mountInU")}${u}`}
              </div>
            </td>
          </tr>
        );
      }
    }

    return rows;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
    }}>
      {/* Cabinet Visual Wrapper - Rendered via native table cells layout for perfect alignment */}
      <table
        id={isPrintCopy ? `rack-table-print-${rackDetails.id}` : `rack-table-${rackDetails.id}`}
        className={isPrintCopy ? "rack-table-print" : "rack-table-instance"}
        data-rack-id={rackDetails.id}
        style={{
          borderCollapse: 'collapse',
          width: '1080px',
          maxWidth: '1080px',
        }}
      >
        <thead>
          <tr>
            {/* Empty top-left cell */}
            <th style={{ width: '240px', border: 'none' }} />
            {/* Top Cabinet Header */}
            <th colSpan={2} style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: 950,
              backgroundColor: 'var(--cabinet-bg)',
              borderLeft: '5px solid var(--cabinet-border)',
              borderRight: '5px solid var(--cabinet-border)',
              borderTop: '10px solid var(--cabinet-header)',
              padding: '10px 0',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderRadius: '6px 6px 0 0',
            }}>
              {rackDetails.name} • Riel Central ({rackDetails.heightU}U)
            </th>
          </tr>
        </thead>
        <tbody>
          {renderUGrid()}
          {/* Bottom Cabinet Footer */}
          <tr>
            <td style={{ width: '240px', border: 'none' }} />
            <td colSpan={2} style={{
              height: '12px',
              backgroundColor: 'var(--cabinet-header)',
              borderLeft: '5px solid var(--cabinet-border)',
              borderRight: '5px solid var(--cabinet-border)',
              borderBottom: '5px solid var(--cabinet-border)',
              borderRadius: '0 0 6px 6px',
            }} />
          </tr>
        </tbody>
      </table>

      {/* Mount Device Modal */}
      {showAddDeviceModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          backdropFilter: 'blur(5px)',
        }}>
          <form onSubmit={handleAddDevice} className="glass-panel" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            maxHeight: '90vh',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Montar Equipo en Slot U{selectedSlot}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.devName")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="ej: Switch Core 02"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.brand")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="ej: Cisco, Dell, HP"
                  value={devBrand}
                  onChange={(e) => setDevBrand(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.model")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="ej: Catalyst 9350"
                  value={devModel}
                  onChange={(e) => setDevModel(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.sn")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Serial Number"
                  value={devSerial}
                  onChange={(e) => setDevSerial(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.sizeU")}</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={8}
                  className="input-field"
                  value={devHeight}
                  onChange={(e) => setDevHeight(parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.color")}</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    className="input-field"
                    style={{ padding: '2px 4px', height: '38px', width: '50px', cursor: 'pointer', flexShrink: 0 }}
                    value={devColor}
                    onChange={(e) => setDevColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontFamily: 'monospace' }}
                    placeholder="#38bdf8"
                    value={devColor}
                    onChange={(e) => setDevColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '12px',
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-neon-blue)' }}>
                {t("rackface.portConfig")}
              </span>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.copper")}</label>
                  <input
                    type="number"
                    min={0}
                    max={48}
                    className="input-field"
                    value={copperCount}
                    onChange={(e) => setCopperCount(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.sfp")}</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    className="input-field"
                    value={sfpCount}
                    onChange={(e) => setSfpCount(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.gbic")}</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    className="input-field"
                    value={gbicCount}
                    onChange={(e) => setGbicCount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.mgmt")}</label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    className="input-field"
                    value={mgmtCount}
                    onChange={(e) => setMgmtCount(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.power")}</label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    className="input-field"
                    value={powerCount}
                    onChange={(e) => setPowerCount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddDeviceModal(false)}>{t("rackface.cancel")}</button>
              <button type="submit" className="btn btn-primary">Montar Equipo</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit Device Modal */}
      {showEditDeviceModal && editTargetDevice && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          backdropFilter: 'blur(6px)',
        }}>
          <form onSubmit={handleSaveEditDevice} className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            maxHeight: '90vh',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent-neon-blue), var(--accent-neon-purple))',
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Edit3 size={16} color="#000" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t("rackface.editDevice")}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t("rackface.modifyChassis")}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditDeviceModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.devName")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={editDevName}
                  onChange={(e) => setEditDevName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.brand")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={editDevBrand}
                  onChange={(e) => setEditDevBrand(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.model")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={editDevModel}
                  onChange={(e) => setEditDevModel(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.sn")}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={editDevSerial}
                  onChange={(e) => setEditDevSerial(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("rackface.color")}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  className="input-field"
                  style={{ padding: '2px 4px', height: '38px', width: '50px', cursor: 'pointer', flexShrink: 0 }}
                  value={editDevColor}
                  onChange={(e) => setEditDevColor(e.target.value)}
                />
                <input
                  type="text"
                  className="input-field"
                  style={{ fontFamily: 'monospace' }}
                  placeholder="#38bdf8"
                  value={editDevColor}
                  onChange={(e) => setEditDevColor(e.target.value)}
                />
              </div>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '12px',
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-neon-blue)' }}>
                {t("rackface.portConfig")}
              </span>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.copper")}</label>
                  <input type="number" min={0} max={48} className="input-field" value={editCopperCount} onChange={(e) => setEditCopperCount(parseInt(e.target.value) || 0)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.sfp")}</label>
                  <input type="number" min={0} max={12} className="input-field" value={editSfpCount} onChange={(e) => setEditSfpCount(parseInt(e.target.value) || 0)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.gbic")}</label>
                  <input type="number" min={0} max={12} className="input-field" value={editGbicCount} onChange={(e) => setEditGbicCount(parseInt(e.target.value) || 0)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.mgmt")}</label>
                  <input type="number" min={0} max={4} className="input-field" value={editMgmtCount} onChange={(e) => setEditMgmtCount(parseInt(e.target.value) || 0)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.power")}</label>
                  <input type="number" min={0} max={4} className="input-field" value={editPowerCount} onChange={(e) => setEditPowerCount(parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditDeviceModal(false)}>{t("wirelist.cancel")}</button>
              <button type="submit" className="btn btn-primary">
                <Save size={14} /> {t("rackface.saveChanges")}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTargetDevice && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 130,
          backdropFilter: 'blur(6px)',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid var(--accent-neon-red)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Trash2 size={20} color="var(--accent-neon-red)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t("rackface.confirm")}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t("wirelist.cannotUndo")}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t("rackface.confirmDeleteQ")} <strong style={{ color: 'var(--text-primary)' }}>{deleteTargetDevice.name}</strong> {t("rackface.confirmDeleteSub")}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setShowDeleteConfirm(false); setDeleteTargetDevice(null); }}
              >{t("wirelist.cancel")}</button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--accent-neon-red)', color: 'var(--accent-neon-red)' }}
              >
                <Trash2 size={14} /> {t("rackface.confirm")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

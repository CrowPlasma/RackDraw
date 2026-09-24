import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useRackStore, Device, Port, Connection } from '../../store/useRackStore';
import { Trash2, Save, X, Link2, AlertTriangle, Edit3, Plus } from 'lucide-react';

interface WireListPanelProps {
  selectedConnection: Connection | null;
  selectedPort: Port | null;
  selectedPortDevice: Device | null;
  onClearSelection: () => void;
  onStartCabling: (port: Port, device: Device) => void;
}

export default function WireListPanel({
  selectedConnection,
  selectedPort,
  selectedPortDevice,
  onClearSelection,
  onStartCabling,
}: WireListPanelProps) {
  const { t } = useTranslation();
  const {
    activeDevice,
    wirelist,
    deleteConnection,
    updateConnection,
    setActiveDevice,
    rackDetails,
    updateDevice,
    addPort,
    deletePort,
  } = useRackStore();

  const [editSourceDeviceId, setEditSourceDeviceId] = useState('');
  const [editSourcePortId, setEditSourcePortId] = useState('');
  const [editDestDeviceId, setEditDestDeviceId] = useState('');
  const [editDestPortId, setEditDestPortId] = useState('');
  
  const [cableType, setCableType] = useState('CAT6');
  const [cableColor, setCableColor] = useState('#38bdf8');
  const [lengthMeters, setLengthMeters] = useState(2.0);
  const [labelTag, setLabelTag] = useState('');

  // Device Edit States
  const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
  const [devName, setDevName] = useState('');
  const [devBrand, setDevBrand] = useState('');
  const [devModel, setDevModel] = useState('');
  const [devSerial, setDevSerial] = useState('');
  const [devPos, setDevPos] = useState(1);
  const [devHeight, setDevHeight] = useState(1);
  const [devColor, setDevColor] = useState('#38bdf8');

  // New Port States
  const [newPortName, setNewPortName] = useState('');
  const [newPortType, setNewPortType] = useState('COPPER');
  const [newPortSpeed, setNewPortSpeed] = useState('1Gbps');

  // Wire list search/filter
  const [connectionSearch, setConnectionSearch] = useState('');

  // Inline connection edit modal
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [editCableColor, setEditCableColor] = useState('#38bdf8');
  const [editLabelTag, setEditLabelTag] = useState('');
  const [editLengthMeters, setEditLengthMeters] = useState(2.0);

  // Delete cable confirmation modal
  const [deleteCableTarget, setDeleteCableTarget] = useState<Connection | null>(null);
  // Delete port confirmation modal
  const [deletePortTarget, setDeletePortTarget] = useState<{ portId: string; portName: string } | null>(null);

  const handleRequestDeleteCable = (conn: Connection) => {
    setDeleteCableTarget(conn);
  };

  const handleConfirmDeleteCable = async () => {
    if (!deleteCableTarget) return;
    await deleteConnection(deleteCableTarget.id);
    setDeleteCableTarget(null);
  };

  const handleOpenEditConnection = (conn: Connection) => {
    setEditingConnectionId(conn.id);
    setEditCableColor(conn.cableColor);
    setEditLabelTag(conn.labelTag || '');
    setEditLengthMeters(conn.lengthMeters);
  };

  const handleSaveEditConnection = async (conn: Connection) => {
    try {
      await updateConnection(conn.id, {
        cableColor: editCableColor,
        labelTag: editLabelTag,
        lengthMeters: parseFloat(editLengthMeters.toString()),
      });
      setEditingConnectionId(null);
    } catch (_err) {
      // Errors handled by store toasts
    }
  };

  const handleOpenEdit = () => {
    if (!activeDevice) return;
    setDevName(activeDevice.name);
    setDevBrand(activeDevice.brand);
    setDevModel(activeDevice.model);
    setDevSerial(activeDevice.serialNumber);
    setDevPos(activeDevice.positionU);
    setDevHeight(activeDevice.heightU);
    setDevColor((activeDevice.metadata as any)?.color || '#38bdf8');
    setShowEditDeviceModal(true);
  };

  const handleSaveDeviceDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDevice) return;
    try {
      await updateDevice(activeDevice.id, {
        name: devName,
        brand: devBrand,
        model: devModel,
        serialNumber: devSerial,
        positionU: parseInt(devPos.toString()),
        heightU: parseInt(devHeight.toString()),
        metadata: {
          ...(activeDevice.metadata as any || {}),
          color: devColor,
        },
      });
      setShowEditDeviceModal(false);
    } catch (err) {
      // Ignored
    }
  };

  const handleAddPort = async () => {
    if (!activeDevice || !newPortName.trim()) return;
    try {
      await addPort(activeDevice.id, {
        name: newPortName,
        type: newPortType,
        speed: newPortSpeed,
        direction: 'BIDIRECTIONAL',
      });
      setNewPortName('');
    } catch (err) {
      // Ignored
    }
  };

  const handleDeletePort = async (portId: string, portName: string) => {
    setDeletePortTarget({ portId, portName });
  };

  const handleConfirmDeletePort = async () => {
    if (!deletePortTarget) return;
    try {
      await deletePort(deletePortTarget.portId);
    } catch (err) { /* Ignored */ }
    setDeletePortTarget(null);
  };

  // Map occupied port IDs
  const occupiedPortIds = new Set<string>();
  (wirelist || []).forEach((c) => {
    if (selectedConnection && c.id === selectedConnection.id) return;
    occupiedPortIds.add(c.sourcePortId);
    occupiedPortIds.add(c.destPortId);
  });

  // Populate editor form when selection changes
  useEffect(() => {
    if (selectedConnection) {
      const srcPort = selectedConnection.sourcePort;
      const destPort = selectedConnection.destPort;

      if (srcPort && destPort) {
        setEditSourceDeviceId(srcPort.deviceId);
        setEditSourcePortId(selectedConnection.sourcePortId);
        setEditDestDeviceId(destPort.deviceId);
        setEditDestPortId(selectedConnection.destPortId);
      }
      
      setCableType(selectedConnection.cableType);
      setCableColor(selectedConnection.cableColor);
      setLengthMeters(selectedConnection.lengthMeters);
      setLabelTag(selectedConnection.labelTag || '');
    }
  }, [selectedConnection]);

  if (!rackDetails) return null;

  const activeDeviceConnections = activeDevice
    ? (wirelist || []).filter(
        (c) =>
          c.sourcePort?.deviceId === activeDevice.id ||
          c.destPort?.deviceId === activeDevice.id ||
          activeDevice.ports.some(p => p.id === c.sourcePortId || p.id === c.destPortId)
      )
    : [];

  const getCableTypeName = (type: string) => {
    switch (type) {
      case 'COPPER':
      case 'CAT5E':
      case 'CAT6':
      case 'DAC':
        return t("wirelist.copper");
      case 'FIBER':
      case 'SM_FIBER':
      case 'MM_FIBER':
      case 'GBIC_FIBER':
      case 'SFP_FIBER':
        return 'Fibra';
      case 'POWER':
        return t('wirelist.power');
      default:
        return type;
    }
  };

  const deviceOptions = rackDetails.devices || [];
  const chosenDestDevice = rackDetails.devices?.find((d) => d.id === editDestDeviceId);
  const chosenSourceDevice = rackDetails.devices?.find((d) => d.id === editSourceDeviceId);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection) return;
    try {
      await updateConnection(selectedConnection.id, {
        sourcePortId: editSourcePortId,
        destPortId: editDestPortId,
        cableType,
        cableColor,
        lengthMeters: parseFloat(lengthMeters.toString()),
        labelTag,
      });
      onClearSelection();
    } catch (err) {
      // Ignored
    }
  };

  return (
    <aside style={{
      width: '380px',
      borderLeft: '1px solid var(--border-glass)',
      backgroundColor: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '20px',
      overflowY: 'auto',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      {/* 1. Connection Editor (Active selected cable) */}
      {selectedConnection ? (
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-neon-blue)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ⚙️ {t("wirelist.editConnection")}
            </h3>
            <button 
              onClick={onClearSelection}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleUpdateSubmit} className="glass-panel" style={{
            padding: '16px',
            backgroundColor: 'rgba(56, 189, 248, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {/* Source Device Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t("connection.sourceDev")}
              </label>
              <select
                className="input-field"
                value={editSourceDeviceId}
                onChange={(e) => {
                  const devId = e.target.value;
                  setEditSourceDeviceId(devId);
                  const nextDev = rackDetails.devices?.find((d) => d.id === devId);
                  const firstAvail = (nextDev?.ports || []).find((p) => !occupiedPortIds.has(p.id) || p.id === selectedConnection.sourcePortId);
                  setEditSourcePortId(firstAvail ? firstAvail.id : '');
                }}
                style={{ cursor: 'pointer' }}
              >
                {(deviceOptions || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.model})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Port Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t("connection.sourcePort")}
              </label>
              <select
                className="input-field"
                value={editSourcePortId}
                onChange={(e) => setEditSourcePortId(e.target.value)}
                disabled={!editSourceDeviceId}
                style={{ cursor: 'pointer' }}
              >
                {(chosenSourceDevice?.ports || []).map((p) => {
                  const isAvailable = !occupiedPortIds.has(p.id) || p.id === selectedConnection.sourcePortId;
                  return (
                    <option key={p.id} value={p.id} disabled={!isAvailable}>
                      {p.name} {p.id === selectedConnection.sourcePortId ? '(Actual)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Dest Device Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t("connection.targetDev")}
              </label>
              <select
                className="input-field"
                value={editDestDeviceId}
                onChange={(e) => {
                  const devId = e.target.value;
                  setEditDestDeviceId(devId);
                  const nextDev = rackDetails.devices?.find((d) => d.id === devId);
                  const firstAvail = (nextDev?.ports || []).find((p) => !occupiedPortIds.has(p.id));
                  setEditDestPortId(firstAvail ? firstAvail.id : '');
                }}
                style={{ cursor: 'pointer' }}
              >
                {(deviceOptions || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.model})
                  </option>
                ))}
              </select>
            </div>

            {/* Dest Port Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t("connection.targetPort")}
              </label>
              <select
                className="input-field"
                value={editDestPortId}
                onChange={(e) => setEditDestPortId(e.target.value)}
                disabled={!editDestDeviceId}
                style={{ cursor: 'pointer' }}
              >
                {(chosenDestDevice?.ports || []).map((p) => {
                  const isAvailable = !occupiedPortIds.has(p.id) || p.id === selectedConnection.destPortId;
                  return (
                    <option key={p.id} value={p.id} disabled={!isAvailable}>
                      {p.name} {p.id === selectedConnection.destPortId ? '(Actual)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cable properties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t("connection.cableType")}</label>
                <select
                  className="input-field"
                  value={cableType}
                  onChange={(e) => setCableType(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <option value="CAT6">{t("wirelist.copper")}</option>
                  <option value="SM_FIBER">Fibra</option>
                  <option value="POWER">{t("wirelist.power")}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t("wirelist.lengthM")}</label>
                <input
                  type="number"
                  required
                  min={0.1}
                  step={0.1}
                  className="input-field"
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(parseFloat(e.target.value))}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t("wirelist.color")}</label>
                <input
                  type="color"
                  className="input-field"
                  value={cableColor}
                  onChange={(e) => setCableColor(e.target.value)}
                  style={{ padding: '0px', height: '32px', width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t("connection.cableLabel")}</label>
                <input
                  type="text"
                  className="input-field"
                  value={labelTag}
                  onChange={(e) => setLabelTag(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '8px', fontSize: '0.8rem', gap: '4px' }}
                onClick={() => handleRequestDeleteCable(selectedConnection)}
              >
                <Trash2 size={13} /> Retirar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '8px', fontSize: '0.8rem', gap: '4px' }}
              >
                <Save size={13} /> {t("wirelist.save")}
              </button>
            </div>
          </form>
        </div>
      ) : selectedPort && selectedPortDevice ? (
        /* 2. Unconnected Selected Port Inspector */
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ⚙️ {t("wirelist.selectedPort")}
            </h3>
            <button 
              onClick={onClearSelection}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          </div>

          <div className="glass-panel" style={{
            padding: '16px',
            backgroundColor: 'rgba(234, 179, 8, 0.03)',
            borderLeft: '4px solid var(--accent-neon-yellow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon-blue)', fontWeight: 700 }}>
                {selectedPortDevice.name}
              </span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '2px 0 4px 0' }}>
                {t("wirelist.port")}: {selectedPort.name}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t("wirelist.type")}: {selectedPort.type} • {t("wirelist.speed")}: {selectedPort.speed}
              </p>
            </div>

            {/* Warning Card */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '4px',
              padding: '10px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <AlertTriangle size={15} color="var(--accent-neon-red)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.78rem', color: 'var(--accent-neon-red)', display: 'block' }}>
                  {t("wirelist.unassignedInterface")}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {t("wirelist.unassignedDesc")}
                </span>
              </div>
            </div>

            <button
              onClick={() => onStartCabling(selectedPort, selectedPortDevice)}
              className="btn btn-primary"
              style={{ width: '100%', gap: '6px', fontSize: '0.8rem', padding: '8px' }}
            >
              <Link2 size={14} /> {t("wirelist.startCabling")}
            </button>
          </div>
        </div>
      ) : (
        /* 3. General Device Inspector */
        <div style={{ flex: '0 0 auto' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            {t("wirelist.inspector")}
          </h3>
          
          {activeDevice ? (
            <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon-blue)', fontWeight: 700 }}>
                    {activeDevice.brand}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{activeDevice.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeDevice.model}</p>
                </div>
                <button 
                  onClick={() => setActiveDevice(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  {t("wirelist.close")}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>S/N:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{activeDevice.serialNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t("rackface.locationU")}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Slot {activeDevice.positionU} ({activeDevice.heightU}U)</span>
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '8px', gap: '6px', fontSize: '0.8rem', padding: '8px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Edit3 size={14} /> {t("rackface.editEquipPorts")}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t("wirelist.clickToEdit")}
            </div>
          )}
        </div>
      )}

      {/* 4. Wirelist connections list */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
          {selectedConnection 
            ? t('wirelist.linkDetail') 
            : activeDevice 
              ? `${t('wirelist.cablesOf')} ${activeDevice.name}` 
              : t('wirelist.fullList')}
        </h3>

        {/* Search / filter input */}
        {!selectedConnection && (
          <input
            type="text"
            className="input-field"
            placeholder={`🔍 ${t("wirelist.search")}`}
            value={connectionSearch}
            onChange={(e) => setConnectionSearch(e.target.value)}
            style={{ marginBottom: '10px', padding: '6px 10px', fontSize: '0.78rem' }}
          />
        )}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(() => {
            const baseList = selectedConnection 
              ? [selectedConnection] 
              : activeDevice 
                ? activeDeviceConnections 
                : (wirelist || []);

            const searchTerm = connectionSearch.toLowerCase().trim();
            const filteredList = !selectedConnection && searchTerm
              ? baseList.filter((conn) => {
                  const srcDev = conn.sourcePort?.device?.name?.toLowerCase() || '';
                  const destDev = conn.destPort?.device?.name?.toLowerCase() || '';
                  const srcPort = conn.sourcePort?.name?.toLowerCase() || '';
                  const destPort = conn.destPort?.name?.toLowerCase() || '';
                  const label = (conn.labelTag || '').toLowerCase();
                  return (
                    srcDev.includes(searchTerm) ||
                    destDev.includes(searchTerm) ||
                    srcPort.includes(searchTerm) ||
                    destPort.includes(searchTerm) ||
                    label.includes(searchTerm)
                  );
                })
              : baseList;

            if (filteredList.length === 0) {
              return (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-sm)' }}>
                  {searchTerm ? '{t("wirelist.noResults")}' : '{t("wirelist.noCables")}'}
                </div>
              );
            }

            return filteredList.map((conn) => {
              const srcDevName = conn.sourcePort?.device?.name || 'Puerto Origen';
              const destDevName = conn.destPort?.device?.name || 'Puerto Destino';
              const srcPortName = conn.sourcePort?.name || 'Source';
              const destPortName = conn.destPort?.name || 'Dest';
              const isEditing = editingConnectionId === conn.id;

              return (
                <div 
                  key={conn.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: selectedConnection?.id === conn.id 
                      ? '1px solid var(--accent-neon-blue)' 
                      : '1px solid var(--border-glass)',
                    borderLeft: `4px solid ${conn.cableColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.8rem',
                    boxShadow: selectedConnection?.id === conn.id ? 'var(--shadow-neon)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: conn.cableColor, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      {getCableTypeName(conn.cableType)} • {conn.lengthMeters}m
                    </span>
                    {!selectedConnection && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {/* Edit button */}
                        <button
                          onClick={() => isEditing ? setEditingConnectionId(null) : handleOpenEditConnection(conn)}
                          title={isEditing ? '{t("wirelist.cancelEdit")}' : '{t("wirelist.editCable")}'}
                          style={{
                            background: isEditing ? 'rgba(56,189,248,0.12)' : 'none',
                            border: isEditing ? '1px solid var(--accent-neon-blue)' : 'none',
                            color: isEditing ? 'var(--accent-neon-blue)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            padding: '3px',
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => handleRequestDeleteCable(conn)}
                          title="Eliminar cable"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div style={{
                      backgroundColor: 'rgba(56,189,248,0.04)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      borderRadius: '4px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '8px', alignItems: 'end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{t("wirelist.color")}</label>
                          <input
                            type="color"
                            className="input-field"
                            value={editCableColor}
                            onChange={(e) => setEditCableColor(e.target.value)}
                            style={{ padding: '0px', height: '30px', width: '100%', cursor: 'pointer' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{t("wirelist.tag")}</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Etiqueta del cable"
                            value={editLabelTag}
                            onChange={(e) => setEditLabelTag(e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{t("wirelist.lengthM")}</label>
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          className="input-field"
                          value={editLengthMeters}
                          onChange={(e) => setEditLengthMeters(parseFloat(e.target.value))}
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setEditingConnectionId(null)}
                        >{t("wirelist.cancel")}</button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                          onClick={() => handleSaveEditConnection(conn)}
                        >
                          <Save size={12} /> {t("wirelist.save")}
                        </button>
                      </div>
                    </div>
                  )}

                  {conn.labelTag && !isEditing && (
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'var(--bg-deep)', padding: '2px 6px', borderRadius: '3px', alignSelf: 'flex-start' }}>
                      🏷️ {conn.labelTag}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-glass)', paddingTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t("wirelist.from")}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{srcDevName} ({srcPortName})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t("wirelist.to")}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{destDevName} ({destPortName})</span>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
      {/* Edit Device and Ports Modal */}
      {showEditDeviceModal && activeDevice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
          backdropFilter: 'blur(6px)',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '850px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent-neon-blue), var(--accent-neon-purple))',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Edit3 size={20} color="#000" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Editar Equipo: {activeDevice.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.hardwareConfig")}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowEditDeviceModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', overflow: 'hidden' }}>
              
              {/* Left Column: General Info Form */}
              <form onSubmit={handleSaveDeviceDetails} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-neon-blue)', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                  Detalles del Chasis
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marca / Fabricante</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field" 
                      value={devBrand} 
                      onChange={(e) => setDevBrand(e.target.value)} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre de Red</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field" 
                      value={devName} 
                      onChange={(e) => setDevName(e.target.value)} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Modelo</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field" 
                      value={devModel} 
                      onChange={(e) => setDevModel(e.target.value)} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.sn")}</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field" 
                      value={devSerial} 
                      onChange={(e) => setDevSerial(e.target.value)} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("rackface.slotPos")}</label>
                    <input 
                      type="number" 
                      required 
                      min={1}
                      max={rackDetails.heightU}
                      className="input-field" 
                      value={devPos} 
                      onChange={(e) => setDevPos(parseInt(e.target.value))} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Altura (U)</label>
                    <input 
                      type="number" 
                      required 
                      min={1}
                      max={12}
                      className="input-field" 
                      value={devHeight} 
                      onChange={(e) => setDevHeight(parseInt(e.target.value))} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Color de Tarjeta (Lateral)</label>
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

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Save size={15} /> {t("rackface.save")}
                  </button>
                </div>
              </form>

              {/* Right Column: Interfaces / Ports Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '1px solid var(--border-glass)', paddingLeft: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-neon-blue)', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                  {t("wirelist.networkInterfaces")} ({activeDevice.ports.length})
                </h4>

                {/* Ports List */}
                <div style={{
                  flex: 1,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {activeDevice.ports.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {t("wirelist.noPorts")}
                    </div>
                  ) : (
                    activeDevice.ports.map((port) => (
                      <div 
                        key={port.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border-glass)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{port.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {port.type} ({port.speed})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePort(port.id, port.name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-neon-red)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Port Form Row */}
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Agregar Nueva Interfaz:
                  </span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Nombre (ej. Gi1/0/2)" 
                      value={newPortName}
                      onChange={(e) => setNewPortName(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    />
                    
                    <select
                      className="input-field"
                      value={newPortType}
                      onChange={(e) => setNewPortType(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      <option value="COPPER">Copper RJ45</option>
                      <option value="SFP_FIBER">Fiber SFP</option>
                      <option value="GBIC_FIBER">Fiber GBIC</option>
                      <option value="MGMT">OOB Management</option>
                      <option value="POWER">Power Supply</option>
                    </select>

                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="1Gbps" 
                      value={newPortSpeed}
                      onChange={(e) => setNewPortSpeed(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPort}
                    className="btn btn-secondary"
                    style={{ gap: '6px', fontSize: '0.78rem', padding: '6px 12px', alignSelf: 'flex-end', border: '1px solid var(--border-glass)' }}
                  >
                    <Plus size={13} /> Agregar Puerto
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Delete Cable Confirmation Modal ── */}
      {deleteCableTarget && (() => {
        const conn = deleteCableTarget;
        const srcDev = conn.sourcePort?.device?.name || 'Origen';
        const srcPort = conn.sourcePort?.name || '';
        const destDev = conn.destPort?.device?.name || 'Destino';
        const destPort = conn.destPort?.name || '';

        return (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
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
              {/* Header */}
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t("wirelist.removeCable")}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t("wirelist.cannotUndo")}</span>
                </div>
              </div>

              {/* Cable info */}
              <div style={{
                background: 'var(--bg-deep)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid var(--border-glass)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: conn.cableColor, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: conn.cableColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {conn.cableType.replace('_', ' ')} {conn.lengthMeters}m
                  </span>
                  {conn.labelTag && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: '3px' }}>
                      🏷️ {conn.labelTag}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{srcDev}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>:{srcPort}</span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{destDev}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>:{destPort}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {t("wirelist.disconnectPrompt")}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteCableTarget(null)}
                >{t("wirelist.cancel")}</button>
                <button
                  className="btn"
                  onClick={handleConfirmDeleteCable}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid var(--accent-neon-red)',
                    color: 'var(--accent-neon-red)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={14} /> Retirar Cable
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Port Confirmation Modal ── */}
      {deletePortTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          backdropFilter: 'blur(6px)',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid var(--accent-neon-red)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={20} color="var(--accent-neon-red)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t("wirelist.deletePort")}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t("wirelist.cannotUndo")}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {t("wirelist.deletePortMsg")}{' '}
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {deletePortTarget.portName}
              </strong>?{' '}
              {t("rackface.confirmDeleteSub")}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeletePortTarget(null)}>{t("wirelist.cancel")}</button>
              <button
                className="btn"
                onClick={handleConfirmDeletePort}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid var(--accent-neon-red)',
                  color: 'var(--accent-neon-red)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Trash2 size={14} /> Eliminar Puerto
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}

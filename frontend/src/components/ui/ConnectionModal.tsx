import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useRackStore, Port, Device } from '../../store/useRackStore';
import { Cable, Link2 } from 'lucide-react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePort: Port;
  sourceDevice: Device;
  destPort: Port;
  destDevice: Device;
}

const CABLE_PRESETS = [
  { label: 'Cobre (Azul)', type: 'CAT6', color: '#38bdf8' },
  { label: 'Fibra (Naranja)', type: 'SM_FIBER', color: '#f97316' },
  { label: 'Fibra (Morado)', type: 'SM_FIBER', color: '#a855f7' },
  { label: 'Línea de Energía (Amarillo)', type: 'POWER', color: '#eab308' },
];

export default function ConnectionModal({
  isOpen,
  onClose,
  sourcePort,
  sourceDevice,
  destPort,
  destDevice
}: ConnectionModalProps) {
  const { t } = useTranslation();
  const { createConnection } = useRackStore();

  const [cableType, setCableType] = useState('CAT6');
  const [cableColor, setCableColor] = useState('#38bdf8');
  const [lengthMeters, setLengthMeters] = useState(2.0);
  const [labelTag, setLabelTag] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof CABLE_PRESETS[0]) => {
    setCableType(preset.type);
    setCableColor(preset.color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalLabel = labelTag.trim() || 
        `${sourceDevice.name.replace(/\s+/g, '')}-${sourcePort.name.replace(/\s+/g, '')}__${destDevice.name.replace(/\s+/g, '')}-${destPort.name.replace(/\s+/g, '')}`;

      await createConnection({
        sourcePortId: sourcePort.id,
        destPortId: destPort.id,
        cableType,
        cableColor,
        lengthMeters: parseFloat(lengthMeters.toString()),
        labelTag: finalLabel,
      });

      onClose();
    } catch (err: any) {
      // Ignored: Zustand store will display in-app toast automatically on error
    }
  };

  return (
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
      <form onSubmit={handleSubmit} className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-neon-blue), var(--accent-neon-green))',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Link2 size={20} color="#000" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mapear Nueva Conexión</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Packet Tracer Interface Mapper</span>
          </div>
        </div>

        {/* Visual Map */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 30px 1fr',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-glass)',
          fontSize: '0.8rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon-blue)', display: 'block' }}>{sourceDevice.brand}</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{sourceDevice.name}</strong>
            <span style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
              🔌 {sourcePort.name}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
            ➔
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon-blue)', display: 'block' }}>{destDevice.brand}</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{destDevice.name}</strong>
            <span style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
              🔌 {destPort.name}
            </span>
          </div>
        </div>

        {/* Presets Row */}
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Ajustar Cable por Tipo:
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}>
            {CABLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = p.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.color }}></span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tipo de Cable</label>
            <select
              className="input-field"
              value={cableType}
              onChange={(e) => setCableType(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="CAT6">Cobre</option>
              <option value="SM_FIBER">Fibra</option>
              <option value="POWER">Línea de Energía</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color del Cable</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="color"
                className="input-field"
                value={cableColor}
                onChange={(e) => setCableColor(e.target.value)}
                style={{ width: '40px', padding: '0px', cursor: 'pointer', height: '38px' }}
              />
              <input
                type="text"
                className="input-field"
                value={cableColor.toUpperCase()}
                onChange={(e) => setCableColor(e.target.value)}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Longitud (m)</label>
            <input
              type="number"
              required
              min={0.1}
              step={0.1}
              className="input-field"
              value={lengthMeters}
              onChange={(e) => setValue(parseFloat(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Etiqueta física (Opcional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="SW01-Gi1/0/1__SRV01-LOM1"
              value={labelTag}
              onChange={(e) => setLabelTag(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>{t('connectionModal.cancel')}</button>
          <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
            <Cable size={15} /> Confirmar Conexión
          </button>
        </div>
      </form>
    </div>
  );

  // Helper set value
  function setValue(val: number) {
    setLengthMeters(val);
  }
}

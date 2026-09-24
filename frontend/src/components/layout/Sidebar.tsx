import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useRackStore } from '../../store/useRackStore';
import { Plus, Server, ChevronDown, Edit3, Trash2 } from 'lucide-react';

export default function Sidebar() {
  const { t } = useTranslation();
  const {
    projects,
    activeProject,
    racks,
    activeRack,
    fetchProjects,
    selectProject,
    selectRack,
    createProject,
    updateProject,
    deleteProject,
    createRack,
    updateRack,
    deleteRack,
  } = useRackStore();

  const [showProjModal, setShowProjModal] = useState(false);
  const [showRackModal, setShowRackModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newRackName, setNewRackName] = useState('');
  const [newRackHeight, setNewRackHeight] = useState(42);

  // Edit states
  const [showEditProjModal, setShowEditProjModal] = useState(false);
  const [editProjName, setEditProjName] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');
  const [showEditRackModal, setShowEditRackModal] = useState(false);
  const [editRackId, setEditRackId] = useState('');
  const [editRackName, setEditRackName] = useState('');
  const [editRackHeight, setEditRackHeight] = useState(42);

  // Delete confirm states
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteRackTarget, setDeleteRackTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await createProject(newProjName, newProjDesc);
      setNewProjName('');
      setNewProjDesc('');
      setShowProjModal(false);
    } catch (err) {
      // Ignored: Zustand store will display in-app toast automatically on error
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjName.trim() || !activeProject) return;
    try {
      await updateProject(activeProject.id, editProjName, editProjDesc);
      setShowEditProjModal(false);
    } catch (err) {
      // Ignored
    }
  };

  const handleCreateRack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRackName.trim()) return;
    try {
      await createRack(newRackName, newRackHeight);
      setNewRackName('');
      setNewRackHeight(42);
      setShowRackModal(false);
    } catch (err) {
      // Ignored: Zustand store will display in-app toast automatically on error
    }
  };

  const handleEditRack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRackName.trim() || !editRackId) return;
    try {
      await updateRack(editRackId, editRackName, editRackHeight);
      setShowEditRackModal(false);
    } catch (err) {
      // Ignored
    }
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      borderRight: '1px solid var(--border-glass)',
      backgroundColor: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '24px',
      overflowY: 'auto',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Project Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t("sidebar.activeProject")}
          </span>
          <button 
            onClick={() => setShowProjModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-neon-blue)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {projects.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
            Sin proyectos creados
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={activeProject?.id || ''}
                onChange={(e) => selectProject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '13px', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
            </div>

            {activeProject && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setEditProjName(activeProject.name);
                    setEditProjDesc(activeProject.description || '');
                    setShowEditProjModal(true);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', gap: '4px', border: '1px solid var(--border-glass)' }}
                >
                  <Edit3 size={13} /> {t("sidebar.editProject")}
                </button>
                <button
                  onClick={() => {
                    setDeleteProjectTarget({ id: activeProject.id, name: activeProject.name });
                  }}
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                >
                  <Trash2 size={13} /> {t("sidebar.deleteProject")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rack Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t("sidebar.racks")}
          </span>
          {activeProject && (
            <button 
              onClick={() => setShowRackModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-neon-blue)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        {!activeProject ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
            {t("sidebar.noRacks")}
          </div>
        ) : racks.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
            {t("sidebar.noRacks")}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {racks.map((r) => {
              const isActive = activeRack?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => selectRack(r.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--border-glass)',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Server size={16} color={isActive ? 'var(--accent-neon-blue)' : 'var(--text-secondary)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{r.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isActive && (
                          <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditRackId(r.id);
                                setEditRackName(r.name);
                                setEditRackHeight(r.heightU);
                                setShowEditRackModal(true);
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                              title={t("sidebar.editRackTooltip")}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteRackTarget({ id: r.id, name: r.name });
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--accent-neon-red)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                              title={t("sidebar.deleteRackTooltip")}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>
                          {r.heightU}U
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal Dialog */}
      {showProjModal && (
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
          zIndex: 100,
          backdropFilter: 'blur(4px)',
        }}>
          <form onSubmit={handleCreateProject} className="glass-panel" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t("sidebar.newProject")}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("sidebar.projectName")}</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="ej: Data Center Madrid"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("sidebar.projectDesc")}</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="ej: Infraestructura de servidores principales..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowProjModal(false)}>{t("sidebar.cancel")}</button>
              <button type="submit" className="btn btn-primary">{t("sidebar.create")}</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Rack Modal Dialog */}
      {showRackModal && (
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
          zIndex: 100,
          backdropFilter: 'blur(4px)',
        }}>
          <form onSubmit={handleCreateRack} className="glass-panel" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t("sidebar.createRack")}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("sidebar.rackName")}</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="ej: Rack Principal A-02"
                value={newRackName}
                onChange={(e) => setNewRackName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("sidebar.heightU")}</label>
              <input
                type="number"
                required
                min={1}
                max={60}
                className="input-field"
                value={newRackHeight}
                onChange={(e) => setNewRackHeight(parseInt(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowRackModal(false)}>{t("sidebar.cancel")}</button>
              <button type="submit" className="btn btn-primary">{t("sidebar.createRack")}</button>
            </div>
          </form>
        </div>
      )}
      {/* Edit Project Modal Dialog */}
      {showEditProjModal && activeProject && (
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
          zIndex: 100,
          backdropFilter: 'blur(4px)',
        }}>
          <form onSubmit={handleEditProject} className="glass-panel" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t("sidebar.editProject")}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("sidebar.projectName")}</label>
              <input
                type="text"
                required
                className="input-field"
                value={editProjName}
                onChange={(e) => setEditProjName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("sidebar.projectDesc")}</label>
              <textarea
                className="input-field"
                rows={3}
                value={editProjDesc}
                onChange={(e) => setEditProjDesc(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditProjModal(false)}>{t("sidebar.cancel")}</button>
              <button type="submit" className="btn btn-primary">{t("sidebar.saveChanges")}</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Rack Modal Dialog */}
      {showEditRackModal && (
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
          zIndex: 100,
          backdropFilter: 'blur(4px)',
        }}>
          <form onSubmit={handleEditRack} className="glass-panel" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editar Rack / Gabinete</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nombre del Rack</label>
              <input
                type="text"
                required
                className="input-field"
                value={editRackName}
                onChange={(e) => setEditRackName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("sidebar.heightU")}</label>
              <input
                type="number"
                required
                min={1}
                max={60}
                className="input-field"
                value={editRackHeight}
                onChange={(e) => setEditRackHeight(parseInt(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditRackModal(false)}>{t("sidebar.cancel")}</button>
              <button type="submit" className="btn btn-primary">{t("sidebar.saveChanges")}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Project Confirmation Modal */}
      {deleteProjectTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, backdropFilter: 'blur(6px)',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--accent-neon-red)', padding: '8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} color="var(--accent-neon-red)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t("sidebar.deleteProject")}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t("wirelist.cannotUndo")}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {t("sidebar.deleteProjectMsg")} <strong style={{ color: 'var(--text-primary)' }}>{deleteProjectTarget.name}</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteProjectTarget(null)}>{t("sidebar.cancel")}</button>
              <button
                className="btn"
                onClick={async () => {
                  try {
                    await deleteProject(deleteProjectTarget.id);
                  } catch (err) { /* handled in store */ }
                  setDeleteProjectTarget(null);
                }}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--accent-neon-red)', color: 'var(--accent-neon-red)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> {t("sidebar.deleteProject")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Rack Confirmation Modal */}
      {deleteRackTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, backdropFilter: 'blur(6px)',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--accent-neon-red)', padding: '8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} color="var(--accent-neon-red)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Eliminar Rack</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t("wirelist.cannotUndo")}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {t("sidebar.confirmDelete")} <strong style={{ color: 'var(--text-primary)' }}>{deleteRackTarget.name}</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteRackTarget(null)}>{t("sidebar.cancel")}</button>
              <button
                className="btn"
                onClick={async () => {
                  try {
                    await deleteRack(deleteRackTarget.id);
                  } catch (err) { /* handled in store */ }
                  setDeleteRackTarget(null);
                }}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--accent-neon-red)', color: 'var(--accent-neon-red)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> Eliminar Rack
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}

import { create } from 'zustand';
import i18n from '../i18n';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

export interface Port {
  id: string;
  deviceId: string;
  name: string;
  type: 'COPPER' | 'SFP_FIBER' | 'GBIC_FIBER' | 'MGMT' | 'POWER';
  speed: string;
  direction: 'IN' | 'OUT' | 'BIDIRECTIONAL';
  connectedSource?: Connection;
  connectedDest?: Connection;
}

export interface Device {
  id: string;
  rackId: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  positionU: number;
  heightU: number;
  metadata?: any;
  ports: Port[];
  rack?: Rack;
}

export interface Rack {
  id: string;
  projectId: string;
  name: string;
  heightU: number;
  devices?: Device[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  racks?: Rack[];
}

export interface Connection {
  id: string;
  sourcePortId: string;
  destPortId: string;
  cableType: 'CAT5E' | 'CAT6' | 'SM_FIBER' | 'MM_FIBER' | 'DAC' | 'POWER';
  cableColor: string;
  lengthMeters: number;
  labelTag?: string;
  sourcePort?: Port & { device: Device };
  destPort?: Port & { device: Device };
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface RackState {
  projects: Project[];
  activeProject: Project | null;
  racks: Rack[];
  activeRack: Rack | null;
  rackDetails: Rack | null;
  activeDevice: Device | null;
  wirelist: Connection[];
  isMultiRackView: boolean;
  isViewOnly: boolean;
  isLoading: boolean;
  error: string | null;
  toasts: Toast[];

  // View & Mode actions
  setMultiRackView: (enabled: boolean) => Promise<void>;
  setViewOnly: (enabled: boolean) => void;
  refreshWorkspaceData: () => Promise<void>;

  // Toast actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Actions
  fetchProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  fetchRacks: (projectId: string) => Promise<void>;
  selectRack: (rackId: string) => Promise<void>;
  setActiveDevice: (device: Device | null) => void;
  
  createProject: (name: string, description?: string) => Promise<void>;
  updateProject: (projectId: string, name: string, description?: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createRack: (name: string, heightU: number) => Promise<void>;
  updateRack: (rackId: string, name: string, heightU: number) => Promise<void>;
  deleteRack: (rackId: string) => Promise<void>;
  createDevice: (data: {
    rackId?: string;
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
    positionU: number;
    heightU: number;
    metadata?: any;
    ports: Array<{ name: string; type: string; speed: string; direction?: string }>;
  }) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  updateDevice: (deviceId: string, data: {
    name?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    positionU?: number;
    heightU?: number;
    metadata?: any;
    portsSetup?: any;
  }) => Promise<void>;
  addPort: (deviceId: string, data: {
    name: string;
    type: string;
    speed: string;
    direction?: string;
  }) => Promise<void>;
  deletePort: (portId: string) => Promise<void>;
  
  createConnection: (data: {
    sourcePortId: string;
    destPortId: string;
    cableType: string;
    cableColor: string;
    lengthMeters: number;
    labelTag?: string;
  }) => Promise<void>;
  updateConnection: (connectionId: string, data: {
    sourcePortId?: string;
    destPortId?: string;
    cableType?: string;
    cableColor?: string;
    lengthMeters?: number;
    labelTag?: string;
  }) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  fetchWirelist: (rackId: string) => Promise<void>;
  fetchProjectWirelist: (projectId: string) => Promise<void>;
}

export const useRackStore = create<RackState>((set, get) => ({
  projects: [],
  activeProject: null,
  racks: [],
  activeRack: null,
  rackDetails: null,
  activeDevice: null,
  wirelist: [],
  isMultiRackView: false,
  isViewOnly: false,
  isLoading: false,
  error: null,
  toasts: [],

  setMultiRackView: async (enabled: boolean) => {
    set({ isMultiRackView: enabled, activeDevice: null });
    await get().refreshWorkspaceData();
  },

  setViewOnly: (enabled: boolean) => {
    set({ isViewOnly: enabled });
  },

  refreshWorkspaceData: async () => {
    const { activeProject, activeRack, isMultiRackView } = get();
    if (!activeProject) return;

    set({ isLoading: true });
    try {
      const resRacks = await fetch(`${API_URL}/racks/project/${activeProject.id}`);
      if (resRacks.ok) {
        const racksData: Rack[] = await resRacks.json();
        set({ racks: racksData });

        if (isMultiRackView) {
          await get().fetchProjectWirelist(activeProject.id);
          if (activeRack) {
            const updatedActive = racksData.find((r) => r.id === activeRack.id) || racksData[0] || null;
            set({ activeRack: updatedActive, rackDetails: updatedActive });
          } else if (racksData.length > 0) {
            set({ activeRack: racksData[0], rackDetails: racksData[0] });
          }
        } else if (activeRack) {
          const resDetails = await fetch(`${API_URL}/racks/${activeRack.id}`);
          if (resDetails.ok) {
            const dataDetails = await resDetails.json();
            set({ rackDetails: dataDetails, activeRack: dataDetails });
          }
          await get().fetchWirelist(activeRack.id);
        }
      }
    } catch (err: any) {
      get().showToast(err.message, 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  showToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4000);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/projects`);
      if (!res.ok) throw new Error('Error al conectar con el servidor.');
      const data = await res.json();
      set({ projects: data, isLoading: false });
      
      if (data.length > 0 && !get().activeProject) {
        get().selectProject(data[0].id);
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
    }
  },

  selectProject: async (projectId: string) => {
    const project = get().projects.find((p) => p.id === projectId) || null;
    set({ activeProject: project, activeRack: null, rackDetails: null, activeDevice: null, wirelist: [] });
    if (project) {
      await get().fetchRacks(project.id);
    }
  },

  fetchRacks: async (projectId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/racks/project/${projectId}`);
      if (!res.ok) throw new Error('Error al cargar racks del servidor.');
      const data = await res.json();
      set({ racks: data, isLoading: false });
      
      if (data.length > 0) {
        if (get().isMultiRackView) {
          set({ activeRack: data[0], rackDetails: data[0] });
          await get().fetchProjectWirelist(projectId);
        } else {
          await get().selectRack(data[0].id);
        }
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
    }
  },

  selectRack: async (rackId: string) => {
    const rack = get().racks.find((r) => r.id === rackId) || null;
    set({ activeRack: rack, activeDevice: null });
    if (rack) {
      set({ isLoading: true });
      try {
        const resDetails = await fetch(`${API_URL}/racks/${rackId}`);
        if (!resDetails.ok) throw new Error('Error al cargar detalles del rack.');
        const dataDetails = await resDetails.json();
        set({ rackDetails: dataDetails });
        
        if (get().isMultiRackView && get().activeProject) {
          await get().fetchProjectWirelist(get().activeProject!.id);
        } else {
          await get().fetchWirelist(rackId);
        }
      } catch (err: any) {
        get().showToast(err.message, 'error');
      } finally {
        set({ isLoading: false });
      }
    }
  },

  setActiveDevice: (device: Device | null) => {
    set({ activeDevice: device });
  },

  createProject: async (name, description) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el proyecto.');
      }
      get().showToast(i18n.t("toast.projectCreated"), 'success');
      await get().fetchProjects();
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  updateProject: async (projectId, name, description) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar el proyecto.');
      }
      get().showToast(i18n.t("toast.projectUpdated"), 'success');
      await get().fetchProjects();
      if (get().activeProject?.id === projectId) {
        const updatedProj = get().projects.find(p => p.id === projectId) || null;
        set({ activeProject: updatedProj });
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar el proyecto.');
      }
      get().showToast(i18n.t("toast.projectDeleted"), 'info');
      const wasActive = get().activeProject?.id === projectId;
      set({ projects: get().projects.filter((p) => p.id !== projectId) });
      if (wasActive) {
        set({ activeProject: null, activeRack: null, rackDetails: null, activeDevice: null, wirelist: [] });
        const remaining = get().projects;
        if (remaining.length > 0) {
          await get().selectProject(remaining[0].id);
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  createRack: async (name, heightU) => {
    const activeProject = get().activeProject;
    if (!activeProject) throw new Error('Selecciona un proyecto primero.');
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/racks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, name, heightU }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el rack.');
      }
      get().showToast(i18n.t("toast.rackCreated"), 'success');
      await get().fetchRacks(activeProject.id);
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  updateRack: async (rackId, name, heightU) => {
    const activeProject = get().activeProject;
    if (!activeProject) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/racks/${rackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, heightU }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar el rack.');
      }
      get().showToast(i18n.t("toast.rackUpdated"), 'success');
      await get().fetchRacks(activeProject.id);
      if (get().activeRack?.id === rackId) {
        await get().selectRack(rackId);
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  deleteRack: async (rackId) => {
    const activeProject = get().activeProject;
    if (!activeProject) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/racks/${rackId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar el rack.');
      }
      get().showToast(i18n.t("toast.rackDeleted"), 'info');
      const wasActive = get().activeRack?.id === rackId;
      await get().fetchRacks(activeProject.id);
      if (wasActive) {
        set({ activeRack: null, rackDetails: null, activeDevice: null, wirelist: [] });
        const remainingRacks = get().racks;
        if (remainingRacks.length > 0) {
          await get().selectRack(remainingRacks[0].id);
        }
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  createDevice: async (deviceData) => {
    const targetRackId = deviceData.rackId || get().activeRack?.id;
    if (!targetRackId) throw new Error('Selecciona un rack primero.');
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...deviceData, rackId: targetRackId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al montar el dispositivo.');
      }
      get().showToast(i18n.t("app.toast.deviceMounted"), 'success');
      await get().refreshWorkspaceData();
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  deleteDevice: async (deviceId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/devices/${deviceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar el dispositivo.');
      get().showToast(i18n.t("app.toast.deviceRemoved"), 'info');
      if (get().activeDevice?.id === deviceId) {
        set({ activeDevice: null });
      }
      await get().refreshWorkspaceData();
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  updateDevice: async (deviceId, deviceData) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar el dispositivo.');
      }
      get().showToast(i18n.t("app.toast.deviceUpdated"), 'success');
      await get().refreshWorkspaceData();

      // Update the activeDevice state in store so the UI is refreshed
      const allDevs = get().isMultiRackView
        ? get().racks.flatMap((r) => r.devices || [])
        : (get().rackDetails?.devices || []);
      if (get().activeDevice?.id === deviceId) {
        const updatedDev = allDevs.find((d) => d.id === deviceId) || null;
        set({ activeDevice: updatedDev });
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  addPort: async (deviceId, portData) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/devices/${deviceId}/ports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al agregar el puerto.');
      }
      get().showToast(i18n.t("app.toast.portAdded"), 'success');
      await get().refreshWorkspaceData();

      const allDevs = get().isMultiRackView
        ? get().racks.flatMap((r) => r.devices || [])
        : (get().rackDetails?.devices || []);
      if (get().activeDevice) {
        const updatedDev = allDevs.find((d) => d.id === deviceId) || null;
        set({ activeDevice: updatedDev });
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  deletePort: async (portId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/devices/ports/${portId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar el puerto.');
      }
      get().showToast(i18n.t("app.toast.portRemoved"), 'info');
      await get().refreshWorkspaceData();

      const allDevs = get().isMultiRackView
        ? get().racks.flatMap((r) => r.devices || [])
        : (get().rackDetails?.devices || []);
      const activeDev = get().activeDevice;
      if (activeDev) {
        const updatedDev = allDevs.find((d) => d.id === activeDev.id) || null;
        set({ activeDevice: updatedDev });
      }
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  fetchWirelist: async (rackId: string) => {
    try {
      const res = await fetch(`${API_URL}/connections/rack/${rackId}`);
      if (!res.ok) throw new Error('Error al cargar cableado.');
      const data = await res.json();
      set({ wirelist: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchProjectWirelist: async (projectId: string) => {
    try {
      const res = await fetch(`${API_URL}/connections/project/${projectId}`);
      if (!res.ok) throw new Error('Error al cargar cableado del proyecto.');
      const data = await res.json();
      set({ wirelist: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  createConnection: async (connData) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al conectar los puertos.');
      }
      get().showToast(i18n.t("app.toast.cableInstalled"), 'success');
      await get().refreshWorkspaceData();
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  updateConnection: async (connectionId, connData) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/connections/${connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar el cable.');
      }
      get().showToast(i18n.t("app.toast.cableModified"), 'success');
      await get().refreshWorkspaceData();
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },

  deleteConnection: async (connectionId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/connections/${connectionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al desconectar el cable.');
      get().showToast(i18n.t("app.toast.cableDisconnected"), 'info');
      await get().refreshWorkspaceData();
    } catch (err: any) {
      set({ isLoading: false });
      get().showToast(err.message, 'error');
      throw err;
    }
  },
}));

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app": {
        "dockerActive": "Docker Active",
        "exportCSV": "Export (CSV)",
        "generateReport": "Generate Report"
      },
      "sidebar": {
        "rackManagement": "Rack Management",
        "availableRacks": "Available Racks",
        "addRack": "Add Rack",
        "rackName": "Rack Name",
        "heightU": "Height (U)",
        "createRack": "Create Rack",
        "cancel": "Cancel",
        "deleteRack": "Delete Rack",
        "confirmDelete": "Are you sure you want to delete this rack? All devices and connections will be lost."
      },
      "wirelist": {
        "title": "Wirelist: Connection Table",
        "search": "Search by device, port, or label...",
        "source": "Source",
        "target": "Target",
        "type": "Type",
        "color": "Color",
        "length": "Length",
        "label": "Label",
        "actions": "Actions",
        "addConnection": "Add Connection",
        "noConnections": "No connections in this rack. Add a connection to see the wirelist.",
        "meters": "m"
      },
      "connectionModal": {
        "title": "Create Cable Connection",
        "sourceDev": "Source Device",
        "sourcePort": "Source Port",
        "targetDev": "Target Device",
        "targetPort": "Target Port",
        "mediaType": "Physical Media",
        "cableColor": "Cable Color",
        "length": "Length (Meters)",
        "labelTag": "Label (Optional)",
        "save": "Save Connection",
        "cancel": "Cancel"
      },
      "rackface": {
        "deviceDetails": "Device Details",
        "brand": "Brand",
        "model": "Model",
        "sn": "S/N",
        "ports": "Ports",
        "edit": "Edit",
        "clone": "Clone",
        "delete": "Delete",
        "confirmDeleteTitle": "Confirm Deletion",
        "confirmDeleteMsg": "Delete {{name}}? All its cable connections will also be removed.",
        "confirm": "Confirm Deletion",
        "cancel": "Cancel",
        "addDevice": "Mount Device",
        "editDevice": "Edit Device",
        "devName": "Device Name",
        "color": "Chassis Color",
        "portConfig": "Port Configuration",
        "copper": "Copper (RJ45)",
        "sfp": "Fiber (SFP/SFP+)",
        "gbic": "Fiber (GBIC)",
        "mgmt": "Management (OOB)",
        "power": "Power Supply (PSU)",
        "save": "Save Device"
      }
    }
  },
  es: {
    translation: {
      "app": {
        "dockerActive": "Docker Activo",
        "exportCSV": "Exportar (CSV)",
        "generateReport": "Generar Reporte"
      },
      "sidebar": {
        "rackManagement": "Gestión de Gabinetes",
        "availableRacks": "Racks Disponibles",
        "addRack": "Añadir Gabinete",
        "rackName": "Nombre del Rack",
        "heightU": "Altura (U)",
        "createRack": "Crear Gabinete",
        "cancel": "Cancelar",
        "deleteRack": "Eliminar Gabinete",
        "confirmDelete": "¿Estás seguro de eliminar este rack? Se perderán todos sus equipos y cables."
      },
      "wirelist": {
        "title": "Wirelist: Tabla de Conexiones",
        "search": "Buscar equipo, puerto o etiqueta...",
        "source": "Origen",
        "target": "Destino",
        "type": "Tipo",
        "color": "Color",
        "length": "Longitud",
        "label": "Etiqueta",
        "actions": "Acciones",
        "addConnection": "Añadir Conexión",
        "noConnections": "No hay conexiones en este rack. Añade cableado para ver la lista.",
        "meters": "m"
      },
      "connectionModal": {
        "title": "Crear Conexión de Cableado",
        "sourceDev": "Equipo Origen",
        "sourcePort": "Puerto Origen",
        "targetDev": "Equipo Destino",
        "targetPort": "Puerto Destino",
        "mediaType": "Medio Físico",
        "cableColor": "Color de Cable",
        "length": "Longitud (Metros)",
        "labelTag": "Etiqueta (Opcional)",
        "save": "Guardar Conexión",
        "cancel": "Cancelar"
      },
      "rackface": {
        "deviceDetails": "Detalles del Equipo",
        "brand": "Marca",
        "model": "Modelo",
        "sn": "S/N",
        "ports": "Puertos",
        "edit": "Editar",
        "clone": "Clonar",
        "delete": "Eliminar",
        "confirmDeleteTitle": "Confirmar Eliminación",
        "confirmDeleteMsg": "¿Eliminar {{name}}? Se eliminarán también todas sus conexiones de cableado.",
        "confirm": "Confirmar Eliminación",
        "cancel": "Cancelar",
        "addDevice": "Montar Equipo",
        "editDevice": "Editar Equipo",
        "devName": "Nombre de Equipo",
        "color": "Color de Chasis",
        "portConfig": "Configuración Manual de Puertos",
        "copper": "Cobre (RJ45)",
        "sfp": "Fibra (SFP/SFP+)",
        "gbic": "Fibra (GBIC)",
        "mgmt": "Administración (OOB)",
        "power": "Fuente de Poder (PSU)",
        "save": "Guardar Equipo"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('rackdraw-lang') || 'es',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

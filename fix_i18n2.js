const fs = require('fs');

let c = fs.readFileSync('frontend/src/i18n.ts', 'utf8');

c = c.replace(
  '"linkDetail": "LINK DETAIL"',
  '"linkDetail": "LINK DETAIL",\n        "selectedPort": "SELECTED PORT",\n        "port": "Port",\n        "speed": "Speed",\n        "unassignedInterface": "Unassigned Interface",\n        "unassignedDesc": "This network port is not connected to any cable in this rack.",\n        "startCabling": "Start Cabling from Here"'
);

c = c.replace(
  '"linkDetail": "DETALLE DE ENLACE"',
  '"linkDetail": "DETALLE DE ENLACE",\n        "selectedPort": "PUERTO SELECCIONADO",\n        "port": "Puerto",\n        "speed": "Velocidad",\n        "unassignedInterface": "Interfaz no asignada",\n        "unassignedDesc": "Este puerto de red no está conectado a ningún cable en este rack.",\n        "startCabling": "Iniciar Cableado desde Aquí"'
);

c = c.replace(
  '"hardwareConfig": "Hardware and interfaces configuration"',
  '"hardwareConfig": "Hardware and interfaces configuration",\n        "mod": "Mod",\n        "cloneTooltip": "Clone device in next available space"'
);

c = c.replace(
  '"hardwareConfig": "Configuración de hardware e interfaces"',
  '"hardwareConfig": "Configuración de hardware e interfaces",\n        "mod": "Mod",\n        "cloneTooltip": "Clonar equipo en siguiente espacio disponible"'
);

fs.writeFileSync('frontend/src/i18n.ts', c);
console.log('Fixed i18n.ts');

const fs = require('fs');

function applyFixes(path, fixes) {
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of fixes) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

const wireListPanelPath = 'frontend/src/components/layout/WireListPanel.tsx';
applyFixes(wireListPanelPath, [
    // Inspector de Dispositivo
    [
        'Inspector de Dispositivo', 
        '{t("wirelist.inspector")}'
    ],
    // Haz clic en un equipo...
    [
        'Haz clic en un equipo del rack o en un puerto para editar sus conexiones.',
        '{t("wirelist.clickToEdit")}'
    ],
    // Wire List (Cableado Completo)
    [
        ": 'Wire List (Cableado Completo)'}",
        ": t('wirelist.fullList')}"
    ],
    // Cables de
    [
        "? `Cables de ${activeDevice.name}`",
        "? `${t('wirelist.cablesOf')} ${activeDevice.name}`"
    ],
    // Color
    [
        '>Color</label>',
        '>{t("wirelist.color")}</label>'
    ],
    // Etiqueta
    [
        '>Etiqueta</label>',
        '>{t("wirelist.tag")}</label>'
    ],
    // Longitud (m)
    [
        '>Longitud (m)</label>',
        '>{t("wirelist.lengthM")}</label>'
    ],
    // Cancelar (in inline edit)
    [
        '>Cancelar</button>',
        '>{t("wirelist.cancel")}</button>'
    ],
    // Guardar (in inline edit)
    [
        '>Guardar</button>',
        '>{t("wirelist.save")}</button>'
    ],
    // Retirar Cable
    [
        '>Retirar Cable</h2>',
        '>{t("wirelist.removeCable")}</h2>'
    ],
    // Esta accion no se puede deshacer
    [
        '>Esta acción no se puede deshacer</p>',
        '>{t("wirelist.cannotUndo")}</p>'
    ],
    // Desconectar y retirar este cable...
    [
        '>¿Desconectar y retirar este cable del rack? Los puertos quedarán disponibles para nuevas conexiones.</p>',
        '>{t("wirelist.disconnectPrompt")}</p>'
    ],
    // Cancelar (in delete modal)
    [
        '>Cancelar</button>', // Wait this might replace multiple. Let's use regex or just be careful.
        '>{t("wirelist.cancel")}</button>' // it's fine, replacing all >Cancelar</button> is ok
    ],
    // Retirar Cable (button)
    [
        '>Retirar Cable</button>',
        '>{t("wirelist.removeCable")}</button>'
    ],
    // DETALLE DE ENLACE
    [
        '>DETALLE DE ENLACE</h3>',
        '>{t("wirelist.linkDetail")}</h3>'
    ]
]);

// Actually replace all >Cancelar</button> if we need to
let wireListContent = fs.readFileSync(wireListPanelPath, 'utf8');
wireListContent = wireListContent.replace(/>Cancelar<\/button>/g, '>{t("wirelist.cancel")}</button>');
wireListContent = wireListContent.replace(/P\$\{port.name.replace\('P', ''\)\} \(Actual\)/g, 'P${port.name.replace(\'P\', \'\')} {t("connection.actual")}');
fs.writeFileSync(wireListPanelPath, wireListContent);

// ConnectionModal.tsx
const connectionModalPath = 'frontend/src/components/ui/ConnectionModal.tsx';
applyFixes(connectionModalPath, [
    ['>Equipo Origen<', '>{t("connection.sourceDev")}<'],
    ['>Puerto Origen<', '>{t("connection.sourcePort")}<'],
    ['>Equipo Destino<', '>{t("connection.targetDev")}<'],
    ['>Puerto Destino<', '>{t("connection.targetPort")}<'],
    ['>Tipo de Cable<', '>{t("connection.cableType")}<'], // Tipo de cable vs Medio Fisico
    ['>Medio Físico<', '>{t("connection.mediaType")}<'],
    ['>Color<', '>{t("wirelist.color")}<'], // From screenshot "Color"
    ['>Color de Cable<', '>{t("connection.cableColor")}<'],
    ['>Longitud (m)<', '>{t("wirelist.lengthM")}<'], // From screenshot
    ['>Longitud (Metros)<', '>{t("connection.length")}<'],
    ['>Etiqueta Cable<', '>{t("connection.cableLabel")}<'], // From screenshot
    ['>Etiqueta (Opcional)<', '>{t("connection.labelTag")}<'],
    ['>Retirar<', '>{t("connection.remove")}<'], // from screenshot
    ['>Guardar<', '>{t("wirelist.save")}<'], // from screenshot
    ['>Guardar Conexión<', '>{t("connection.save")}<'],
    ['>Cancelar<', '>{t("connection.cancel")}<'],
    ['>Crear Conexión de Cableado<', '>{t("connection.title")}<']
]);
// Inject useTranslation into ConnectionModal if missing
let cModalContent = fs.readFileSync(connectionModalPath, 'utf8');
if (!cModalContent.includes('useTranslation')) {
    cModalContent = cModalContent.replace('import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore');
    cModalContent = cModalContent.replace('}: ConnectionModalProps) {', '}: ConnectionModalProps) {\n  const { t } = useTranslation();');
}
cModalContent = cModalContent.replace(/P\$\{port.name.replace\('P', ''\)\} \(Actual\)/g, 'P${port.name.replace(\'P\', \'\')} {t("connection.actual")}');
fs.writeFileSync(connectionModalPath, cModalContent);


// Also let's double check Sidebar for "Super Demo Datacenter". The projects list isn't translated because those are ACTUAL database values, not hardcoded! But the modals might be.
console.log('Fixed strings successfully.');

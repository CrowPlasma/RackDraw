const fs = require('fs');

function update_file(filepath, replacements) {
    let content = fs.readFileSync(filepath, 'utf8');
    for (let [old_str, new_str] of replacements) {
        content = content.replace(old_str, new_str);
    }
    fs.writeFileSync(filepath, content);
}

update_file('frontend/src/components/layout/WireListPanel.tsx', [
    ['>Haz clic en un equipo del rack o en un puerto para editar sus conexiones.<', '>{t("wirelist.clickToEdit")}<'],
    ['>WIRE LIST (CABLEADO COMPLETO)<', '>{t("wirelist.fullList")}<'],
    ['>Color<', '>{t("wirelist.color")}<'],
    ['>Etiqueta<', '>{t("wirelist.tag")}<'],
    ['>Longitud (m)<', '>{t("wirelist.lengthM")}<'],
    ['>Cancelar<', '>{t("wirelist.cancel")}<'],
    ['>Guardar<', '>{t("wirelist.save")}<'],
    ['>Retirar Cable<', '>{t("wirelist.removeCable")}<'],
    ['>Esta acción no se puede deshacer<', '>{t("wirelist.cannotUndo")}<'],
    ['>¿Desconectar y retirar este cable del rack? Los puertos quedarán disponibles para nuevas conexiones.<', '>{t("wirelist.disconnectPrompt")}<'],
    ['>DETALLE DE ENLACE<', '>{t("wirelist.linkDetail")}<'],
    ["P${port.name.replace('P', '')} (Actual)", 'P${port.name.replace(\'P\', \'\')} {t("connection.actual")}'],
    ['placeholder="Switch-P1 ➔ Switch-P2"', 'placeholder="Switch-P1 ➔ Switch-P2"'],
    ['>Equipo Origen<', '>{t("connection.sourceDev")}<'],
    ['>Puerto Origen<', '>{t("connection.sourcePort")}<'],
    ['>Equipo Destino<', '>{t("connection.targetDev")}<'],
    ['>Puerto Destino<', '>{t("connection.targetPort")}<'],
    ['>Tipo de Cable<', '>{t("connection.cableType")}<'],
    ['>Etiqueta Cable<', '>{t("connection.cableLabel")}<'],
    ['>Retirar<', '>{t("connection.remove")}<']
]);

let c = fs.readFileSync('frontend/src/components/ui/ConnectionModal.tsx', 'utf8');
if (!c.includes('useTranslation')) {
    c = c.replace('import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore');
    c = c.replace('}: ConnectionModalProps) {', '}: ConnectionModalProps) {\n  const { t } = useTranslation();');
    fs.writeFileSync('frontend/src/components/ui/ConnectionModal.tsx', c);
}

update_file('frontend/src/components/ui/ConnectionModal.tsx', [
    ['>Equipo Origen<', '>{t("connection.sourceDev")}<'],
    ['>Puerto Origen<', '>{t("connection.sourcePort")}<'],
    ['>Equipo Destino<', '>{t("connection.targetDev")}<'],
    ['>Puerto Destino<', '>{t("connection.targetPort")}<'],
    ['>Medio Físico<', '>{t("connection.mediaType")}<'],
    ['>Color de Cable<', '>{t("connection.cableColor")}<'],
    ['>Longitud (Metros)<', '>{t("connection.length")}<'],
    ['>Etiqueta (Opcional)<', '>{t("connection.labelTag")}<'],
    ['>Guardar Conexión<', '>{t("connection.save")}<'],
    ['>Cancelar<', '>{t("connection.cancel")}<'],
    ['>Crear Conexión de Cableado<', '>{t("connection.title")}<']
]);

console.log("Translations applied.");

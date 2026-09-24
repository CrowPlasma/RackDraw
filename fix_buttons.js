const fs = require('fs');

function applyRegexFixes(path, fixes) {
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of fixes) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

applyRegexFixes('frontend/src/components/layout/WireListPanel.tsx', [
    [/<Save size=\{13\} \/> Guardar/g, '<Save size={13} /> {t("wirelist.save")}'],
    [/<Save size=\{12\} \/> Guardar/g, '<Save size={12} /> {t("wirelist.save")}'],
    [/<Save size=\{15\} \/> Guardar Chasis/g, '<Save size={15} /> {t("rackface.save")}'],
    [/return 'Cobre';/g, 'return t("wirelist.copper");'],
    [/<option value="CAT6">Cobre<\/option>/g, '<option value="CAT6">{t("wirelist.copper")}</option>'],
    [/>Cancelar</g, '>{t("wirelist.cancel")}<'],
    [/>\s*Cancelar\s*</g, '>{t("wirelist.cancel")}<']
]);

console.log('Fixed final final strings in WireListPanel');

const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/ui/ConnectionModal.tsx', 'utf8');

c = c.replace(/const CABLE_PRESETS = \[[\s\S]*?\];\n/, ''); // remove from outside
c = c.replace('export default function ConnectionModal({', `export default function ConnectionModal({\n  isOpen,\n  onClose,\n  sourcePort,\n  sourceDevice,\n  destPort,\n  destDevice\n}: ConnectionModalProps) {\n  const { t } = useTranslation();\n\n  const CABLE_PRESETS = [\n    { label: t("connection.copperBlue"), type: 'CAT6', color: '#38bdf8' },\n    { label: t("connection.fiberOrange"), type: 'SM_FIBER', color: '#f97316' },\n    { label: t("connection.fiberPurple"), type: 'SM_FIBER', color: '#a855f7' },\n    { label: t("connection.powerYellow"), type: 'POWER', color: '#eab308' },\n  ];`);

// Clean up duplicate function signature
c = c.replace(/export default function ConnectionModal\(\{\n  isOpen,\n  onClose,\n  sourcePort,\n  sourceDevice,\n  destPort,\n  destDevice\n\}: ConnectionModalProps\) \{\n  const \{ t \} = useTranslation\(\);\n\n  const CABLE_PRESETS = \[[\s\S]*?\];\n  isOpen,\n  onClose,\n  sourcePort,\n  sourceDevice,\n  destPort,\n  destDevice\n\}: ConnectionModalProps\) \{/g, `export default function ConnectionModal({\n  isOpen,\n  onClose,\n  sourcePort,\n  sourceDevice,\n  destPort,\n  destDevice\n}: ConnectionModalProps) {\n  const { t } = useTranslation();\n\n  const CABLE_PRESETS = [\n    { label: t("connection.copperBlue"), type: 'CAT6', color: '#38bdf8' },\n    { label: t("connection.fiberOrange"), type: 'SM_FIBER', color: '#f97316' },\n    { label: t("connection.fiberPurple"), type: 'SM_FIBER', color: '#a855f7' },\n    { label: t("connection.powerYellow"), type: 'POWER', color: '#eab308' },\n  ];`);

fs.writeFileSync('frontend/src/components/ui/ConnectionModal.tsx', c);

console.log("Moved presets");

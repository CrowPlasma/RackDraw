const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/rackface/RackfaceGrid.tsx', 'utf8');
if (!c.includes('useTranslation')) {
  c = c.replace('import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore');
  c = c.replace('RackfaceGridProps) {', 'RackfaceGridProps) {\n  const { t } = useTranslation();');
}
fs.writeFileSync('frontend/src/components/rackface/RackfaceGrid.tsx', c);

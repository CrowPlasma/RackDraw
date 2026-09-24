import { PrismaClient, PortType, CableType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Realistic Enterprise 48U Super Demo RackDraw database...');

  // Clean old data
  await prisma.connection.deleteMany({});
  await prisma.port.deleteMany({});
  await prisma.device.deleteMany({});
  await prisma.rack.deleteMany({});
  await prisma.project.deleteMany({});

  // 1. Create Default Project
  const project = await prisma.project.create({
    data: {
      name: 'Super Demo Datacenter',
      description: 'Infraestructura de Red Central y Telecomunicaciones de Alta Disponibilidad',
    },
  });

  // 2. Create 48U Rack
  const rack = await prisma.rack.create({
    data: {
      projectId: project.id,
      name: 'Rack de Distribución DC-02 (48U)',
      heightU: 48,
    },
  });

  // Define structured device data
  const devicesToCreate = [
    // Slot 1: APC PDU Active A (1U)
    {
      name: 'PDU Principal A (Línea Eléctrica 1)',
      brand: 'APC',
      model: 'AP8953 Active PDU',
      serialNumber: 'SN-PDU-A48',
      positionU: 1,
      heightU: 1,
      color: '#10b981',
      ports: [
        ...Array.from({ length: 26 }, (_, i) => ({ name: `Out${i + 1}`, type: PortType.POWER, speed: 'N/A' })),
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Console', type: PortType.COPPER, speed: '9600bps' }
      ]
    },
    // Slot 2: APC PDU Active B (1U)
    {
      name: 'PDU Secundario B (Línea Eléctrica 2)',
      brand: 'APC',
      model: 'AP8953 Active PDU',
      serialNumber: 'SN-PDU-B48',
      positionU: 2,
      heightU: 1,
      color: '#10b981',
      ports: [
        ...Array.from({ length: 26 }, (_, i) => ({ name: `Out${i + 1}`, type: PortType.POWER, speed: 'N/A' })),
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Console', type: PortType.COPPER, speed: '9600bps' }
      ]
    },
    // Slot 3: Dell DB Server 01 (2U)
    {
      name: 'Base de Datos Transaccional DB-01',
      brand: 'Dell',
      model: 'PowerEdge R760',
      serialNumber: 'SN-SRV-DB01',
      positionU: 3,
      heightU: 2,
      color: '#3b82f6',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth2', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth3', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Eth4', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'FC1', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'FC2', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 5: Dell DB Server 02 (2U)
    {
      name: 'Base de Datos Replica DB-02',
      brand: 'Dell',
      model: 'PowerEdge R760',
      serialNumber: 'SN-SRV-DB02',
      positionU: 5,
      heightU: 2,
      color: '#3b82f6',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth2', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth3', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Eth4', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'FC1', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'FC2', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 7: HPE MSA SAN Storage (4U)
    {
      name: 'Cabina de Almacenamiento SAN Principal',
      brand: 'HPE',
      model: 'MSA 2060 Fibre Channel',
      serialNumber: 'SN-SAN-MSA2060',
      positionU: 7,
      heightU: 4,
      color: '#f97316',
      ports: [
        { name: 'CtrlA-FC1', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'CtrlA-FC2', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'CtrlB-FC1', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'CtrlB-FC2', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'MgA', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'MgB', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 11: Dell ESXi Host 01 (2U)
    {
      name: 'Hipervisor Virtualización ESXi-01',
      brand: 'Dell',
      model: 'PowerEdge R760 virtualization',
      serialNumber: 'SN-SRV-VM01',
      positionU: 11,
      heightU: 2,
      color: '#3b82f6',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth2', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth3', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Eth4', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'SFP1', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'SFP2', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 13: Dell ESXi Host 02 (2U)
    {
      name: 'Hipervisor Virtualización ESXi-02',
      brand: 'Dell',
      model: 'PowerEdge R760 virtualization',
      serialNumber: 'SN-SRV-VM02',
      positionU: 13,
      heightU: 2,
      color: '#3b82f6',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth2', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth3', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Eth4', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'SFP1', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'SFP2', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 15: Dell ESXi Host 03 (2U)
    {
      name: 'Hipervisor Virtualización ESXi-03',
      brand: 'Dell',
      model: 'PowerEdge R760 virtualization',
      serialNumber: 'SN-SRV-VM03',
      positionU: 15,
      heightU: 2,
      color: '#3b82f6',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth2', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth3', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Eth4', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'SFP1', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'SFP2', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 17: CyberPower KVM Console (1U)
    {
      name: 'Consola Local KVM de Operador',
      brand: 'CyberPower',
      model: 'KVM1008 Rack Draw Console',
      serialNumber: 'SN-KVM-001',
      positionU: 17,
      heightU: 1,
      color: '#64748b',
      ports: [
        { name: 'Uplink', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 18: QNAP Backup NAS (4U)
    {
      name: 'Servidor NAS de Almacenamiento Backups',
      brand: 'QNAP',
      model: 'TS-h2483XU Storage',
      serialNumber: 'SN-NAS-BACKUP',
      positionU: 18,
      heightU: 4,
      color: '#84cc16',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Eth2', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 22: Brocade Fiber Switch A (1U)
    {
      name: 'Switch FC SAN Switch Principal A',
      brand: 'Brocade',
      model: 'G620 Fibre Channel 32P',
      serialNumber: 'SN-SANSW-A',
      positionU: 22,
      heightU: 1,
      color: '#a855f7',
      ports: [
        { name: 'F1', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F3', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F4', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F5', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 23: Brocade Fiber Switch B (1U)
    {
      name: 'Switch FC SAN Switch Principal B',
      brand: 'Brocade',
      model: 'G620 Fibre Channel 32P',
      serialNumber: 'SN-SANSW-B',
      positionU: 23,
      heightU: 1,
      color: '#a855f7',
      ports: [
        { name: 'F1', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F3', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F4', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'F5', type: PortType.SFP_FIBER, speed: '16Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 24: Cisco Switch Core 48P (1U)
    {
      name: 'Switch Core Principal Cisco 48P',
      brand: 'Cisco',
      model: 'Catalyst 9300-48UXM',
      serialNumber: 'SN-SW-CORE48',
      positionU: 24,
      heightU: 1,
      color: '#06b6d4',
      ports: [
        ...Array.from({ length: 48 }, (_, i) => ({ name: `C${i + 1}`, type: PortType.COPPER, speed: '1Gbps' })),
        { name: 'F1', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F3', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F4', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F5', type: PortType.SFP_FIBER, speed: '100Gbps' },
        { name: 'F6', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F7', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F8', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        ...Array.from({ length: 28 }, (_, i) => ({ name: `MgPort${i + 1}`, type: PortType.COPPER, speed: '1Gbps' })),
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 25: Cisco Switch Distribución 24P (1U)
    {
      name: 'Switch Distribución Cisco 24P',
      brand: 'Cisco',
      model: 'Catalyst 9300-24T',
      serialNumber: 'SN-SW-DIST24',
      positionU: 25,
      heightU: 1,
      color: '#06b6d4',
      ports: [
        ...Array.from({ length: 24 }, (_, i) => ({ name: `C${i + 1}`, type: PortType.COPPER, speed: '1Gbps' })),
        { name: 'F1', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F3', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'F4', type: PortType.SFP_FIBER, speed: '25Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 26: Juniper Switch Distribución 24P (1U)
    {
      name: 'Switch Distribución Juniper 24P',
      brand: 'Juniper',
      model: 'EX3400-24T',
      serialNumber: 'SN-SW-JUN24',
      positionU: 26,
      heightU: 1,
      color: '#14b8a6',
      ports: [
        ...Array.from({ length: 24 }, (_, i) => ({ name: `C${i + 1}`, type: PortType.COPPER, speed: '1Gbps' })),
        { name: 'F1', type: PortType.SFP_FIBER, speed: '40Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '40Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 27: Cisco Switch Acceso 12P (1U)
    {
      name: 'Switch Acceso Cisco 12P',
      brand: 'Cisco',
      model: 'Catalyst 9200-12T',
      serialNumber: 'SN-SW-ACC12',
      positionU: 27,
      heightU: 1,
      color: '#06b6d4',
      ports: [
        ...Array.from({ length: 12 }, (_, i) => ({ name: `C${i + 1}`, type: PortType.COPPER, speed: '1Gbps' })),
        { name: 'F1', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 28: Panduit Patch Panel Copper 01 (1U)
    {
      name: 'Patch Panel Cat6 Cobre PP-01',
      brand: 'Panduit',
      model: 'DP24688TGY Cat6 24P',
      serialNumber: 'SN-PP-COP1',
      positionU: 28,
      heightU: 1,
      color: '#475569',
      ports: [
        ...Array.from({ length: 24 }, (_, i) => ({ name: `P${i + 1}`, type: PortType.COPPER, speed: '1Gbps' }))
      ]
    },
    // Slot 29: Panduit Patch Panel Copper 02 (1U)
    {
      name: 'Patch Panel Cat6 Cobre PP-02',
      brand: 'Panduit',
      model: 'DP24688TGY Cat6 24P',
      serialNumber: 'SN-PP-COP2',
      positionU: 29,
      heightU: 1,
      color: '#475569',
      ports: [
        ...Array.from({ length: 24 }, (_, i) => ({ name: `P${i + 1}`, type: PortType.COPPER, speed: '1Gbps' }))
      ]
    },
    // Slot 30: Corning Patch Panel Fiber 01 (1U)
    {
      name: 'Patch Panel Fibra Optica FO-01',
      brand: 'Corning',
      model: 'CCH-01U Fiber 24P',
      serialNumber: 'SN-PP-FIB1',
      positionU: 30,
      heightU: 1,
      color: '#475569',
      ports: [
        { name: 'F1', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F3', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F4', type: PortType.SFP_FIBER, speed: '10Gbps' }
      ]
    },
    // Slot 31: Corning Patch Panel Fiber 02 (1U)
    {
      name: 'Patch Panel Fibra Optica FO-02',
      brand: 'Corning',
      model: 'CCH-01U Fiber 24P',
      serialNumber: 'SN-PP-FIB2',
      positionU: 31,
      heightU: 1,
      color: '#475569',
      ports: [
        { name: 'F1', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F3', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F4', type: PortType.SFP_FIBER, speed: '10Gbps' }
      ]
    },
    // Slot 32: F5 Load Balancer 01 (1U)
    {
      name: 'Balanceador de Carga F5-LBA',
      brand: 'F5 Networks',
      model: 'BIG-IP i5800 LTM',
      serialNumber: 'SN-LB-F5A',
      positionU: 32,
      heightU: 1,
      color: '#ec4899',
      ports: [
        { name: 'F1', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 33: F5 Load Balancer 02 (1U)
    {
      name: 'Balanceador de Carga F5-LBB',
      brand: 'F5 Networks',
      model: 'BIG-IP i5800 LTM',
      serialNumber: 'SN-LB-F5B',
      positionU: 33,
      heightU: 1,
      color: '#ec4899',
      ports: [
        { name: 'F1', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'F2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 34: Fortinet Firewall A (1U)
    {
      name: 'Firewall Perimetral FW-Core-01',
      brand: 'Fortinet',
      model: 'FortiGate 600F HA-1',
      serialNumber: 'SN-FW-FG600F1',
      positionU: 34,
      heightU: 1,
      color: '#ef4444',
      ports: [
        { name: 'WAN1', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'WAN2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'HA', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'LAN1', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'LAN2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 35: Fortinet Firewall B (1U)
    {
      name: 'Firewall Perimetral FW-Core-02',
      brand: 'Fortinet',
      model: 'FortiGate 600F HA-2',
      serialNumber: 'SN-FW-FG600F2',
      positionU: 35,
      heightU: 1,
      color: '#ef4444',
      ports: [
        { name: 'WAN1', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'WAN2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'HA', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'LAN1', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'LAN2', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 36: Cisco ASR Router A (1U)
    {
      name: 'Router de Borde ISP-Router-A',
      brand: 'Cisco',
      model: 'ASR 1001-X Uplink A',
      serialNumber: 'SN-RTR-ASR1001A',
      positionU: 36,
      heightU: 1,
      color: '#06b6d4',
      ports: [
        { name: 'WAN', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'LAN', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 37: Cisco ASR Router B (1U)
    {
      name: 'Router de Borde ISP-Router-B',
      brand: 'Cisco',
      model: 'ASR 1001-X Uplink B',
      serialNumber: 'SN-RTR-ASR1001B',
      positionU: 37,
      heightU: 1,
      color: '#06b6d4',
      ports: [
        { name: 'WAN', type: PortType.SFP_FIBER, speed: '10Gbps' },
        { name: 'LAN', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 38: Supermicro DNS Server A (1U)
    {
      name: 'Servidor DNS / NTP Resolv A',
      brand: 'Supermicro',
      model: 'SYS-510P-W DNS Core A',
      serialNumber: 'SN-SRV-DNSA',
      positionU: 38,
      heightU: 1,
      color: '#eab308',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 39: Supermicro DNS Server B (1U)
    {
      name: 'Servidor DNS / NTP Resolv B',
      brand: 'Supermicro',
      model: 'SYS-510P-W DNS Core B',
      serialNumber: 'SN-SRV-DNSB',
      positionU: 39,
      heightU: 1,
      color: '#eab308',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 40: Dell Logging Server (2U)
    {
      name: 'Servidor de Logs & Auditoria Centralizada',
      brand: 'Dell',
      model: 'PowerEdge R760 syslog',
      serialNumber: 'SN-SRV-LOGS',
      positionU: 40,
      heightU: 2,
      color: '#3b82f6',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '10Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 42: HP AD Controller 01 (1U)
    {
      name: 'Controlador de Dominio Active Directory 01',
      brand: 'HP',
      model: 'ProLiant DL360 Gen11',
      serialNumber: 'SN-SRV-ADA',
      positionU: 42,
      heightU: 1,
      color: '#f97316',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 43: HP AD Controller 02 (1U)
    {
      name: 'Controlador de Dominio Active Directory 02',
      brand: 'HP',
      model: 'ProLiant DL360 Gen11',
      serialNumber: 'SN-SRV-ADB',
      positionU: 43,
      heightU: 1,
      color: '#f97316',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 44: Cisco VoIP Call Manager (1U)
    {
      name: 'Conmutador IP VoIP Call Manager',
      brand: 'Cisco',
      model: 'CUCM Server MCS7800',
      serialNumber: 'SN-SRV-VOIP',
      positionU: 44,
      heightU: 1,
      color: '#06b6d4',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '1Gbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '1Gbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Pwr2', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 45: Panduit Patch Panel Copper 03 (1U)
    {
      name: 'Patch Panel Cobre Dist PP-03',
      brand: 'Panduit',
      model: 'DP24688TGY Cat6 24P',
      serialNumber: 'SN-PP-COP3',
      positionU: 45,
      heightU: 1,
      color: '#475569',
      ports: [
        ...Array.from({ length: 24 }, (_, i) => ({ name: `P${i + 1}`, type: PortType.COPPER, speed: '1Gbps' }))
      ]
    },
    // Slot 46: Panduit Patch Panel Copper 04 (1U)
    {
      name: 'Patch Panel Cobre Dist PP-04',
      brand: 'Panduit',
      model: 'DP24688TGY Cat6 24P',
      serialNumber: 'SN-PP-COP4',
      positionU: 46,
      heightU: 1,
      color: '#475569',
      ports: [
        ...Array.from({ length: 24 }, (_, i) => ({ name: `P${i + 1}`, type: PortType.COPPER, speed: '1Gbps' }))
      ]
    },
    // Slot 47: APC Env Sensor (1U)
    {
      name: 'Sonda Monitoreo Ambiental NetBotz',
      brand: 'APC',
      model: 'NetBotz 250 environmental Probe',
      serialNumber: 'SN-NETBOTZ250',
      positionU: 47,
      heightU: 1,
      color: '#10b981',
      ports: [
        { name: 'Eth1', type: PortType.COPPER, speed: '100Mbps' },
        { name: 'Mg1', type: PortType.MGMT, speed: '100Mbps' },
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' }
      ]
    },
    // Slot 48: APC Terminal Console (1U)
    {
      name: 'Consola Terminal AP5717 KVM',
      brand: 'APC',
      model: 'AP5717 Console Drawer',
      serialNumber: 'SN-AP5717',
      positionU: 48,
      heightU: 1,
      color: '#10b981',
      ports: [
        { name: 'Pwr1', type: PortType.POWER, speed: 'N/A' },
        { name: 'Uplink', type: PortType.COPPER, speed: '9600bps' }
      ]
    }
  ];

  // Helper to quickly find ports
  const portMap: { [key: string]: any } = {};

  // Create devices and ports
  for (const devData of devicesToCreate) {
    const { ports, color, ...dbDev } = devData;
    const createdDev = await prisma.device.create({
      data: {
        ...dbDev,
        rackId: rack.id,
        metadata: { color }
      }
    });

    for (const port of ports) {
      const createdPort = await prisma.port.create({
        data: {
          ...port,
          deviceId: createdDev.id
        }
      });
      const key = `${createdDev.positionU}_${port.name}`;
      portMap[key] = {
        id: createdPort.id,
        name: port.name,
        type: port.type, // Store type here
        device: createdDev
      };
    }
  }

  console.log('Devices created. Establishing core network mesh cabling...');

  const connectedPorts = new Set<string>();

  // Connect helper
  async function connect(
    keyA: string,
    keyB: string,
    cableType: CableType,
    cableColor: string,
    length = 2.0
  ) {
    const portA = portMap[keyA];
    const portB = portMap[keyB];
    if (!portA || !portB) {
      console.warn(`Could not find port: ${keyA} or ${keyB}`);
      return false;
    }
    if (connectedPorts.has(portA.id) || connectedPorts.has(portB.id)) {
      return false;
    }
    await prisma.connection.create({
      data: {
        sourcePortId: portA.id,
        destPortId: portB.id,
        cableType,
        cableColor,
        lengthMeters: length,
        labelTag: `${portA.device.name.split(' ')[0]}-${portA.name} ➔ ${portB.device.name.split(' ')[0]}-${portB.name}`
      }
    });
    connectedPorts.add(portA.id);
    connectedPorts.add(portB.id);
    return true;
  }

  // --- CABLING ENTIRE NETWORK MESH ---
  // 1. ISP Edge to Firewalls
  await connect('36_LAN', '34_WAN1', CableType.CAT6, '#38bdf8', 1.0);
  await connect('37_LAN', '35_WAN1', CableType.CAT6, '#38bdf8', 1.0);

  // 2. Firewall HA Link
  await connect('34_HA', '35_HA', CableType.CAT6, '#ef4444', 0.5);

  // 3. Firewalls to F5 Load Balancers
  await connect('34_LAN1', '32_F1', CableType.MM_FIBER, '#f97316', 1.5);
  await connect('35_LAN1', '33_F1', CableType.MM_FIBER, '#f97316', 1.5);

  // 4. Load Balancers to Switch Core 48
  await connect('32_F2', '24_F1', CableType.MM_FIBER, '#f97316', 1.0);
  await connect('33_F2', '25_F1', CableType.MM_FIBER, '#f97316', 1.0);

  // 5. Firewalls to Corning FO Panels
  await connect('34_WAN2', '30_F3', CableType.SM_FIBER, '#a855f7', 1.0);
  await connect('35_WAN2', '31_F3', CableType.SM_FIBER, '#a855f7', 1.0);

  // 6. SAN Storage to SAN Brocade Switches
  await connect('7_CtrlA-FC1', '22_F3', CableType.MM_FIBER, '#f97316', 2.5);
  await connect('7_CtrlA-FC2', '22_F4', CableType.MM_FIBER, '#f97316', 2.5);
  await connect('7_CtrlB-FC1', '23_F3', CableType.MM_FIBER, '#f97316', 2.5);
  await connect('7_CtrlB-FC2', '23_F4', CableType.MM_FIBER, '#f97316', 2.5);

  // 7. DB Servers to Brocade Switches
  await connect('3_FC1', '22_F1', CableType.MM_FIBER, '#a855f7', 2.0);
  await connect('3_FC2', '23_F1', CableType.MM_FIBER, '#a855f7', 2.0);
  await connect('5_FC1', '22_F2', CableType.MM_FIBER, '#a855f7', 2.0);
  await connect('5_FC2', '23_F2', CableType.MM_FIBER, '#a855f7', 2.0);

  // 8. Brocade Switch Uplinks to Corning FO Panels
  await connect('22_F5', '30_F1', CableType.MM_FIBER, '#a855f7', 1.5);
  await connect('23_F5', '31_F1', CableType.MM_FIBER, '#a855f7', 1.5);

  // 9. ESXi Host Fiber to Switch Core 48 & 24P Cisco Switch
  await connect('11_SFP1', '24_F2', CableType.MM_FIBER, '#f97316', 2.0);
  await connect('11_SFP2', '24_F3', CableType.MM_FIBER, '#f97316', 2.0);
  await connect('13_SFP1', '25_F2', CableType.MM_FIBER, '#f97316', 2.0);
  await connect('13_SFP2', '25_F3', CableType.MM_FIBER, '#f97316', 2.0);
  await connect('15_SFP1', '24_F4', CableType.MM_FIBER, '#f97316', 2.0);
  await connect('15_SFP2', '25_F4', CableType.MM_FIBER, '#f97316', 2.0);

  // 10. ESXi Host copper links to Juniper Switch
  await connect('11_Eth1', '26_C1', CableType.CAT6, '#34d399', 1.5);
  await connect('11_Eth2', '26_C2', CableType.CAT6, '#34d399', 1.5);
  await connect('13_Eth1', '26_C3', CableType.CAT6, '#34d399', 1.5);
  await connect('13_Eth2', '26_C4', CableType.CAT6, '#34d399', 1.5);

  // 11. NAS Backups to Juniper Switch
  await connect('18_Eth1', '26_C5', CableType.CAT6, '#38bdf8', 2.0);
  await connect('18_Eth2', '26_C6', CableType.CAT6, '#38bdf8', 2.0);

  // 12. Dist Switch Uplinks to Core Switches
  await connect('26_F1', '24_F6', CableType.MM_FIBER, '#f97316', 1.0);
  await connect('25_F3', '24_F7', CableType.MM_FIBER, '#f97316', 1.0);
  await connect('26_F2', '25_F2', CableType.MM_FIBER, '#f97316', 0.5);

  // 13. KVM Operator Local Console
  await connect('17_Uplink', '25_C3', CableType.CAT6, '#facc15', 1.5);

  // 14. Firewall LAN2 to Core Switch SFPs
  await connect('34_LAN2', '24_F5', CableType.MM_FIBER, '#f97316', 1.5);
  await connect('35_LAN2', '24_F8', CableType.MM_FIBER, '#f97316', 1.5);

  // 15. Corning FO Patch Panels Cross-Connects
  await connect('30_F2', '31_F2', CableType.MM_FIBER, '#a855f7', 0.5);
  await connect('30_F4', '31_F4', CableType.MM_FIBER, '#a855f7', 0.5);

  // 16. Cisco Switch Acceso 12P SFPs to Switch Core 24P SFPs
  await connect('27_F1', '25_F3', CableType.MM_FIBER, '#f97316', 1.5);
  await connect('27_F2', '25_F4', CableType.MM_FIBER, '#f97316', 1.5);

  // --- AUTO-CABLING REMAINING DATA COPPER PORTS VIA PATCH PANELS ---
  // Collect all copper ports on servers (DNS, AD, logging, VoIP, DB, ESXi, NAS, sensor, terminal, etc.)
  const serverCopperPorts = Object.values(portMap).filter(
    (p) => p.device.positionU !== 1 && p.device.positionU !== 2 && // Exclude PDUs
           p.device.positionU !== 17 && p.device.positionU !== 48 && // Exclude Console drawers
           p.device.positionU !== 22 && p.device.positionU !== 23 && // Exclude Brocade FC
           p.device.positionU !== 24 && p.device.positionU !== 25 && // Exclude Core Switches
           p.device.positionU !== 26 && p.device.positionU !== 27 && // Exclude Dist Switches
           p.device.positionU !== 28 && p.device.positionU !== 29 && // Exclude PP-01, PP-02
           p.device.positionU !== 30 && p.device.positionU !== 31 && // Exclude FO-01, FO-02
           p.device.positionU !== 45 && p.device.positionU !== 46 && // Exclude PP-03, PP-04
           !connectedPorts.has(p.id) &&
           p.name !== 'Mg1' && p.name !== 'MgA' && p.name !== 'MgB' && !p.name.startsWith('MgPort') &&
           p.name !== 'Console' && p.name !== 'Uplink' &&
           p.type === PortType.COPPER
  );

  // Collect all copper ports on Patch Panels PP-01, PP-02, PP-03, PP-04
  const ppCopperPorts = Object.values(portMap).filter(
    (p) => (p.device.positionU === 28 || p.device.positionU === 29 || p.device.positionU === 45 || p.device.positionU === 46) &&
           !connectedPorts.has(p.id) &&
           p.type === PortType.COPPER
  );

  // Collect all copper ports on Switches (Core 48, Cisco 24, Juniper 24, Access 12)
  const switchCopperPorts = Object.values(portMap).filter(
    (p) => (p.device.positionU === 24 || p.device.positionU === 25 || p.device.positionU === 26 || p.device.positionU === 27) &&
           !connectedPorts.has(p.id) &&
           p.name.startsWith('C') && // copper ports only, not MgPort
           p.type === PortType.COPPER
  );

  console.log(`Connecting ${serverCopperPorts.length} server copper ports to patch panels...`);
  let ppIdx = 0;
  for (const sPort of serverCopperPorts) {
    if (ppIdx < ppCopperPorts.length) {
      await connect(
        `${sPort.device.positionU}_${sPort.name}`,
        `${ppCopperPorts[ppIdx].device.positionU}_${ppCopperPorts[ppIdx].name}`,
        CableType.CAT6,
        '#38bdf8',
        1.5
      );
      ppIdx++;
    }
  }

  console.log(`Connecting remaining patch panel ports to switch copper ports...`);
  let swIdx = 0;
  for (let i = ppIdx; i < ppCopperPorts.length; i++) {
    if (swIdx < switchCopperPorts.length) {
      await connect(
        `${ppCopperPorts[i].device.positionU}_${ppCopperPorts[i].name}`,
        `${switchCopperPorts[swIdx].device.positionU}_${switchCopperPorts[swIdx].name}`,
        CableType.CAT6,
        '#38bdf8',
        2.0
      );
      swIdx++;
    }
  }

  // --- AUTOMATIC MANAGEMENT INTERCONNECTIONS (MGMT Network Mesh) ---
  let mPortIdx = 1;

  const devicesWithMgmt = devicesToCreate.filter(
    (d) =>
      d.positionU !== 24 && // Exclude core 48 itself
      d.ports.some((p) => p.type === PortType.MGMT)
  );

  for (const dev of devicesWithMgmt) {
    const mgmtPorts = dev.ports.filter((p) => p.type === PortType.MGMT);
    for (const mgmtPort of mgmtPorts) {
      if (mPortIdx <= 28) {
        await connect(`${dev.positionU}_${mgmtPort.name}`, `24_MgPort${mPortIdx}`, CableType.CAT6, '#facc15', 2.0);
        mPortIdx++;
      }
    }
  }

  // --- AUTOMATIC POWER OUTLET WIRING ---
  let pduOutletA = 1;
  let pduOutletB = 1;

  const devicesWithPower = devicesToCreate.filter(
    (d) => d.positionU !== 1 && d.positionU !== 2 // Exclude PDUs themselves
  );

  for (const dev of devicesWithPower) {
    const pwrPorts = dev.ports.filter((p) => p.type === PortType.POWER);
    if (pwrPorts.length >= 1 && pduOutletA <= 26) {
      await connect(`${dev.positionU}_${pwrPorts[0].name}`, `1_Out${pduOutletA}`, CableType.POWER, '#ef4444', 1.5);
      pduOutletA++;
    }
    if (pwrPorts.length >= 2 && pduOutletB <= 26) {
      await connect(`${dev.positionU}_${pwrPorts[1].name}`, `2_Out${pduOutletB}`, CableType.POWER, '#10b981', 1.5);
      pduOutletB++;
    }
  }

  // --- COMPACT PAIR-CONNECT FOR REMAINING SWITCH PORTS TO ACHIEVE RACK DENSITY ---
  const remainingSwitchCopper = Object.values(portMap).filter(
    (p) => (p.device.positionU === 24 || p.device.positionU === 25 || p.device.positionU === 26 || p.device.positionU === 27) &&
           !connectedPorts.has(p.id) &&
           p.name.startsWith('C') &&
           p.type === PortType.COPPER
  );

  console.log(`Connecting ${remainingSwitchCopper.length} remaining switch copper ports to achieve high density...`);

  // Connect them together in pairs, but leave exactly 2 free copper ports at the end!
  for (let i = 0; i < remainingSwitchCopper.length - 2; i += 2) {
    if (i + 1 < remainingSwitchCopper.length) {
      await connect(
        `${remainingSwitchCopper[i].device.positionU}_${remainingSwitchCopper[i].name}`,
        `${remainingSwitchCopper[i+1].device.positionU}_${remainingSwitchCopper[i+1].name}`,
        CableType.CAT6,
        '#34d399',
        1.5
      );
    }
  }

  // Count total unconnected ports to verify it matches user intent (< 15 ports)
  const totalUnconnected = Object.values(portMap).filter((p) => !connectedPorts.has(p.id)).length;
  console.log(`Total unconnected ports remaining in database: ${totalUnconnected}`);

  const unconnectedList = Object.values(portMap).filter((p) => !connectedPorts.has(p.id));
  console.log(`Unconnected ports list: ${unconnectedList.map(p => `${p.device.name.split(' ')[0]}_${p.name}`).join(', ')}`);

  console.log('Database seeded with 48U Super Demo DC successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

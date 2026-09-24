import { DevicesRepository } from './devices.repository';
import prisma from '../../config/db';

export class DevicesService {
  private repository = new DevicesRepository();

  async getDevice(id: string) {
    const device = await this.repository.getById(id);
    if (!device) throw new Error(`Device with ID ${id} not found`);
    return device;
  }

  async createDevice(data: {
    rackId: string;
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
    positionU: number;
    heightU: number;
    metadata?: any;
    ports?: any[];
  }) {
    if (!data.rackId) throw new Error('Rack ID is required');
    if (!data.name.trim()) throw new Error('Device name is required');
    if (data.positionU <= 0 || data.heightU <= 0) throw new Error('Position U and Height U must be positive numbers');
    if (data.name.trim().length > 100) throw new Error('Device name must not exceed 100 characters');
    if (data.brand.trim().length > 60) throw new Error('Device brand must not exceed 60 characters');
    if (data.model.trim().length > 60) throw new Error('Device model must not exceed 60 characters');

    if (data.ports && data.ports.length > 0) {
      const portNames = data.ports.map(p => p.name.trim().toLowerCase());
      if (new Set(portNames).size !== portNames.length) {
        throw new Error('No puedes crear puertos con nombres duplicados en el mismo equipo.');
      }
    }

    // 1. Get Rack to validate boundary
    const rack = await prisma.rack.findUnique({ where: { id: data.rackId } });
    if (!rack) throw new Error('Rack not found');

    const startU = data.positionU;
    const endU = data.positionU + data.heightU - 1;

    if (endU > rack.heightU) {
      throw new Error(`Device exceeds rack height limit of ${rack.heightU}U (occupies U ${startU} to U ${endU})`);
    }

    // 2. Check for overlaps with existing devices
    const existingDevices = await prisma.device.findMany({ where: { rackId: data.rackId } });
    for (const dev of existingDevices) {
      const devStart = dev.positionU;
      const devEnd = dev.positionU + dev.heightU - 1;
      
      if (startU <= devEnd && devStart <= endU) {
        throw new Error(`Rack collision: Position overlaps with device "${dev.name}" (occupies U ${devStart} to U ${devEnd})`);
      }
    }

    return this.repository.create(data);
  }

  async updateDevice(id: string, data: {
    name?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    positionU?: number;
    heightU?: number;
    metadata?: any;
    portsSetup?: any;
  }) {
    const existing = await this.getDevice(id);

    const positionU = data.positionU ?? existing.positionU;
    const heightU = data.heightU ?? existing.heightU;

    // Validate boundaries if position or height changes
    if (data.positionU !== undefined || data.heightU !== undefined) {
      const rack = await prisma.rack.findUnique({ where: { id: existing.rackId } });
      if (!rack) throw new Error('Rack not found');

      const startU = positionU;
      const endU = positionU + heightU - 1;

      if (endU > rack.heightU) {
        throw new Error(`Device exceeds rack height limit of ${rack.heightU}U`);
      }

      // Check for overlaps excluding self
      const otherDevices = await prisma.device.findMany({
        where: {
          rackId: existing.rackId,
          id: { not: id },
        },
      });

      for (const dev of otherDevices) {
        const devStart = dev.positionU;
        const devEnd = dev.positionU + dev.heightU - 1;

        if (startU <= devEnd && devStart <= endU) {
          throw new Error(`Rack collision: Position overlaps with device "${dev.name}" (occupies U ${devStart} to U ${devEnd})`);
        }
      }
    }

    // Process ports setup if provided
    if (data.portsSetup) {
      const portsSetup = data.portsSetup;
      
      const syncPorts = async (type: string, prefix: string, targetCount: number, speed: string, direction = 'BIDIRECTIONAL') => {
        const currentPorts = existing.ports.filter(p => p.type === type);
        const currentCount = currentPorts.length;
        
        if (targetCount > currentCount) {
          // Add new ports
          const maxIndex = currentPorts.reduce((max, port) => {
            const num = parseInt(port.name.replace(prefix, '')) || 0;
            return num > max ? num : max;
          }, 0);

          const toAdd = targetCount - currentCount;
          for (let i = 1; i <= toAdd; i++) {
            await prisma.port.create({
              data: {
                deviceId: id,
                name: `${prefix}${maxIndex + i}`,
                type: type as any,
                speed,
                direction,
              }
            });
          }
        } else if (targetCount < currentCount) {
          // Remove excess ports (starting from the highest number)
          // Sort by name (assuming P1, P2... we sort by length then lexicographically)
          const sortedPorts = currentPorts.sort((a, b) => {
            const numA = parseInt(a.name.replace(prefix, '')) || 0;
            const numB = parseInt(b.name.replace(prefix, '')) || 0;
            return numB - numA; // Descending
          });
          
          const toRemove = currentCount - targetCount;
          for (let i = 0; i < toRemove; i++) {
            await prisma.port.delete({ where: { id: sortedPorts[i].id } });
          }
        }
      };

      await syncPorts('COPPER', 'P', portsSetup.copper || 0, '1Gbps');
      await syncPorts('SFP_FIBER', 'SFP', portsSetup.sfp || 0, '10Gbps');
      await syncPorts('GBIC_FIBER', 'GB', portsSetup.gbic || 0, '1Gbps');
      await syncPorts('MGMT', 'Mg', portsSetup.mgmt || 0, '1Gbps');
      await syncPorts('POWER', 'Pwr', portsSetup.power || 0, 'N/A', 'IN');

      // delete portsSetup from data before updating device
      delete data.portsSetup;
    }

    return this.repository.update(id, data);
  }

  async deleteDevice(id: string) {
    await this.getDevice(id);
    return this.repository.delete(id);
  }

  async addPortToDevice(deviceId: string, portData: any) {
    const device = await this.getDevice(deviceId);
    if (!portData.name.trim()) throw new Error('El nombre del puerto es obligatorio');

    const duplicate = device.ports.find(p => p.name.trim().toLowerCase() === portData.name.trim().toLowerCase());
    if (duplicate) {
      throw new Error(`El equipo ya tiene un puerto llamado "${portData.name}".`);
    }

    return this.repository.addPort(deviceId, portData);
  }

  async deletePortFromDevice(portId: string) {
    const port = await prisma.port.findUnique({ where: { id: portId } });
    if (!port) throw new Error('Port not found');
    return this.repository.deletePort(portId);
  }
}

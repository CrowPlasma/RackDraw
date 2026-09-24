import { ConnectionsRepository } from './connections.repository';
import prisma from '../../config/db';
import { CableType } from '@prisma/client';

export class ConnectionsService {
  private repository = new ConnectionsRepository();

  private validateCompatibility(cableType: string, port: { type: string; name: string }) {
    const isCopperPort = port.type === 'COPPER' || port.type === 'MGMT';
    const isFiberPort = port.type === 'SFP_FIBER' || port.type === 'GBIC_FIBER';
    const isPowerPort = port.type === 'POWER';

    const isCopperCable = cableType === 'CAT5E' || cableType === 'CAT6';
    const isFiberCable = cableType === 'SM_FIBER' || cableType === 'MM_FIBER' || cableType === 'DAC';
    const isPowerCable = cableType === 'POWER';

    if (isCopperCable && !isCopperPort) {
      throw new Error(`Incompatibilidad: No puedes conectar un cable de Cobre (${cableType}) en el puerto "${port.name}" (tipo ${port.type}).`);
    }
    if (isFiberCable && !isFiberPort) {
      throw new Error(`Incompatibilidad: No puedes conectar un cable de Fibra (${cableType}) en el puerto "${port.name}" (tipo ${port.type}).`);
    }
    if (isPowerCable && !isPowerPort) {
      throw new Error(`Incompatibilidad: No puedes conectar un cable de Energía en el puerto "${port.name}" (tipo ${port.type}).`);
    }
  }

  async getWireList(rackId: string) {
    if (!rackId) throw new Error('Rack ID is required');
    return this.repository.getByRackId(rackId);
  }

  async createConnection(data: {
    sourcePortId: string;
    destPortId: string;
    cableType: CableType;
    cableColor: string;
    lengthMeters: number;
    labelTag?: string;
  }) {
    const { sourcePortId, destPortId } = data;

    if (sourcePortId === destPortId) {
      throw new Error('Cannot connect a port to itself');
    }

    const sourcePort = await prisma.port.findUnique({ where: { id: sourcePortId } });
    const destPort = await prisma.port.findUnique({ where: { id: destPortId } });

    if (!sourcePort) throw new Error('Source port not found');
    if (!destPort) throw new Error('Destination port not found');

    const sourceOccupied = await prisma.connection.findFirst({
      where: {
        OR: [
          { sourcePortId: sourcePortId },
          { destPortId: sourcePortId }
        ]
      }
    });

    if (sourceOccupied) {
      throw new Error(`Source port "${sourcePort.name}" is already connected to another cable`);
    }

    const destOccupied = await prisma.connection.findFirst({
      where: {
        OR: [
          { sourcePortId: destPortId },
          { destPortId: destPortId }
        ]
      }
    });

    if (destOccupied) {
      throw new Error(`Destination port "${destPort.name}" is already connected to another cable`);
    }

    this.validateCompatibility(data.cableType, sourcePort);
    this.validateCompatibility(data.cableType, destPort);

    // Validate cableColor is a 6-digit hex; fall back to default if invalid
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    const cableColor = hexColorRegex.test(data.cableColor) ? data.cableColor : '#38bdf8';

    // Validate lengthMeters is a positive number
    if (typeof data.lengthMeters !== 'number' || data.lengthMeters <= 0) {
      throw new Error('lengthMeters must be a positive number');
    }

    // Validate labelTag max length
    if (data.labelTag !== undefined && data.labelTag.length > 100) {
      throw new Error('labelTag must not exceed 100 characters');
    }

    return this.repository.create({
      ...data,
      cableColor,
    });
  }

  async updateConnection(id: string, data: {
    sourcePortId?: string;
    destPortId?: string;
    cableType?: CableType;
    cableColor?: string;
    lengthMeters?: number;
    labelTag?: string;
  }) {
    const existing = await this.repository.getById(id);
    if (!existing) throw new Error('Connection not found');

    const sourcePortId = data.sourcePortId ?? existing.sourcePortId;
    const destPortId = data.destPortId ?? existing.destPortId;

    if (sourcePortId === destPortId) {
      throw new Error('Cannot connect a port to itself');
    }

    if (data.sourcePortId && data.sourcePortId !== existing.sourcePortId) {
      const sourcePort = await prisma.port.findUnique({ where: { id: sourcePortId } });
      if (!sourcePort) throw new Error('Source port not found');

      const sourceOccupied = await prisma.connection.findFirst({
        where: {
          id: { not: id },
          OR: [
            { sourcePortId: sourcePortId },
            { destPortId: sourcePortId }
          ]
        }
      });
      if (sourceOccupied) {
        throw new Error(`Source port "${sourcePort.name}" is already connected to another cable`);
      }
    }

    if (data.destPortId && data.destPortId !== existing.destPortId) {
      const destPort = await prisma.port.findUnique({ where: { id: destPortId } });
      if (!destPort) throw new Error('Destination port not found');

      const destOccupied = await prisma.connection.findFirst({
        where: {
          id: { not: id },
          OR: [
            { sourcePortId: destPortId },
            { destPortId: destPortId }
          ]
        }
      });
      if (destOccupied) {
        throw new Error(`Destination port "${destPort.name}" is already connected to another cable`);
      }
    }

    // Physical compatibility check
    const cableType = data.cableType ?? existing.cableType;
    const finalSourcePort = data.sourcePortId ? await prisma.port.findUnique({ where: { id: data.sourcePortId } }) : existing.sourcePort;
    const finalDestPort = data.destPortId ? await prisma.port.findUnique({ where: { id: data.destPortId } }) : existing.destPort;
    
    if (finalSourcePort) this.validateCompatibility(cableType, finalSourcePort);
    if (finalDestPort) this.validateCompatibility(cableType, finalDestPort);

    // Validate inputs if provided
    if (data.lengthMeters !== undefined) {
      if (typeof data.lengthMeters !== 'number' || data.lengthMeters <= 0) {
        throw new Error('lengthMeters must be a positive number');
      }
    }

    if (data.cableColor !== undefined) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(data.cableColor)) {
        data.cableColor = '#38bdf8';
      }
    }

    if (data.labelTag !== undefined && data.labelTag.length > 100) {
      throw new Error('labelTag must not exceed 100 characters');
    }

    return this.repository.update(id, data);
  }

  async deleteConnection(id: string) {
    const conn = await this.repository.getById(id);
    if (!conn) throw new Error('Connection not found');
    return this.repository.delete(id);
  }
}

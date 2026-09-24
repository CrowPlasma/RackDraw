import prisma from '../../config/db';
import { PortType } from '@prisma/client';

export class DevicesRepository {
  async getById(id: string) {
    return prisma.device.findUnique({
      where: { id },
      include: { ports: true },
    });
  }

  async create(data: {
    rackId: string;
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
    positionU: number;
    heightU: number;
    metadata?: any;
    ports?: Array<{ name: string; type: PortType; speed: string; direction?: string }>;
  }) {
    const { ports, ...deviceData } = data;
    
    return prisma.device.create({
      data: {
        ...deviceData,
        ports: ports
          ? {
              create: ports.map((p) => ({
                name: p.name,
                type: p.type,
                speed: p.speed,
                direction: p.direction || 'BIDIRECTIONAL',
              })),
            }
          : undefined,
      },
      include: { ports: true },
    });
  }

  async update(id: string, data: {
    name?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    positionU?: number;
    heightU?: number;
    metadata?: any;
  }) {
    return prisma.device.update({
      where: { id },
      data,
      include: { ports: true },
    });
  }

  async delete(id: string) {
    return prisma.device.delete({
      where: { id },
    });
  }

  async addPort(deviceId: string, data: { name: string; type: PortType; speed: string; direction?: string }) {
    return prisma.port.create({
      data: {
        deviceId,
        name: data.name,
        type: data.type,
        speed: data.speed,
        direction: data.direction || 'BIDIRECTIONAL',
      },
    });
  }

  async deletePort(portId: string) {
    return prisma.port.delete({
      where: { id: portId },
    });
  }
}

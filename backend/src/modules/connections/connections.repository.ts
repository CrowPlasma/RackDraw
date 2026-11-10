import prisma from '../../config/db';
import { CableType } from '@prisma/client';

export class ConnectionsRepository {
  async getById(id: string) {
    return prisma.connection.findUnique({
      where: { id },
      include: {
        sourcePort: { include: { device: true } },
        destPort: { include: { device: true } },
      },
    });
  }

  async getByRackId(rackId: string) {
    return prisma.connection.findMany({
      where: {
        OR: [
          { sourcePort: { device: { rackId } } },
          { destPort: { device: { rackId } } },
        ],
      },
      include: {
        sourcePort: {
          include: {
            device: {
              include: { rack: true },
            },
          },
        },
        destPort: {
          include: {
            device: {
              include: { rack: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByProjectId(projectId: string) {
    return prisma.connection.findMany({
      where: {
        OR: [
          { sourcePort: { device: { rack: { projectId } } } },
          { destPort: { device: { rack: { projectId } } } },
        ],
      },
      include: {
        sourcePort: {
          include: {
            device: {
              include: { rack: true },
            },
          },
        },
        destPort: {
          include: {
            device: {
              include: { rack: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    sourcePortId: string;
    destPortId: string;
    cableType: CableType;
    cableColor: string;
    lengthMeters: number;
    labelTag?: string;
  }) {
    return prisma.connection.create({
      data,
      include: {
        sourcePort: { include: { device: true } },
        destPort: { include: { device: true } },
      },
    });
  }

  async update(id: string, data: {
    sourcePortId?: string;
    destPortId?: string;
    cableType?: CableType;
    cableColor?: string;
    lengthMeters?: number;
    labelTag?: string;
  }) {
    return prisma.connection.update({
      where: { id },
      data,
      include: {
        sourcePort: { include: { device: true } },
        destPort: { include: { device: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.connection.delete({
      where: { id },
    });
  }
}

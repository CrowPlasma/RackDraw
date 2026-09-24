import prisma from '../../config/db';

export class RacksRepository {
  async getByProjectId(projectId: string) {
    return prisma.rack.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.rack.findUnique({
      where: { id },
      include: {
        devices: {
          include: {
            ports: {
              include: {
                connectedSource: {
                  include: {
                    destPort: {
                      include: {
                        device: true,
                      },
                    },
                  },
                },
                connectedDest: {
                  include: {
                    sourcePort: {
                      include: {
                        device: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { positionU: 'desc' }, // Order from top of the rack to bottom
        },
      },
    });
  }

  async create(data: { projectId: string; name: string; heightU: number }) {
    return prisma.rack.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; heightU?: number }) {
    return prisma.rack.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.rack.delete({
      where: { id },
    });
  }
}

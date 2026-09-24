import prisma from '../../config/db';

export class ProjectsRepository {
  async getAll() {
    return prisma.project.findMany({
      include: {
        racks: {
          select: {
            id: true,
            name: true,
            heightU: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { racks: true },
    });
  }

  async create(data: { name: string; description?: string }) {
    return prisma.project.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }
}

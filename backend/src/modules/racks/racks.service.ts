import { RacksRepository } from './racks.repository';

export class RacksService {
  private repository = new RacksRepository();

  async getRacksByProject(projectId: string) {
    return this.repository.getByProjectId(projectId);
  }

  async getRackDetails(id: string) {
    const rack = await this.repository.getById(id);
    if (!rack) throw new Error(`Rack with ID ${id} not found`);
    return rack;
  }

  async createRack(data: { projectId: string; name: string; heightU: number }) {
    if (!data.projectId) throw new Error('Project ID is required');
    if (!data.name.trim()) throw new Error('Rack name is required');
    if (data.heightU <= 0 || data.heightU > 60) throw new Error('Rack U height must be between 1 and 60U');
    return this.repository.create(data);
  }

  async updateRack(id: string, data: { name?: string; heightU?: number }) {
    if (data.heightU !== undefined) {
      if (data.heightU <= 0 || data.heightU > 60) {
        throw new Error('Rack U height must be between 1 and 60U');
      }

      // Check if shrinking the rack cuts off any existing devices
      const rack = await this.repository.getById(id);
      if (rack && rack.devices && rack.devices.length > 0) {
        const highestOccupiedU = rack.devices.reduce((max, dev) => {
          const endU = dev.positionU + dev.heightU - 1;
          return endU > max ? endU : max;
        }, 0);

        if (data.heightU < highestOccupiedU) {
          const culprit = rack.devices.find(d => d.positionU + d.heightU - 1 === highestOccupiedU);
          throw new Error(`No se puede reducir a ${data.heightU}U porque el equipo "${culprit?.name}" ocupa hasta la unidad ${highestOccupiedU}U.`);
        }
      }
    }
    return this.repository.update(id, data);
  }

  async deleteRack(id: string) {
    return this.repository.delete(id);
  }
}

import { ProjectsRepository } from './projects.repository';

export class ProjectsService {
  private repository = new ProjectsRepository();

  async getProjects() {
    return this.repository.getAll();
  }

  async getProject(id: string) {
    const project = await this.repository.getById(id);
    if (!project) throw new Error(`Project with ID ${id} not found`);
    return project;
  }

  async createProject(data: { name: string; description?: string }) {
    if (!data.name.trim()) throw new Error('Project name cannot be empty');
    return this.repository.create(data);
  }

  async updateProject(id: string, data: { name?: string; description?: string }) {
    await this.getProject(id); // Throws if not found
    return this.repository.update(id, data);
  }

  async deleteProject(id: string) {
    await this.getProject(id); // Throws if not found
    return this.repository.delete(id);
  }
}

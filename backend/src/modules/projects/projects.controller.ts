import { Router, Request, Response } from 'express';
import { ProjectsService } from './projects.service';

const router = Router();
const service = new ProjectsService();

router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await service.getProjects();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await service.getProject(req.params.id);
    res.json(project);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const project = await service.createProject(req.body);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const project = await service.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

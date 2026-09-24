import { Router, Request, Response } from 'express';
import { RacksService } from './racks.service';

const router = Router();
const service = new RacksService();

router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const racks = await service.getRacksByProject(req.params.projectId);
    res.json(racks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rack = await service.getRackDetails(req.params.id);
    res.json(rack);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const rack = await service.createRack(req.body);
    res.status(201).json(rack);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const rack = await service.updateRack(req.params.id, req.body);
    res.json(rack);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.deleteRack(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { ConnectionsService } from './connections.service';

const router = Router();
const service = new ConnectionsService();

router.get('/rack/:rackId', async (req: Request, res: Response) => {
  try {
    const wirelist = await service.getWireList(req.params.rackId);
    res.json(wirelist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const wirelist = await service.getProjectWireList(req.params.projectId);
    res.json(wirelist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const connection = await service.createConnection(req.body);
    res.status(201).json(connection);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const connection = await service.updateConnection(req.params.id, req.body);
    res.json(connection);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.deleteConnection(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

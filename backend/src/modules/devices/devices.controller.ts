import { Router, Request, Response } from 'express';
import { DevicesService } from './devices.service';

const router = Router();
const service = new DevicesService();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const device = await service.getDevice(req.params.id);
    res.json(device);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const device = await service.createDevice(req.body);
    res.status(201).json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const device = await service.updateDevice(req.params.id, req.body);
    res.json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.deleteDevice(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Port Management Routes
router.post('/:deviceId/ports', async (req: Request, res: Response) => {
  try {
    const port = await service.addPortToDevice(req.params.deviceId, req.body);
    res.status(201).json(port);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/ports/:portId', async (req: Request, res: Response) => {
  try {
    await service.deletePortFromDevice(req.params.portId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

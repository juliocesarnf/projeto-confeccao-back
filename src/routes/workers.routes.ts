import { Router } from 'express';
import { WorkerController } from '../modules/workers/worker.controller.js';

const WorkersRouter = Router();
const controller = new WorkerController();

WorkersRouter.get('/', controller.getWorkers.bind(controller));

export default WorkersRouter;

import { Router } from 'express';
import OrderRouter from './orders.routes.js';
import MaterialRouter from './materials.routes.js';
import ProductRouter from './products.routes.js';
import EmployeesRouter from './workers.routes.js';
import ProductionRouter from './production.routes.js';

const routes = Router();

routes.use('/pedidos', OrderRouter);
routes.use('/materiais', MaterialRouter);
routes.use('/produtos', ProductRouter);
routes.use('/funcionarios', EmployeesRouter);
routes.use('/producao', ProductionRouter);

export default routes;

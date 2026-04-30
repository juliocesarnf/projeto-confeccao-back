import { Router } from 'express';
import OrderRouter from './orders.routes.js';
import MaterialRouter from './materials.routes.js';
import ProductRouter from './products.routes.js';
import EmployeesRouter from './employees.routes.js';

const routes = Router();

routes.use('/pedidos', OrderRouter);
routes.use('/materiais', MaterialRouter);
routes.use('/produtos', ProductRouter);
routes.use('/funcionarios', EmployeesRouter);

export default routes;

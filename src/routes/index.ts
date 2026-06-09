import { Router } from 'express';
import OrderRouter from './orders.routes.js';
import MaterialRouter from './materials.routes.js';
import ProductRouter from './products.routes.js';
import EmployeesRouter from './workers.routes.js';
import ProductionRouter from './production.routes.js';
import ReportRouter from './reports.routes.js';
import CustomerRouter from './customers.routes.js';

const routes = Router();

routes.use('/clientes', CustomerRouter);
routes.use('/pedidos', OrderRouter);
routes.use('/materiais', MaterialRouter);
routes.use('/produtos', ProductRouter);
routes.use('/funcionarios', EmployeesRouter);
routes.use('/producao', ProductionRouter);
routes.use('/reports', ReportRouter);

export default routes;

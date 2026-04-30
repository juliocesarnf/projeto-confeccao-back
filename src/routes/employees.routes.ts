import { Router } from 'express';
import { EmployeesController } from '../modules/employees/employees.controller.js';

const EmployeesRouter = Router();
const controller = new EmployeesController();

EmployeesRouter.get('/', controller.getEmployees.bind(controller));

export default EmployeesRouter;

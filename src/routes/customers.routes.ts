import { Router } from 'express';
import { CustomerController } from '../modules/customers/customer.controller.js';

const CustomerRouter = Router();
const controller = new CustomerController();

CustomerRouter.get('/', controller.getAllCustomers.bind(controller));

export default CustomerRouter;

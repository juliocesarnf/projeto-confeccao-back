import { Router } from 'express';
import { OrderController } from '../modules/orders/order.controller.js';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.get('/', controller.get.bind(controller));

OrderRouter.get('/:id', controller.get.bind(controller));

OrderRouter.get('/:id/items', controller.getItems.bind(controller));

OrderRouter.patch('/:id/confirmar', controller.confirmOrder.bind(controller));

export default OrderRouter;
import { Router } from 'express';
import { OrderController } from '../modules/orders/order.controller.js';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post('/', controller.createOrder.bind(controller));

OrderRouter.get('/', controller.getOrders.bind(controller));

OrderRouter.get('/:id', controller.getOrders.bind(controller));

OrderRouter.get('/:id/items', controller.getItemsByOrderId.bind(controller));

OrderRouter.patch('/:id/confirmar', controller.confirmOrder.bind(controller));

OrderRouter.patch('/:id/entregar', controller.deliverOrder.bind(controller));

export default OrderRouter;
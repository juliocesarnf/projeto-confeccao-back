import { Router } from 'express';
import { ProductionController } from '../modules/productions/production.controller.js';

const ProductionRouter = Router();
const controller = new ProductionController();

ProductionRouter.get('/', controller.getProductions.bind(controller));

ProductionRouter.post('/iniciar', controller.addProduction.bind(controller));
ProductionRouter.get('/search/:id', controller.getProductionByOrderId.bind(controller));

ProductionRouter.patch('/batch/:batchId/status', controller.updateBatchStatus.bind(controller));
ProductionRouter.patch('/:orderId/items/fulfill', controller.fulfillItem.bind(controller));

export default ProductionRouter;
import { Router } from 'express';
import { ProductController } from '../modules/products/product.controller.js';

const ProductRouter = Router();
const controller = new ProductController();

ProductRouter.get('/', controller.getAllProducts.bind(controller));
ProductRouter.post('/', controller.createProduct.bind(controller));



ProductRouter.get('/variacao', controller.getProductVariations.bind(controller));
ProductRouter.put('/variacoes/:id', controller.updateVariation.bind(controller));

ProductRouter.get('/variacao/:id/materiais', controller.getMaterialsForProductVariationId.bind(controller));

ProductRouter.get('/:id/variacoes', controller.getVariationsByProductId.bind(controller));
ProductRouter.get('/:id', controller.getProductVariations.bind(controller));
//ProductRouter.get('/:id/items', controller.getItems.bind(controller));

ProductRouter.post('/variacoes/materiais/search', controller.getMaterialsByVariationIds.bind(controller));
ProductRouter.post('/processos/search', controller.getProcessesByProductIdList.bind(controller));

export default ProductRouter;
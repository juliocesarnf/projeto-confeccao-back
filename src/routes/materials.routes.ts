import { Router } from 'express';
import { MaterialController } from '../modules/materials/material.controller.js';

const MaterialRouter = Router();
const controller = new MaterialController();

MaterialRouter.get('/', controller.getAllMaterials.bind(controller));
MaterialRouter.post('/', controller.createMaterial.bind(controller));
MaterialRouter.get('/variacoes', controller.getVariations.bind(controller));
MaterialRouter.get('/:id/variacoes', controller.getVariationsByMaterialId.bind(controller));
MaterialRouter.put('/variacoes/:id', controller.updateVariation.bind(controller));
MaterialRouter.post('/fornecedores', controller.getRequiredMaterialsSuppliers.bind(controller));
MaterialRouter.post('/variacoes/remover-estoque', controller.removeStockVariations.bind(controller));
MaterialRouter.post('/compra', controller.purchaseMaterials.bind(controller));
MaterialRouter.patch('/variacoes/:id/adicionar-pacote', controller.addStockPack.bind(controller));
MaterialRouter.patch('/variacoes/:id/remover-pacote', controller.removeStockPack.bind(controller));

export default MaterialRouter;

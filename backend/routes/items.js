import express from 'express';
import * as ItemController from '../controllers/ItemController.js';

const router = express.Router();

router.get('/', ItemController.getAllItems);
router.post('/', ItemController.createItem);
router.put('/:id', ItemController.updateItem);
router.delete('/:id', ItemController.deleteItem);

export default router;
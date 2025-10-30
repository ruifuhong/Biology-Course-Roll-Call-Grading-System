import * as ItemModel from '../models/ItemModel.js';

export async function getAllItems(req, res) {
  try {
    const items = await ItemModel.findAllItems();
    res.json(items);
  } catch (error) {
    console.error('ItemController getAllItems error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createItem(req, res) {
  try {
    const { name } = req.body;
    console.log('Creating item:', name);
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const newItem = await ItemModel.createItem({ name });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('ItemController createItem error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const updatedItem = await ItemModel.updateItemById(id, { name });
    
    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error('ItemController updateItem error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    
    const deletedItem = await ItemModel.deleteItemById(id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted', item: deletedItem });
  } catch (error) {
    console.error('ItemController deleteItem error:', error);
    res.status(500).json({ error: error.message });
  }
}
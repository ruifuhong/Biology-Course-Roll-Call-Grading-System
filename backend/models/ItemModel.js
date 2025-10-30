import { pool } from './database.js';

export async function findAllItems() {
  try {
    const result = await pool.query('SELECT * FROM items');
    return result.rows;
  } catch (error) {
    console.error('ItemModel findAll error:', error);
    throw error;
  }
}

export async function createItem(itemData) {
  try {
    const { name } = itemData;
    
    if (!name) {
      throw new Error('Name is required');
    }
    
    const result = await pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *', 
      [name]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('ItemModel create error:', error);
    throw error;
  }
}

export async function updateItemById(id, itemData) {
  try {
    const { name } = itemData;
    
    if (!name) {
      throw new Error('Name is required');
    }
    
    const result = await pool.query(
      'UPDATE items SET name = $1 WHERE id = $2 RETURNING *', 
      [name, id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('ItemModel updateById error:', error);
    throw error;
  }
}

export async function deleteItemById(id) {
  try {
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *', 
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('ItemModel deleteById error:', error);
    throw error;
  }
}


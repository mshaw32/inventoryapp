import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { Request, Response } from 'express';

const router = express.Router();

// Get all sales
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT s.*, c.name as customer_name, 
             si.item_id, si.quantity, si.sale_price, si.profit_amount,
             i.name as item_name, i.upc
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      JOIN sale_items si ON s.id = si.sale_id
      JOIN items i ON si.item_id = i.id
      ORDER BY s.sale_date DESC
    `);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Create new sale
router.post('/', [
  body('customer_id').optional().isUUID().withMessage('Valid customer ID is required'),
  body('sale_date').isISO8601().withMessage('Valid sale date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.item_id').isUUID().withMessage('Valid item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.sale_price').isFloat({ min: 0 }).withMessage('Sale price must be non-negative')
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { customer_id, sale_date, items } = req.body;
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Create sale record
      const saleResult = await query(
        'INSERT INTO sales (customer_id, sale_date) VALUES ($1, $2) RETURNING *',
        [customer_id, sale_date]
      );
      
      const saleId = saleResult.rows[0].id;
      
      // Create sale items and update inventory
      for (const item of items) {
        await query(
          'INSERT INTO sale_items (sale_id, item_id, quantity, sale_price) VALUES ($1, $2, $3, $4)',
          [saleId, item.item_id, item.quantity, item.sale_price]
        );
        
        // Update item quantity
        await query(
          'UPDATE items SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.item_id]
        );
      }
      
      await query('COMMIT');
      return res.status(201).json(saleResult.rows[0]);
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating sale:', error);
    return res.status(500).json({ error: 'Failed to create sale' });
  }
});

export default router;

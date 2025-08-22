import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { Request, Response } from 'express';

const router = express.Router();

// Get all transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT t.*, i.name as item_name, i.upc, i.sku
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      ORDER BY t.created_at DESC
    `);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create new transaction
router.post('/', [
  body('item_id').isUUID().withMessage('Valid item ID is required'),
  body('type').isIn(['in', 'out']).withMessage('Transaction type must be "in" or "out"'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('notes').optional().trim()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { item_id, type, quantity, notes } = req.body;
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Create transaction record
      const transactionResult = await query(
        'INSERT INTO transactions (item_id, type, quantity, notes) VALUES ($1, $2, $3, $4) RETURNING *',
        [item_id, type, quantity, notes]
      );
      
      // Update item quantity
      const quantityChange = type === 'in' ? quantity : -quantity;
      await query(
        'UPDATE items SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2',
        [quantityChange, item_id]
      );
      
      await query('COMMIT');
      return res.status(201).json(transactionResult.rows[0]);
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router;

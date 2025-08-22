import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { Request, Response } from 'express';

const router = express.Router();

// Get all suppliers
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM suppliers ORDER BY name');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Create new supplier
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Supplier name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address').optional().trim()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, address } = req.body;
    const result = await query(
      'INSERT INTO suppliers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Update supplier
router.put('/:id', [
  body('name').trim().isLength({ min: 1 }).withMessage('Supplier name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address').optional().trim()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    const result = await query(
      'UPDATE suppliers SET name = $1, email = $2, phone = $3, address = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, email, phone, address, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({ error: 'Failed to update supplier' });
  }
});

export default router;

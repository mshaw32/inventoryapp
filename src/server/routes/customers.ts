import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { Request, Response } from 'express';

const router = express.Router();

// Get all customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM customers ORDER BY name');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create new customer
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Customer name is required'),
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
      'INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

export default router;

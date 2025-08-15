import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { query as dbQuery, executeTransaction } from '../config/database';
import { Request, Response } from 'express';

const router = express.Router();

// Get all inventory items with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('category').optional().isUUID().withMessage('Category must be a valid UUID'),
  query('stockStatus').optional().isIn(['low', 'normal', 'overstocked']).withMessage('Invalid stock status'),
  query('sortBy').optional().isIn(['name', 'cost', 'sale_price', 'profit_margin', 'quantity_in_stock', 'created_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      stockStatus = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build WHERE clause
    let whereClause = 'WHERE i.is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (i.name ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex} OR i.upc ILIKE $${paramIndex} OR i.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND i.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (stockStatus) {
      switch (stockStatus) {
        case 'low':
          whereClause += ` AND i.quantity_in_stock <= i.min_stock_level`;
          break;
        case 'overstocked':
          whereClause += ` AND i.quantity_in_stock >= COALESCE(i.max_stock_level, 999999)`;
          break;
        case 'normal':
          whereClause += ` AND i.quantity_in_stock > i.min_stock_level AND (i.max_stock_level IS NULL OR i.quantity_in_stock < i.max_stock_level)`;
          break;
      }
    }

    // Build ORDER BY clause
    const orderByClause = `ORDER BY i.${sortBy} ${sortOrder.toUpperCase()}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ${whereClause}
    `;
    
    const countResult = await dbQuery(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get items
    const itemsQuery = `
      SELECT 
        i.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(Number(limit), offset);
    const itemsResult = await dbQuery(itemsQuery, params);

    // Calculate pagination info
    const totalPages = Math.ceil(total / Number(limit));
    const hasNextPage = Number(page) < totalPages;
    const hasPrevPage = Number(page) > 1;

    res.json({
      items: itemsResult.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single inventory item by ID
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid item ID')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = $1 AND i.is_active = true
    `;

    const result = await dbQuery(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create new inventory item
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
  body('description').optional().isString(),
  body('upc').optional().isString().isLength({ max: 50 }),
  body('sku').optional().isString().isLength({ max: 100 }),
  body('category_id').optional().isUUID().withMessage('Invalid category ID'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('sale_price').isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('quantity_in_stock').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('min_stock_level').optional().isInt({ min: 0 }).withMessage('Min stock level must be a non-negative integer'),
  body('max_stock_level').optional().isInt({ min: 1 }).withMessage('Max stock level must be a positive integer'),
  body('location').optional().isString().isLength({ max: 100 }),
  body('condition_notes').optional().isString(),
  body('tags').optional().isArray(),
  body('image_url').optional().isURL().withMessage('Invalid image URL')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      upc,
      sku,
      category_id,
      cost,
      sale_price,
      quantity_in_stock,
      min_stock_level,
      max_stock_level,
      location,
      condition_notes,
      tags,
      image_url
    } = req.body;

    // Check if UPC or SKU already exists
    if (upc || sku) {
      const existingQuery = `
        SELECT id FROM items 
        WHERE (upc = $1 OR sku = $2) AND is_active = true
      `;
      const existingResult = await dbQuery(existingQuery, [upc || null, sku || null]);
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'Item with this UPC or SKU already exists' });
      }
    }

    const insertQuery = `
      INSERT INTO items (
        name, description, upc, sku, category_id, cost, sale_price,
        quantity_in_stock, min_stock_level, max_stock_level, location,
        condition_notes, tags, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await dbQuery(insertQuery, [
      name, description, upc, sku, category_id, cost, sale_price,
      quantity_in_stock, min_stock_level, max_stock_level, location,
      condition_notes, tags, image_url
    ]);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('inventory').emit('inventory-updated', {
        type: 'item-created',
        item: result.rows[0]
      });
    }

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update inventory item
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid item ID'),
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString(),
  body('upc').optional().isString().isLength({ max: 50 }),
  body('sku').optional().isString().isLength({ max: 100 }),
  body('category_id').optional().isUUID().withMessage('Invalid category ID'),
  body('cost').optional().isFloat({ min: 0 }),
  body('sale_price').optional().isFloat({ min: 0 }),
  body('quantity_in_stock').optional().isInt({ min: 0 }),
  body('min_stock_level').optional().isInt({ min: 0 }),
  body('max_stock_level').optional().isInt({ min: 1 }),
  body('location').optional().isString().isLength({ max: 100 }),
  body('condition_notes').optional().isString(),
  body('tags').optional().isArray(),
  body('image_url').optional().isURL()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if item exists
    const existingQuery = 'SELECT * FROM items WHERE id = $1 AND is_active = true';
    const existingResult = await dbQuery(existingQuery, [id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if UPC or SKU already exists (excluding current item)
    if (updateData.upc || updateData.sku) {
      const duplicateQuery = `
        SELECT id FROM items 
        WHERE (upc = $1 OR sku = $2) AND id != $3 AND is_active = true
      `;
      const duplicateResult = await dbQuery(duplicateQuery, [
        updateData.upc || null, 
        updateData.sku || null, 
        id
      ]);
      
      if (duplicateResult.rows.length > 0) {
        return res.status(400).json({ error: 'Item with this UPC or SKU already exists' });
      }
    }

    // Build dynamic update query
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    setClause.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    values.push(id);

    const updateQuery = `
      UPDATE items 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await dbQuery(updateQuery, values);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('inventory').emit('inventory-updated', {
        type: 'item-updated',
        item: result.rows[0]
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete inventory item (soft delete)
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid item ID')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const deleteQuery = `
      UPDATE items 
      SET is_active = false, updated_at = $1
      WHERE id = $2 AND is_active = true
      RETURNING id
    `;

    const result = await dbQuery(deleteQuery, [new Date(), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('inventory').emit('inventory-updated', {
        type: 'item-deleted',
        itemId: id
      });
    }

    res.json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Bulk update inventory quantities
router.post('/bulk-update', [
  body('updates').isArray({ min: 1 }).withMessage('Updates must be a non-empty array'),
  body('updates.*.id').isUUID().withMessage('Each update must have a valid item ID'),
  body('updates.*.quantity_change').isInt().withMessage('Each update must have a valid quantity change'),
  body('updates.*.notes').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { updates } = req.body;

    // Execute bulk update in transaction
    const queries = updates.map((update: any) => ({
      text: `
        UPDATE items 
        SET quantity_in_stock = quantity_in_stock + $1, updated_at = $2
        WHERE id = $3 AND is_active = true
      `,
      params: [update.quantity_change, new Date(), update.id]
    }));

    const results = await executeTransaction(queries);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('inventory').emit('inventory-updated', {
        type: 'bulk-update',
        updates: updates.map((update: any, index: number) => ({
          ...update,
          newQuantity: results[index].rows[0]?.quantity_in_stock
        }))
      });
    }

    res.json({ message: 'Bulk update completed successfully', results });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
});

// Search items by UPC
router.get('/search/upc/:upc', [
  param('upc').isString().isLength({ min: 1, max: 50 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { upc } = req.params;

    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.upc = $1 AND i.is_active = true
    `;

    const result = await dbQuery(query, [upc]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error searching by UPC:', error);
    res.status(500).json({ error: 'Failed to search by UPC' });
  }
});

// Get low stock items
router.get('/alerts/low-stock', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.quantity_in_stock <= i.min_stock_level 
        AND i.is_active = true
      ORDER BY i.quantity_in_stock ASC
    `;

    const result = await dbQuery(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Get overstocked items
router.get('/alerts/overstocked', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.color as category_color
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.max_stock_level IS NOT NULL 
        AND i.quantity_in_stock >= i.max_stock_level 
        AND i.is_active = true
      ORDER BY i.quantity_in_stock DESC
    `;

    const result = await dbQuery(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching overstocked items:', error);
    res.status(500).json({ error: 'Failed to fetch overstocked items' });
  }
});

export default router;
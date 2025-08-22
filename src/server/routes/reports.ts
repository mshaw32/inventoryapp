import express from 'express';
import { query, param, body, validationResult } from 'express-validator';
import { query as dbQuery } from '../config/database';
import { Request, Response } from 'express';

const router = express.Router();

// Get dashboard summary statistics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Get total inventory value
    const inventoryValueQuery = `
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity_in_stock) as total_quantity,
        SUM(cost * quantity_in_stock) as total_cost_value,
        SUM(sale_price * quantity_in_stock) as total_sale_value,
        SUM((sale_price - cost) * quantity_in_stock) as total_potential_profit
      FROM items 
      WHERE is_active = true
    `;

    // Get low stock alerts
    const lowStockQuery = `
      SELECT COUNT(*) as low_stock_count
      FROM items 
      WHERE quantity_in_stock <= min_stock_level AND is_active = true
    `;

    // Get recent sales
    const recentSalesQuery = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(total_amount) as total_revenue,
        SUM(total_amount - COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)) as net_revenue
      FROM sales 
      WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
        AND status = 'completed'
    `;

    // Get top selling categories
    const topCategoriesQuery = `
      SELECT 
        c.name as category_name,
        c.color as category_color,
        COUNT(si.id) as sales_count,
        SUM(si.total_price) as total_revenue
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id
      LEFT JOIN sale_items si ON i.id = si.item_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed' 
        AND s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY c.id, c.name, c.color
      ORDER BY total_revenue DESC
      LIMIT 5
    `;

    // Execute all queries
    const [inventoryValue, lowStock, recentSales, topCategories] = await Promise.all([
      dbQuery(inventoryValueQuery),
      dbQuery(lowStockQuery),
      dbQuery(recentSalesQuery),
      dbQuery(topCategoriesQuery)
    ]);

    const summary = {
      inventory: inventoryValue.rows[0],
      alerts: {
        lowStock: parseInt(lowStock.rows[0].low_stock_count)
      },
      sales: recentSales.rows[0],
      topCategories: topCategories.rows
    };

    res.json(summary);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get inventory summary report
router.get('/inventory-summary', [
  query('category').optional().isUUID().withMessage('Invalid category ID'),
  query('stockStatus').optional().isIn(['low', 'normal', 'overstocked']).withMessage('Invalid stock status'),
  query('sortBy').optional().isIn(['name', 'cost', 'sale_price', 'profit_margin', 'quantity_in_stock']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, stockStatus, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let whereClause = 'WHERE i.is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

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
          whereClause += ` AND i.max_stock_level IS NOT NULL AND i.quantity_in_stock >= i.max_stock_level`;
          break;
        case 'normal':
          whereClause += ` AND i.quantity_in_stock > i.min_stock_level AND (i.max_stock_level IS NULL OR i.quantity_in_stock < i.max_stock_level)`;
          break;
      }
    }

    const query = `
      SELECT * FROM inventory_summary
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
    `;

    const result = await dbQuery(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});

// Get top selling items report
router.get('/top-selling', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
  query('category').optional().isUUID().withMessage('Invalid category ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '30d', category, limit = 20 } = req.query;

    let dateFilter = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (period !== 'all') {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[period as string];
      
      dateFilter = `AND s.sale_date >= CURRENT_DATE - INTERVAL '${days} days'`;
    }

    if (category) {
      dateFilter += ` AND i.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    const query = `
      SELECT 
        i.id,
        i.name,
        i.upc,
        c.name as category_name,
        c.color as category_color,
        COUNT(si.id) as total_sales,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.total_price) as total_revenue,
        AVG(si.profit_amount) as avg_profit_per_item,
        SUM(si.profit_amount) as total_profit
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN sale_items si ON i.id = si.item_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed' ${dateFilter}
      GROUP BY i.id, i.name, i.upc, c.name, c.color
      ORDER BY total_revenue DESC
      LIMIT $${paramIndex}
    `;

    params.push(Number(limit));
    const result = await dbQuery(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching top selling items:', error);
    res.status(500).json({ error: 'Failed to fetch top selling items' });
  }
});

// Get profit analysis report
router.get('/profit-analysis', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'category']).withMessage('Invalid group by option')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '30d', groupBy = 'month' } = req.query;

    let dateFilter = '';
    if (period !== 'all') {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[period as string];
      
      dateFilter = `WHERE s.sale_date >= CURRENT_DATE - INTERVAL '${days} days'`;
    }

    let groupByClause = '';
    let selectClause = '';

    switch (groupBy) {
      case 'day':
        groupByClause = 'GROUP BY DATE(s.sale_date)';
        selectClause = 'DATE(s.sale_date) as period';
        break;
      case 'week':
        groupByClause = 'GROUP BY DATE_TRUNC(\'week\', s.sale_date)';
        selectClause = 'DATE_TRUNC(\'week\', s.sale_date) as period';
        break;
      case 'month':
        groupByClause = 'GROUP BY DATE_TRUNC(\'month\', s.sale_date)';
        selectClause = 'DATE_TRUNC(\'month\', s.sale_date) as period';
        break;
      case 'category':
        groupByClause = 'GROUP BY c.name, c.color';
        selectClause = 'c.name as period, c.color as period_color';
        break;
    }

    const query = `
      SELECT 
        ${selectClause},
        COUNT(DISTINCT s.id) as total_sales,
        SUM(si.total_price) as total_revenue,
        SUM(si.total_price - (si.cost_at_sale * si.quantity)) as total_profit,
        AVG(si.total_price - (si.cost_at_sale * si.quantity)) as avg_profit_per_sale,
        COUNT(si.id) as total_items_sold
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN items i ON si.item_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      ${dateFilter}
      AND s.status = 'completed'
      ${groupByClause}
      ORDER BY total_profit DESC
    `;

    const result = await dbQuery(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching profit analysis:', error);
    res.status(500).json({ error: 'Failed to fetch profit analysis' });
  }
});

// Get low stock report
router.get('/low-stock', [
  query('threshold').optional().isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { threshold } = req.query;

    let whereClause = 'WHERE i.is_active = true';
    const params: any[] = [];

    if (threshold) {
      whereClause += ` AND i.quantity_in_stock <= $1`;
      params.push(Number(threshold));
    } else {
      whereClause += ` AND i.quantity_in_stock <= i.min_stock_level`;
    }

    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.color as category_color,
        CASE 
          WHEN i.quantity_in_stock = 0 THEN 'Out of Stock'
          WHEN i.quantity_in_stock <= i.min_stock_level THEN 'Low Stock'
          ELSE 'Below Threshold'
        END as stock_status
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ${whereClause}
      ORDER BY i.quantity_in_stock ASC, i.name ASC
    `;

    const result = await dbQuery(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching low stock report:', error);
    res.status(500).json({ error: 'Failed to fetch low stock report' });
  }
});

// Get overstocked items report
router.get('/overstocked', [
  query('threshold').optional().isInt({ min: 1 }).withMessage('Threshold must be a positive integer')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { threshold } = req.query;

    let whereClause = 'WHERE i.is_active = true';
    const params: any[] = [];

    if (threshold) {
      whereClause += ` AND i.quantity_in_stock >= $1`;
      params.push(Number(threshold));
    } else {
      whereClause += ` AND i.max_stock_level IS NOT NULL AND i.quantity_in_stock >= i.max_stock_level`;
    }

    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.color as category_color,
        CASE 
          WHEN i.max_stock_level IS NOT NULL THEN 
            i.quantity_in_stock - i.max_stock_level
          ELSE 0
        END as excess_quantity
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ${whereClause}
      ORDER BY excess_quantity DESC, i.name ASC
    `;

    const result = await dbQuery(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching overstocked report:', error);
    res.status(500).json({ error: 'Failed to fetch overstocked report' });
  }
});

// Get custom report with dynamic SQL
router.post('/custom', [
  body('query').isString().isLength({ min: 1 }).withMessage('SQL query is required'),
  body('params').optional().isArray().withMessage('Params must be an array'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query: sqlQuery, params = [], description } = req.body;

    // Basic security: only allow SELECT queries
    const trimmedQuery = sqlQuery.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed for security reasons' });
    }

    // Prevent dangerous operations
    const dangerousKeywords = ['drop', 'delete', 'insert', 'update', 'create', 'alter', 'truncate'];
    if (dangerousKeywords.some(keyword => trimmedQuery.includes(keyword))) {
      return res.status(400).json({ error: 'Query contains forbidden keywords for security reasons' });
    }

    const result = await dbQuery(sqlQuery, params);

    res.json({
      data: result.rows,
      rowCount: result.rowCount,
      description,
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing custom query:', error);
    res.status(500).json({ 
      error: 'Failed to execute custom query',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get sales performance report
router.get('/sales-performance', [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Invalid group by option')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFilter = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      dateFilter = `WHERE s.sale_date >= $${paramIndex} AND s.sale_date <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    } else if (startDate) {
      dateFilter = `WHERE s.sale_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    } else if (endDate) {
      dateFilter = `WHERE s.sale_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    let groupByClause = '';
    let selectClause = '';

    switch (groupBy) {
      case 'day':
        groupByClause = 'GROUP BY DATE(s.sale_date)';
        selectClause = 'DATE(s.sale_date) as period';
        break;
      case 'week':
        groupByClause = 'GROUP BY DATE_TRUNC(\'week\', s.sale_date)';
        selectClause = 'DATE_TRUNC(\'week\', s.sale_date) as period';
        break;
      case 'month':
        groupByClause = 'GROUP BY DATE_TRUNC(\'month\', s.sale_date)';
        selectClause = 'DATE_TRUNC(\'month\', s.sale_date) as period';
        break;
    }

    const query = `
      SELECT 
        ${selectClause},
        COUNT(DISTINCT s.id) as total_sales,
        COUNT(si.id) as total_items_sold,
        SUM(si.total_price) as total_revenue,
        SUM(si.total_price - (si.cost_at_sale * si.quantity)) as total_profit,
        AVG(si.total_price) as avg_sale_value,
        AVG(si.total_price - (si.cost_at_sale * si.quantity)) as avg_profit_per_sale
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      ${dateFilter}
      AND s.status = 'completed'
      ${groupByClause}
      ORDER BY period ASC
    `;

    const result = await dbQuery(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching sales performance:', error);
    res.status(500).json({ error: 'Failed to fetch sales performance' });
  }
});

// Export report data to CSV format
router.get('/export/:reportType', [
  param('reportType').isIn(['inventory', 'sales', 'profit', 'low-stock', 'overstocked']).withMessage('Invalid report type'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reportType } = req.params;
    const { format = 'json' } = req.query;

    let query = '';
    let params: any[] = [];

    switch (reportType) {
      case 'inventory':
        query = 'SELECT * FROM inventory_summary ORDER BY name';
        break;
      case 'sales':
        query = 'SELECT * FROM top_selling_items LIMIT 100';
        break;
      case 'profit':
        query = 'SELECT * FROM profit_analysis ORDER BY month DESC';
        break;
      case 'low-stock':
        query = `
          SELECT 
            i.name, i.upc, i.sku, c.name as category,
            i.quantity_in_stock, i.min_stock_level, i.cost, i.sale_price
          FROM items i
          LEFT JOIN categories c ON i.category_id = c.id
          WHERE i.quantity_in_stock <= i.min_stock_level AND i.is_active = true
          ORDER BY i.quantity_in_stock ASC
        `;
        break;
      case 'overstocked':
        query = `
          SELECT 
            i.name, i.upc, i.sku, c.name as category,
            i.quantity_in_stock, i.max_stock_level, i.cost, i.sale_price
          FROM items i
          LEFT JOIN categories c ON i.category_id = c.id
          WHERE i.max_stock_level IS NOT NULL AND i.quantity_in_stock >= i.max_stock_level AND i.is_active = true
          ORDER BY i.quantity_in_stock DESC
        `;
        break;
    }

    const result = await dbQuery(query, params);

    if (format === 'csv') {
      // Convert to CSV format
      const headers = Object.keys(result.rows[0] || {}).join(',');
      const csvData = result.rows.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      ).join('\n');
      
      const csv = `${headers}\n${csvData}`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      res.json({
        reportType,
        data: result.rows,
        rowCount: result.rowCount,
        exportedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

export default router;

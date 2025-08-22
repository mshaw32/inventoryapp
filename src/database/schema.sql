-- Inventory Management Database Schema
-- PostgreSQL database for reselling business inventory

-- Create database if it doesn't exist
-- CREATE DATABASE inventory_app;

-- Connect to the database
-- \c inventory_app;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table for organizing items
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table for inventory tracking
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    upc VARCHAR(50) UNIQUE,
    sku VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    profit_margin DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN cost > 0 THEN ((sale_price - cost) / cost * 100)
            ELSE 0
        END
    ) STORED,
    profit_amount DECIMAL(10,2) GENERATED ALWAYS AS (sale_price - cost) STORED,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    location VARCHAR(100),
    condition_notes TEXT,
    tags TEXT[],
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table for tracking sales and purchases
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sale', 'purchase', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    notes TEXT
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    total_purchases DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale items
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    cost_at_sale DECIMAL(10,2) NOT NULL,
    profit_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_price - (cost_at_sale * quantity)) STORED
);

-- Create indexes for better performance
CREATE INDEX idx_items_upc ON items(upc);
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_stock ON items(quantity_in_stock);
CREATE INDEX idx_transactions_item ON transactions(item_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_customer ON sales(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, color, icon) VALUES
('Electronics', 'Electronic devices and accessories', '#3B82F6', 'laptop'),
('Collectibles', 'Collectible items and memorabilia', '#EF4444', 'star'),
('Clothing', 'Apparel and accessories', '#10B981', 'tshirt'),
('Home & Garden', 'Home improvement and garden items', '#F59E0B', 'home'),
('Sports', 'Sports equipment and memorabilia', '#8B5CF6', 'trophy'),
('Books', 'Books and publications', '#06B6D4', 'book'),
('Toys & Games', 'Toys, games, and entertainment', '#EC4899', 'gamepad'),
('Other', 'Miscellaneous items', '#6B7280', 'box');

-- Create views for common reports
CREATE VIEW inventory_summary AS
SELECT 
    i.id,
    i.name,
    i.upc,
    i.sku,
    c.name as category_name,
    i.cost,
    i.sale_price,
    i.profit_margin,
    i.profit_amount,
    i.quantity_in_stock,
    i.min_stock_level,
    i.max_stock_level,
    i.location,
    CASE 
        WHEN i.quantity_in_stock <= i.min_stock_level THEN 'Low Stock'
        WHEN i.quantity_in_stock >= COALESCE(i.max_stock_level, 999999) THEN 'Overstocked'
        ELSE 'Normal'
    END as stock_status
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
WHERE i.is_active = true;

CREATE VIEW top_selling_items AS
SELECT 
    i.id,
    i.name,
    i.upc,
    c.name as category_name,
    COUNT(si.id) as total_sales,
    SUM(si.quantity) as total_quantity_sold,
    SUM(si.total_price) as total_revenue,
    AVG(si.profit_amount) as avg_profit_per_item
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN sale_items si ON i.id = si.item_id
LEFT JOIN sales s ON si.sale_id = s.id
WHERE s.status = 'completed'
GROUP BY i.id, i.name, i.upc, c.name
ORDER BY total_revenue DESC;

CREATE VIEW profit_analysis AS
SELECT 
    DATE_TRUNC('month', s.sale_date) as month,
    c.name as category_name,
    COUNT(DISTINCT s.id) as total_sales,
    SUM(si.total_price) as total_revenue,
    SUM(si.total_price - (si.cost_at_sale * si.quantity)) as total_profit,
    AVG(si.total_price - (si.cost_at_sale * si.quantity)) as avg_profit_per_sale
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
JOIN items i ON si.item_id = i.id
LEFT JOIN categories c ON i.category_id = c.id
WHERE s.status = 'completed'
GROUP BY DATE_TRUNC('month', s.sale_date), c.name
ORDER BY month DESC, total_profit DESC;

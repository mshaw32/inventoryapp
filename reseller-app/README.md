# ResellerPro - Advanced Reselling Business Management Platform

A modern, futuristic web application designed specifically for reselling businesses. Track inventory, manage sales, analyze profits, and generate comprehensive reports with a sleek cyberpunk-inspired interface.

## 🚀 Features

### 📦 Inventory Management
- **Complete Item Tracking**: Track UPC codes, SKUs, cost prices, sale prices, and profit margins
- **Stock Level Monitoring**: Real-time low stock alerts and out-of-stock notifications
- **Condition Tracking**: Monitor item conditions (New, Like New, Very Good, Good, Acceptable, Poor)
- **Location Management**: Track physical storage locations for easy retrieval
- **Category Organization**: Organize items by categories with custom tags
- **Advanced Search & Filtering**: Search by name, SKU, UPC, tags, or category

### 💰 Sales & Profit Analytics
- **Profit Calculation**: Automatic profit and margin calculations
- **Sales Tracking**: Complete sales history with customer information
- **Revenue Analytics**: Track daily, weekly, and monthly revenue trends
- **Performance Metrics**: Monitor top-selling items and categories

### 📊 Comprehensive Reporting
- **Visual Analytics**: Interactive charts and graphs using Recharts
- **Sales Trends**: 6-month sales and profit trend analysis
- **Category Distribution**: Pie charts showing sales by category
- **Top Selling Items**: Bar charts of best-performing products
- **Low Stock Alerts**: Real-time inventory level monitoring
- **Profit Margin Trends**: Track profit performance over time
- **Export Capabilities**: Generate reports for external analysis

### 🎨 Modern Futuristic Interface
- **Cyberpunk Theme**: Neon colors, glowing effects, and sci-fi aesthetics
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Custom Fonts**: Orbitron and Rajdhani fonts for a futuristic feel
- **Dark Mode**: Eye-friendly dark interface with neon accents

### 🔧 Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework with custom themes
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Modern UI Components**: Custom components with Radix UI primitives
- **Performance Optimized**: Fast loading with optimized images and code splitting

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization
- **UI Components**: Custom components with Radix UI
- **Icons**: Lucide React icons
- **Fonts**: Google Fonts (Orbitron, Rajdhani)
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reseller-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/reseller_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## 🗄 Database Schema

The application uses a comprehensive database schema with the following models:

- **User**: User authentication and profile management
- **Category**: Product categorization system
- **InventoryItem**: Complete product information with UPC, pricing, and stock
- **Sale**: Sales transactions with customer details
- **SaleItem**: Individual items within sales transactions
- **Report**: Saved reports and analytics

Key features of the schema:
- Decimal precision for financial calculations
- Enum types for conditions, payment methods, and statuses
- Relationships between all entities for data integrity
- JSON fields for flexible report parameters

## 🎨 UI Theme & Design

### Color Palette
- **Primary Cyan**: `#00ffff` - Main accent color
- **Purple**: `#a855f7` - Secondary accent
- **Pink**: `#ec4899` - Tertiary accent
- **Green**: `#10b981` - Success/profit indicators
- **Dark Background**: `#0f172a` - Primary background

### Typography
- **Headings**: Orbitron (futuristic, geometric)
- **Body Text**: Rajdhani (clean, readable)

### Visual Effects
- Neon glow effects on interactive elements
- Gradient backgrounds with transparency
- Animated status indicators
- Smooth hover transitions
- Grid-pattern backgrounds

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Optimized layout with collapsible navigation
- **Mobile**: Touch-friendly interface with mobile-optimized tables

## 🔒 Security Features

- Environment variable protection
- SQL injection prevention with Prisma
- CSRF protection with NextAuth.js
- Secure password handling
- Data validation and sanitization

## 📈 Performance Optimizations

- **Next.js App Router**: Improved performance and SEO
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Efficient data fetching and caching strategies

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker
```bash
# Build the container
docker build -t reseller-app .

# Run the container
docker run -p 3000:3000 reseller-app
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](issues) page for known problems
2. Create a new issue with detailed information
3. Include screenshots and error messages when possible

## 🗺 Roadmap

- [ ] User authentication and multi-user support
- [ ] Advanced reporting with custom date ranges
- [ ] Inventory import/export functionality
- [ ] Barcode scanning integration
- [ ] Mobile app development
- [ ] API for third-party integrations
- [ ] Advanced analytics and AI insights
- [ ] Multi-currency support
- [ ] Backup and restore functionality

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible UI primitives
- Recharts for beautiful data visualization
- Prisma for the type-safe database toolkit
- Lucide for the beautiful icon set

---

Built with ❤️ for the reselling community. Happy selling! 🛍️

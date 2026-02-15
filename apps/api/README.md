# Venezuela Exchange Rate API

A REST API that tracks and provides historical exchange rates from official and P2P sources in Venezuela. Built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 📊 **Official Rates**: BCV (Banco Central de Venezuela) - USD and EUR to VES
- 💱 **P2P Rates**: Binance P2P marketplace - USDT to VES (buy and sell)
- 📈 **Historical Data**: Track rate changes over time
- ⚡ **Live Rates**: Real-time P2P rates without database queries
- 🔄 **Auto-Updates**: Scheduled scraping at specific times
- 🛡️ **Rate Limiting**: 100 requests per 15 minutes per IP
- 🔒 **Secure**: Helmet.js, CORS, input validation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud like Supabase/Neon)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd bcv-exchange-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/bcv_exchange
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Run Locally

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check

```bash
GET /api/health
```

### BCV (Official Rates)

```bash
# Get latest official rates
GET /api/rates/latest?provider=BCV

# Get historical rates
GET /api/rates/history?currency=USD&startDate=2024-02-01&endDate=2024-02-08

# Get rates for specific date
GET /api/rates/date/2024-02-08

# Manually trigger update
POST /api/rates/update
Body: {"provider": "BCV"}
```

### Binance P2P

```bash
# Get live rates (real-time, not stored)
GET /api/binance/live
GET /api/binance/live?type=buy
GET /api/binance/live?type=sell

# Get latest stored rates
GET /api/binance/latest
GET /api/binance/latest?type=buy

# Get historical P2P rates
GET /api/binance/history?type=buy&startDate=2024-02-01

# Manually trigger update
POST /api/binance/update
```

### Examples

**Get current USD rate from BCV:**

```bash
curl "http://localhost:3000/api/rates/latest?provider=BCV&currency=USD"
```

**Get live Binance P2P rates:**

```bash
curl "http://localhost:3000/api/binance/live"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "buy_rate": 552.5,
    "sell_rate": 545.8,
    "average_rate": 549.15,
    "spread": 6.7,
    "spread_percentage": 1.23,
    "calculated_at": "2024-02-08T15:30:00.000Z",
    "sample_size": {
      "buy": 10,
      "sell": 10
    }
  }
}
```

## Automatic Updates

The API automatically scrapes rates on the following schedule (Caracas timezone):

**BCV (Official):**

- 9:15 AM - Morning update
- 1:15 PM - Afternoon update

**Binance P2P:**

- 9:00 AM - Morning update
- 1:00 PM - Afternoon update
- 6:00 PM - Evening update

## Project Structure

```
src/
├── config/          # Database and environment configuration
├── middleware/      # Rate limiting, error handling, validation
├── providers/       # Data source scrapers (BCV, Binance)
├── services/        # Business logic
├── models/          # Database queries
├── routes/          # API endpoints
├── jobs/            # Cron job schedulers
├── types/           # TypeScript type definitions
├── app.ts           # Express app setup
└── server.ts        # Entry point
```

## Data Providers

### BCV (Banco Central de Venezuela)

- **Source**: https://www.bcv.org.ve/
- **Currencies**: USD, EUR → VES
- **Update Times**: 9:00 AM and 1:00 PM
- **Type**: Official government rates

### Binance P2P

- **Source**: Binance P2P API
- **Currencies**: USDT → VES
- **Update Times**: 9:00 AM, 1:00 PM, 6:00 PM
- **Type**: Peer-to-peer marketplace rates
- **Calculation**: Average of top 10 merchant offers

## Adding New Providers

1. Create a new provider class in `src/providers/` extending `BaseProvider`
2. Implement the `fetchRates()` method
3. Add the provider to `scraperService.ts`
4. (Optional) Add cron jobs in `scheduler.ts`

Example:

```typescript
export class NewProvider extends BaseProvider {
  constructor() {
    super("NewProvider");
  }

  async fetchRates(): Promise<RateData[]> {
    // Fetch and return rate data
  }
}
```

## Database Schema

```sql
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  currency_from VARCHAR(10) NOT NULL,
  currency_to VARCHAR(10) DEFAULT 'VES',
  rate DECIMAL(20, 6) NOT NULL,
  update_type VARCHAR(10),
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date DATE NOT NULL,
  metadata JSONB,
  UNIQUE(provider, currency_from, currency_to, date, update_type)
);
```

## Deployment

### Deploy to Render

1. **Create PostgreSQL database:**
   - Go to Render dashboard → New PostgreSQL
   - Copy the Internal Database URL

2. **Create Web Service:**
   - Go to Render dashboard → New Web Service
   - Connect your GitHub repository
   - Settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**: Add `DATABASE_URL`

3. **Deploy!**

The API will be live at `https://your-app.onrender.com`

## Development

### Run Tests

```bash
npm run type-check  # TypeScript type checking
```

### Build

```bash
npm run build       # Compiles TypeScript to dist/
```

### Watch Mode

```bash
npm run dev         # Auto-restart on file changes
```

## API Response Format

All endpoints return a consistent JSON structure:

**Success:**

```json
{
  "success": true,
  "data": [...],
  "meta": {...}
}
```

**Error:**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**:
  - `RateLimit-Limit`
  - `RateLimit-Remaining`
  - `RateLimit-Reset`

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Scraping**: Axios, Cheerio
- **Scheduling**: node-cron
- **Security**: Helmet, CORS, express-rate-limit

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

**Note**: This API is for informational purposes only. Exchange rates are fetched from public sources and may not reflect real-time market conditions. Always verify rates before making financial decisions.

# CO2013 Assignments:

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd co2013
npm install
```

2. **Set up database:**
```bash
# In MySQL client, run these files in order:
mysql -u root -p < docs/ddl.sql
mysql -u root -p < docs/sManager.sql
mysql -u root -p < docs/func_trigger_proc.sql
mysql -u root -p < docs/data.sql
```

3. **Start development server:**
```bash
npm run dev
```

Access at http://localhost:3000

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check for linting errors
```

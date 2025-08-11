# Database Setup Guide

## Environment Configuration

Create a `.env.local` file in the project root with the following configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/dtp_attendance"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional configurations
IP_WHITELIST_ENABLED=false
IP_WHITELIST_IPS=""
IP_WHITELIST_RANGES=""
IP_WHITELIST_ALLOW_LOCALHOST=true
IP_WHITELIST_ALLOW_PRIVATE=true
```

## Database Setup Options

### Option 1: Use Supabase Database (Recommended)

Since we're already using Supabase Auth, the easiest option is to use Supabase's PostgreSQL database:

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings > Database**
3. **Copy the connection string** (it will look like):
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
4. **Update your `.env.local`** with this DATABASE_URL

### Option 2: Local PostgreSQL Setup

1. **Install PostgreSQL** on your machine
2. **Create a database**:
   ```sql
   CREATE DATABASE dtp_attendance;
   ```
3. **Update `.env.local`** with your local connection:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/dtp_attendance"
   ```

### Option 3: Docker PostgreSQL

1. **Run PostgreSQL in Docker**:
   ```bash
   docker run --name dtp-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dtp_attendance -p 5432:5432 -d postgres:15
   ```
2. **Update `.env.local`**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dtp_attendance"
   ```

## Testing Database Connection

After setting up your `.env.local` file, test the connection:

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Test Connection
```bash
npx prisma db push
```
This will apply the schema to your database and verify the connection.

### 3. Apply Migrations (Alternative)
```bash
npx prisma migrate dev
```
This will apply our existing migration and verify everything works.

### 4. View Database
```bash
npx prisma studio
```
This opens a web interface to view your database.

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running
- Check the port (default 5432)
- Verify username/password

### SSL Issues (Cloud databases)
Add SSL mode to connection string:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Firewall Issues
- Ensure port 5432 is open
- Check cloud database IP restrictions

## Next Steps

Once your database connection is working:
1. The migrations will be applied automatically
2. You can proceed with the next stories (Database Client & Queries)
3. You can use `npx prisma studio` to inspect your tables

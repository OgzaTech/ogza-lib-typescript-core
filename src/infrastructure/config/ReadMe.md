import { 
  ConfigValidator, 
  AppConfigSchema,
  ServerConfigSchema,
  DatabaseConfigSchema 
} from '@ogza/core';

// Validator oluştur
const validator = new ConfigValidator();

// Validate environment variables
const configResult = validator.validateEnv(AppConfigSchema);

if (configResult.isFailure) {
  console.error('❌ Config validation failed:', configResult.error);
  process.exit(1);
}

const config = configResult.getValue();

console.log('✅ Config validated successfully');
console.log('Port:', config.PORT);
console.log('Database:', config.DB_NAME);
console.log('Environment:', config.NODE_ENV);

// Start server
startServer(config);

Custom Schema:
import { ConfigSchema, ConfigValidator } from '@ogza/core';

// Kendi schema'nı oluştur
const MyAppSchema: ConfigSchema = {
  STRIPE_API_KEY: {
    required: true,
    type: 'string',
    minLength: 10,
    pattern: /^sk_/,
    description: 'Stripe secret key'
  },
  REDIS_URL: {
    required: true,
    type: 'url',
    description: 'Redis connection URL'
  },
  MAX_UPLOAD_SIZE: {
    type: 'number',
    min: 1,
    max: 100,
    default: 10,
    description: 'Max upload size in MB'
  },
  ALLOWED_ORIGINS: {
    type: 'string',
    transform: (value) => value.split(','),
    validator: (value) => {
      return Array.isArray(value) && value.every(v => v.startsWith('http'));
    },
    description: 'Comma-separated allowed origins'
  }
};

// Validate
const validator = new ConfigValidator();
const result = validator.validateEnv(MyAppSchema);

.env dosyası örneği:

# .env
NODE_ENV=production
PORT=3000
BASE_URL=https://api.example.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=superSecretPassword123
DB_SSL=true

JWT_SECRET=my-super-secret-jwt-key-minimum-32-chars
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=emailPassword
EMAIL_FROM=noreply@example.com

STRIPE_API_KEY=sk_test_123456789
REDIS_URL=redis://localhost:6379
MAX_UPLOAD_SIZE=50
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
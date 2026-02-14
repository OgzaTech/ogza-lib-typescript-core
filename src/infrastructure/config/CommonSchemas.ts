import { ConfigSchema } from "./IConfigValidator";

/**
 * Common Config Schemas
 * Sık kullanılan validation schema'ları
 */

/**
 * Database Config Schema
 */
export const DatabaseConfigSchema: ConfigSchema = {
  DB_HOST: {
    required: true,
    type: 'string',
    description: 'Database host'
  },
  DB_PORT: {
    required: true,
    type: 'port',
    default: 5432,
    description: 'Database port'
  },
  DB_NAME: {
    required: true,
    type: 'string',
    minLength: 1,
    description: 'Database name'
  },
  DB_USER: {
    required: true,
    type: 'string',
    description: 'Database user'
  },
  DB_PASSWORD: {
    required: true,
    type: 'string',
    minLength: 8,
    description: 'Database password'
  },
  DB_SSL: {
    type: 'boolean',
    default: false,
    description: 'Enable SSL'
  }
};

/**
 * Server Config Schema
 */
export const ServerConfigSchema: ConfigSchema = {
  NODE_ENV: {
    required: true,
    enum: ['development', 'production', 'test', 'staging'],
    default: 'development',
    description: 'Node environment'
  },
  PORT: {
    required: true,
    type: 'port',
    default: 3000,
    description: 'Server port'
  },
  HOST: {
    type: 'string',
    default: '0.0.0.0',
    description: 'Server host'
  },
  BASE_URL: {
    required: true,
    type: 'url',
    description: 'Base URL'
  }
};

/**
 * Auth Config Schema
 */
export const AuthConfigSchema: ConfigSchema = {
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT secret key'
  },
  JWT_EXPIRES_IN: {
    type: 'string',
    default: '7d',
    description: 'JWT expiration time'
  },
  REFRESH_TOKEN_EXPIRES_IN: {
    type: 'string',
    default: '30d',
    description: 'Refresh token expiration'
  }
};

/**
 * Email Config Schema
 */
export const EmailConfigSchema: ConfigSchema = {
  SMTP_HOST: {
    required: true,
    type: 'string',
    description: 'SMTP host'
  },
  SMTP_PORT: {
    required: true,
    type: 'port',
    description: 'SMTP port'
  },
  SMTP_USER: {
    required: true,
    type: 'email',
    description: 'SMTP user email'
  },
  SMTP_PASSWORD: {
    required: true,
    type: 'string',
    description: 'SMTP password'
  },
  EMAIL_FROM: {
    required: true,
    type: 'email',
    description: 'Default from email'
  }
};

/**
 * Complete App Config Schema
 * Combine all schemas
 */
export const AppConfigSchema: ConfigSchema = {
  ...ServerConfigSchema,
  ...DatabaseConfigSchema,
  ...AuthConfigSchema,
  ...EmailConfigSchema
};
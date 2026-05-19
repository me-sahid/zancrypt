import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config();
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// Startup validation of all 5 environment variables
const requiredEnvVars = [
  'B2_KEY_ID',
  'B2_APP_KEY',
  'B2_BUCKET',
  'B2_ENDPOINT',
  'B2_REGION'
];

const missingVars = [];
for (const varName of requiredEnvVars) {
  if (!process.env[varName] || process.env[varName].trim() === '') {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error(`[CRITICAL] Missing or empty environment variables for Backblaze B2: ${missingVars.join(', ')}`);
  process.exit(1);
}

const B2_BUCKET = process.env.B2_BUCKET;

// Helper to delay for retries
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to compute SHA-256 hash of a buffer
export function computeSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Initialize S3 Client with 30s connection timeout and region
// Using standard AWS SDK timeout configuration via requestHandler
import { NodeHttpHandler } from '@smithy/node-http-handler';

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 30000,
    socketTimeout: 30000,
  }),
});

/**
 * Uploads a shard to B2 with retry logic.
 * @param {string} shardId - Unique identifier for the shard
 * @param {Buffer} buffer - Shard data
 * @returns {Promise<string>} - The computed SHA-256 hash of the uploaded shard
 */
export async function uploadShard(shardId, buffer) {
  const hash = computeSHA256(buffer);
  const command = new PutObjectCommand({
    Bucket: B2_BUCKET,
    Key: shardId,
    Body: buffer,
    Metadata: {
      'sha256-hash': hash,
    },
  });

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await s3Client.send(command);
      return hash; // Success
    } catch (err) {
      lastError = err;
      console.warn(`[RETRY] Attempt ${attempt} failed for uploadShard(${shardId}): ${err.message}`);
      if (attempt < 3) {
        await sleep(1000);
      }
    }
  }

  // Log the exact error, shard ID, and provider name "b2" before giving up
  console.error(`[ERROR] [b2] uploadShard failed for shard ${shardId} after 3 attempts. Error: ${lastError.message}`);
  throw lastError;
}

/**
 * Downloads a shard from B2 with retry logic and SHA-256 hash verification.
 * @param {string} shardId - Unique identifier for the shard
 * @param {string} expectedHash - The expected SHA-256 hash of the shard
 * @returns {Promise<Buffer>} - The verified shard buffer
 */
export async function downloadShard(shardId, expectedHash) {
  const command = new GetObjectCommand({
    Bucket: B2_BUCKET,
    Key: shardId,
  });

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await s3Client.send(command);
      const byteArray = await response.Body.transformToByteArray();
      const buffer = Buffer.from(byteArray);

      // Verify SHA-256 hash
      if (expectedHash) {
        const actualHash = computeSHA256(buffer);
        if (actualHash !== expectedHash) {
          throw new Error(`SHA-256 hash mismatch! Expected: ${expectedHash}, Actual: ${actualHash}`);
        }
      }

      return buffer; // Success
    } catch (err) {
      lastError = err;
      console.warn(`[RETRY] Attempt ${attempt} failed for downloadShard(${shardId}): ${err.message}`);
      if (attempt < 3) {
        await sleep(1000);
      }
    }
  }

  // Log the exact error, shard ID, and provider name "b2" before giving up
  console.error(`[ERROR] [b2] downloadShard failed for shard ${shardId} after 3 attempts. Error: ${lastError.message}`);
  throw lastError;
}

/**
 * Deletes a shard from B2 with retry logic to prevent orphaned shards.
 * @param {string} shardId - Unique identifier for the shard
 * @returns {Promise<boolean>}
 */
export async function deleteShard(shardId) {
  const command = new DeleteObjectCommand({
    Bucket: B2_BUCKET,
    Key: shardId,
  });

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await s3Client.send(command);
      return true; // Success
    } catch (err) {
      lastError = err;
      console.warn(`[RETRY] Attempt ${attempt} failed for deleteShard(${shardId}): ${err.message}`);
      if (attempt < 3) {
        await sleep(1000);
      }
    }
  }

  // Log the exact error, shard ID, and provider name "b2" before giving up
  console.error(`[ERROR] [b2] deleteShard failed for shard ${shardId} after 3 attempts. Error: ${lastError.message}`);
  throw lastError;
}

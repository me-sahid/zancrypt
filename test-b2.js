import { uploadShard, downloadShard, deleteShard, computeSHA256 } from './storage.js';
import crypto from 'crypto';

async function runTests() {
  console.log('==================================================');
  console.log('      ZANCRYPT - BACKBLAZE B2 TEST SUITE         ');
  console.log('==================================================\n');

  // STEP 1: Verify environment variables
  console.log('[STEP 1/4] Checking Environment Variables...');
  const requiredEnvVars = [
    'B2_KEY_ID',
    'B2_APP_KEY',
    'B2_BUCKET',
    'B2_ENDPOINT',
    'B2_REGION'
  ];
  
  let envPass = true;
  for (const varName of requiredEnvVars) {
    if (process.env[varName]) {
      console.log(`  ✔ ${varName}: PRESENT`);
    } else {
      console.error(`  ✘ ${varName}: MISSING OR EMPTY`);
      envPass = false;
    }
  }

  if (envPass) {
    console.log('👉 STEP 1 PASS: Environment variables successfully validated.\n');
  } else {
    console.error('👉 STEP 1 FAIL: Missing required environment variables. Cannot proceed.\n');
    process.exit(1);
  }

  // Generate test shard data
  const testShardId = `test_shard_${crypto.randomBytes(4).toString('hex')}.bin`;
  const testData = crypto.randomBytes(1024); // 1KB random data
  const originalHash = computeSHA256(testData);

  console.log(`Generated Test Shard ID: ${testShardId}`);
  console.log(`Generated Test Shard SHA-256 Hash: ${originalHash}\n`);

  // STEP 2: Upload Test Shard
  console.log('[STEP 2/4] Uploading Test Shard to Backblaze B2...');
  let uploadHash;
  try {
    uploadHash = await uploadShard(testShardId, testData);
    if (uploadHash === originalHash) {
      console.log('👉 STEP 2 PASS: Shard successfully uploaded and SHA-256 hash matches.');
    } else {
      throw new Error(`Hash mismatch during upload! Expected ${originalHash}, got ${uploadHash}`);
    }
  } catch (err) {
    console.error(`👉 STEP 2 FAIL: Shard upload failed. Error: ${err.message}`);
    process.exit(1);
  }
  console.log('');

  // STEP 3: Download and Verify Shard
  console.log('[STEP 3/4] Downloading Test Shard and Verifying SHA-256 Hash...');
  try {
    const downloadedBuffer = await downloadShard(testShardId, originalHash);
    const downloadedHash = computeSHA256(downloadedBuffer);
    
    if (downloadedBuffer.equals(testData) && downloadedHash === originalHash) {
      console.log('👉 STEP 3 PASS: Shard successfully downloaded, contents and SHA-256 match perfectly.');
    } else {
      throw new Error('Downloaded buffer contents do not match original data.');
    }
  } catch (err) {
    console.error(`👉 STEP 3 FAIL: Shard download/verification failed. Error: ${err.message}`);
    // Attempt deletion even on step 3 failure
    try {
      await deleteShard(testShardId);
    } catch {}
    process.exit(1);
  }
  console.log('');

  // STEP 4: Delete Shard
  console.log('[STEP 4/4] Cleaning up: Deleting Test Shard from Backblaze B2...');
  try {
    const deleted = await deleteShard(testShardId);
    if (deleted) {
      console.log('👉 STEP 4 PASS: Shard successfully deleted from B2.');
    } else {
      throw new Error('Failed to delete shard.');
    }
  } catch (err) {
    console.error(`👉 STEP 4 FAIL: Shard deletion failed. Error: ${err.message}`);
    process.exit(1);
  }
  console.log('\n==================================================');
  console.log('     🎉 ALL TESTS PASSED SUCCESSFULLY!            ');
  console.log('==================================================');
}

runTests().catch((err) => {
  console.error('[CRITICAL] Unhandled test execution failure:', err);
  process.exit(1);
});

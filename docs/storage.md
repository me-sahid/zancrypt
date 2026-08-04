# Storage Nodes

The core philosophy of Zancrypt is that files are never stored centrally. Instead, the backend functions as a **Storage Router**, dynamically sharding and distributing files across multiple third-party cloud integrations.

## Distributed Shard Storage Engine

### Sharding (Chunking)
Files uploaded from the browser are sliced into **10MB chunks** (shards) using the JavaScript `file.slice()` API. This allows the backend to handle massive files without experiencing memory bottlenecks or hitting HTTP size limitations on cloud APIs.

### Rendezvous Hashing (Highest Random Weight)
The backend does not hard-code which node stores which file. Instead, it utilizes **Rendezvous Hashing** to distribute shards pseudo-randomly while maintaining determinism.

For each shard, a score is calculated for each healthy node:
`Score(Shard, Node) = SHA256(Shard_ID || Node_Name)`

The nodes are sorted by this score in descending order, and the top `N` nodes (based on the `replication_factor`, e.g., 2) are selected to receive the shard.

### Replication & Failover
- **Replication**: If `replication_factor = 2`, every 10MB shard is simultaneously streamed to two different cloud providers (e.g., Backblaze B2 and Supabase S3).
- **Failover**: When a user attempts to download a file, the `StorageRouter` fetches the manifest and contacts the primary replica node for each shard. If the primary node is offline or times out, the router automatically fails over and fetches the shard from the secondary replica.

### Transactional Physical Rollbacks
Because shards are uploaded concurrently using `asyncio.gather`, Zancrypt implements physical rollbacks to prevent orphaned files. If a shard fails to upload to *all* target replica nodes, the backend coordinates an emergency cleanup, deleting all successfully uploaded shards for that request from the cloud providers and rolling back the database transaction.

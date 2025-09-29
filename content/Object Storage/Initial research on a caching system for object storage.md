Example use case: OTA updates.
# Requirements
1. Multi part uploads: Support for handling cache set on multipart uplaod
   `CreateMultipartUpload`, `UploadPart` → `(UploadId, PartNumber, Data)`, `CompleteMultipartUpload`, `AbortMultipartUpload`
2. Support for `Range` GET: Need to avoid fragmentation, always align range with chunks. Fix chunk size, always cache the entire chunk, ensure alignment
3. Need consistency for mutable version buckets, `get` should never give stale data. Can safely cache versioned objects.
4. Partial object caching: ex: column get, streaming.
5. Need to decide consistency (strong, high latency vs eventual, low latency)
6. Tenant isolation. Can keep a minimum equal share and expand based on utilisation

[A good read about caching](https://clickhouse.com/blog/building-a-distributed-cache-for-s3)

| Layer  | Latency (99.99 percentile) | IOPS | Throughput |
| ------ | -------------------------- | ---- | ---------- |
| S3     | 500 ms                     | 5K   | 2 GB/sec   |
| SSD    | 1 ms                       | 100K | 4 GB/sec   |
| Memory | 250 ns                     | 100M | 100 GB/sec |

# Multi tiered cache
1. L1 cache: in memory tinyLFU based cache. Store cache metadata in valkey, valkey ensures eventual consistency.
2. L2 cache: SSD based cache. 

## L1 cache:
-  In memory tinyLFU based cache
- Each node has its own in memory cache
- Distributed valkey cluster, which stores metadata
	- `chunks:{bucket}:{key}:v:{version}:{chunkID} <node-id>`
- When request is made, nodeID is received from valkey, and then a local API call is made to fetch the data from the other node's cache, and store it locally (not ideal).
- In case of a miss, object is fetched from MinIO, and broken down into chunks and stored in the cache.
### Considerations:
- Chunk alignment, in case a range get is done from the client.
- Decide on the chunk size.
- Concurrency issue: How to invalidate a cached chunk (while it is being read/streamed)? 
### Limitations:
- Not strongly consistent: With a TTL set, a deleted object might be still cached
- Can only be used for versioned objects(that are immutable) to prevent sending stale data.


## Metrics:
1. How to describe utilisation? Can't allocate less cache memory to a tenant if their frequency is lower compared to another tenant.
2. How to decide if you want to store in L2 cache or L1 cache.

## Monitoring:
1. Benchmarking required to analyse and choose parameters for caching. Thes

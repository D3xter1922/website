[Caching](https://clickhouse.com/blog/building-a-distributed-cache-for-s3)

| Layer  | Latency (99.99%) | IOPS | Throughput |
| ------ | ---------------- | ---- | ---------- |
| S3     | 500 ms           | 5K   | 2 GB/sec   |
| SSD    | 1 ms             | 100K | 4 GB/sec   |
| Memory | 250 ns           | 100M | 100 GB/sec |


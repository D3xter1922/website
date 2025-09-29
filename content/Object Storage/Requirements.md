1. Multi part uploads:
   `CreateMultipartUpload`, `UploadPart` → `(UploadId, PartNumber, Data)`, `CompleteMultipartUpload`, `AbortMultipartUpload`
2. Support for `Range` GET: Fix chunk size, always cache the entire chunk, ensure alignment
3. Need consistency for mutable version buckets, get should never give stale data. Can easily cache versioned objects.
4. Partial object caching
5. Need to decide consistency (strong, high latency vs eventual, low latency)
6. Tenant isolation.
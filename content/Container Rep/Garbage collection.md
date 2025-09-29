first approach:
- api will first compute the files required to be deleted, then execute the delete operation
- options: --dry-run: only list the files marked for deletion
	- --delete-untagged: delete manifests not referenced by a tag
- For a registry, only 1 gc operation can be performed at a time
- During the gc process, all push operations must be restricted
- All the files marked and deleted will be stored in a log db for reference.
- GC states: failed, warmup, running, completed
- While gc state is running, dont allow another gc job run 
- Dont create new jwt tokens with push scope when gc process is warming up
- wait for all jwt tokens to expire. 
  
  
  




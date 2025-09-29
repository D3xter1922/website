## Separate Repo creation
1. Multiple registries and no concept for multiple repos (as a folder containing images): 
	- Create registry -->push images to that registry (each image can have multiple tags/versions)
	- users can create multiple registries inside an OU 
	- registry names should be globally unique
	- storage will be isolated
	- no need to maintain separate database for repos
	- We can design the UI such that registries are considered as repos
2. Multiple registries and multiple repo creation:
	- Create registry --> create repo --> push images to that repo (each image can have multiple tags/versions)
	- the concept of repo only makes sense from a UI perspective, registry only considers image names:
	  ex `/myrepo/myimage:v1, /myimage2:v1, /myrepo/subrepo:v2`
	- all repos under a registry will share storage and common layers
	- Need to maintain a separate db for repos
	- Need extra checks to allow pushing/pulling images to the registry only if the repo exists
	- Need to consider edge cases for concurrent repo creation/deletion and image push/pull


A _repository_ is a collection of container images or other artifacts in a registry that have the same name, but different tags. For example, the following three images are in the `acr-helloworld` repository:

- _acr-helloworld:latest_
- _acr-helloworld:v1_
- _acr-helloworld:v2_

Repository names can also include [namespaces](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-best-practices#repository-namespaces). Namespaces allow you to identify related repositories and artifact ownership in your organization by using forward slash-delimited names. However, the registry manages all repositories independently, not as a hierarchy.


2. Lifecycle policy: have a specific json for rules (aws) vs UI with dropdown to choose them
   ```{
        "rules": [
            {
                "rulePriority": integer,
                "description": "string",
                "selection": {
                    "tagStatus": "tagged"|"untagged"|"any",
                    "tagPatternList": list<string>,
                    "tagPrefixList": list<string>,
                    "countType": "imageCountMoreThan"|"sinceImagePushed",
                    "countUnit": "string",
                    "countNumber": integer
                },
                "action": {
                    "type": "expire"
                }
            }
        ]
    } 
    ```
**4. Garbage collection: for cleaning up all data, need to restrict push for 10-15 mins**
docker push kcr.io/registryname/image:v1




3. UI pages: 
	**1. Create registry page, provide option to choose between aws, gcp, azure for storage.**


![[Pasted image 20250924104141.png]]

	1. Create repo page, some properties like immutable tags, encryption. 
	2. garbage cleanup: Transfer old binaries to trash, run garbage cleanup on trash
4. 



- single bucket with different root directory per registry vs **new bucket for each registry**.
	- Cant use single buckets, need to create a bucket for each registry.



---
1. Notifications: How will we queue events. 
2. registry sends `201 Created` after successful push, can filter them 
3. **Check metrics by distribution**
4. Relying on notifications for maintaining registry table. vs `_catalog`:
	1. If some notification is missed, there will be a missing entry in db
	2. Notification provides info on lastModifiedTime, and last modified by.
5. Read manifest file and sum up the sizes of individual layers.
6. How to get username for a request?
7. Rate limiting: maintain sliding window/leaky bucket. Use LRU to store most used users. (anyways need to fetch config from db). rate limiting per org, how can we implement?
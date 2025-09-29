m# API
1. **POST `/api/v1/ou/<ouid>/registry/create`**: Creates a new registry entry in the db, with the config including root directory path specified. Creates a new s3 bucket, and stores the URI in the DB. Also modifies the  #ApiKeys collection and adds `"owner"` permission to that registry. _registry creation will happen on ops portal_
	**Request params**:
	`registry-name: string`: name of the created registry (unique identifier)	
	`region:  string`: region for storage bucket
	`labels: {key:value}`: labels to show in UI
	`description: string`: description to show in UI
	**Response**:
	- `200 OK`  (created registry)
	- `401 Unauthorized`
	- `405 MethodNotAllowed`
	- `500 InternalServerError`

2. `/api/v1/create/apikey`: Receives user info, scope, organization and generates an #ApiKeys ApiKey (password for docker login). scope includes repo and registry specific actions, Owner permission grants all permissions to that repo/registry

3. `/v2/{registry}/*`: creates a new registry object with the config from db and uses that for any operation. Also checks if the registry exits in the db. The registry object is stored in cache. We can implement an LRU cache to cache the most recently used registry configs, based on a set memory limit. Use `CachedTable` for caching as it syncs state across nodes

4. /api/v1/ou/{ouid}/registry/{registry}/repo/manifests/reference: internally calls DELETE `kcr.io/v2/{registry}/<name>/manifests/<reference>`: deletes a manifest file (should it also delete the layers?no, will be picked up by gc)
	**Response**:
	- `200 OK`  (deleted manifest)
	- `401 Unauthorized`
	- `405 MethodNotAllowed`
	- `500 InternalServerError`

5. GET `/api/v1/ou/{ouid}/registry/{registry}/repositories/list`: Returns list of all repos in that registry (no internally redirects to `/v2/_catalog`) refer to db
	
	```
	Example response:
	{
		"count":<no of repos>
		"Repositories":[
			{
				"name": "repo",
				"lastupdatedat": <datetime>,
				"lastupdatedby": <username>,
				"createdat":
				"createdby"
			},
			{}....
		]
	}
	```
6. GET `/api/v1/ou/{ouid}/registry/{registry}/repo/{repo}/tags/list`: Returns list of all tags for a specific repo, uses distribution API, size from manifest if db is null, then store in db.
	```
	Example response:
	{
		"tags":[
			{
				"tag":"v1",
				"type":
				"lastPushed": <datetime>,
				"lastPushedBy": <username>,
				"size":100
			}
		]
	}
	```

7. POST `/api/v1/ou/{ouid}/registry/{registry}/events`: listens to events, filters them and stores them in DB:
   **Request Body**:
```
"events": [
      {
         "id": "bb6a943c-c81a-4086-a4d6-809d66b59aab",
         "timestamp": "2025-09-23T10:57:35.98385+05:30",
         "action": "push",
         "target": {
            "mediaType": "application/vnd.oci.image.manifest.v1+json",
            "digest": "sha256:00abdbfd095cf666ff8523d0ac0c5776c617a50907b0c32db3225847b622ec5a",
            "size": 1039,
            "length": 1039,
            "repository": "myreg/helloworld",
            "url": "https://gerda-unphonetic-uncontinually.ngrok-free.app/v2/myreg/helloworld/manifests/sha256:00abdbfd095cf666ff8523d0ac0c5776c617a50907b0c32db3225847b622ec5a",
            "tag": "v1"
         },
         "request": {
            "id": "7990d0c6-8dd9-4c8d-b627-81ec311ce5e8",
            "addr": "219.65.110.122",
            "host": "gerda-unphonetic-uncontinually.ngrok-free.app",
            "method": "PUT",
            "useragent": "docker/28.4.0 go/go1.24.7 git-commit/249d679 kernel/6.10.14-linuxkit os/linux arch/arm64 containerd-client/2.1.4+unknown storage-driver/overlayfs UpstreamClient(Docker-Client/28.4.0 \\(darwin\\))"
         },
         "actor": {},
         "source": {
            "addr": "Druhins-MacBook-Pro.local:4999"
         }
      }
   ]
}
```

for events with `action == push` and `target.mediaType == application/vnd.oci.image.manifest.v1+json`, record an entry (or update) in the repo db.
similar for delete actions
-----**Consideration: How to get username for a request?**-----





# Databases:
1. #Registry collection:
	```
	{
		RegistryName: 
		Description
		CreatedAt:
		CreatedBy:
		Size:	
		Kind: private
		gcstate:healthy|garbagecollecting|failed
		labels:{}
		region:""
		config: {
			s3: 
			accesskey: awsaccesskey 
			secretkey: awssecretkey 
			region: us-west-1 
			regionendpoint: http://myobjects.local 
			forcepathstyle: true 
			accelerate: false 
			bucket: bucketname 
			encrypt: true 
			keyid: mykeyid 
			secure: true 
			v4auth: true 
			chunksize: 5242880 
			multipartcopychunksize: 33554432 
			multipartcopymaxconcurrency: 100 
			multipartcopythresholdsize: 33554432 
			rootdirectory: /s3/object/name/prefix 
			usedualstack: false 
			loglevel: debug		
		}
	}
	```
2. for each registry in each ou, #Repositories:
	```
	{
		repoName: 
		last updated time:
		last updated by:
		tags:[
					{
						"tagname":"v1",
						"digest":sha256
						"lastPushed": <datetime>,
						"lastPushedBy": <username>,
						"size":100
					}
			],
		lifecycle policy:[
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
                    "type": "keep"
                }
            }
        ]
		size?
	}
	```
3. #ApiKeys  collection: *registry based scopes only*
	```
	{
		"hashedapikey":key,
		"username":email,
		"registry":registry,
		"scope":
			{
				<regName1>: {
								permissions:["owner", "delete", "modifyGcPolicy", "createRepo"]
								<repoName>: ["push", "pull", "owner", "delete", "modifyPolicy"]
							}, // repos and actions (push pull)
				<regName2>: scope2...
			}
		
		"permissions": ["createRegistry", "admin"]
		
	}
	```
4. #GarbageCollector:
	```
	{
	  _id: <jobID>,
	  registry: "registry-a",
	  phase: "preparing|running|finalizing|completed|failed|idle",
	  requestedBy: "...",
	  scheduledAt: unixtimestamp,
	  readOnlySince: unixtimestamp,
	  startedAt: unixtimestamp,
	}
	```

---
# Per page APIs
## Create registry page:
- GET `/api/v1/ou/<ouid>/registry/list`: 
	```
	{
		registries:[
			{
				"name":registry,

				"createdAt":<>,
				"createdBy":<>,
				"description":"",
				"labels":{}
				"region"
				"kind":private
			}
		]
	}
	```
- Size can determined by size of the bucket for that registry in S3. (can skip)
- POST `/api/v1/ou/<ouid>/registry/create`: 
	- name
	- description
	- Kind: private | public | Remote | Virtual (private only for now)
	- labels
	- region
# Account -> {registry}:
## List repos
- GET `/api/v1/ou/{ouid}/registry/{registry}/repositories/list`: Returns list of all repos in that registry (from db)
```
Example response:
	{
		"count":<no of repos>
		"Repositories":[
			{
				"name": "repo",
				"lastupdatedat": <datetime>,
				"lastupdatedby": <username>,
				"URI": <>,
				"Tag Immutability":<default>, 
				"encryption":<default>,
				"lifecycle policy":[{}]        
			},
			...
		]
	}
```

- POST `/api/v1/ou/{ouid}/registry/{registry}/repositories/create`
	- name (with namespace)
	- tag immutability
	- encryption
	- LifecyclePolicy
- POST `/api/v1/ou/{ouid}/registry/{registry}/repositories/metadata/edit?reponame={name}`
	- tag immutability: bool
	- encryption : string
	- lifecyclePolicy:{}
## Registry -> Garbage collection:
- `/api/v1/ou/{ouid}/registry/{registry}/gc/start`:
  ```
	{
	    "registry": "myreg",
	    "phase": "preparing",
	    "jobId": "d6f65dcf-5bf3-42e8-9736-776f8407eb0d",
	    "requestedBy": "api",
	    "scheduledAt": "2025-09-24T12:49:44.923922+05:30",
	    "readOnlySince": "2025-09-24T12:39:44.923922+05:30",
	    "startedAt": "0001-01-01T00:00:00Z",
	    "heartbeat": "0001-01-01T00:00:00Z",
	    "message": "",
	    "pushBlocked": true,
	    "lastCompleted": "2025-09-24T12:02:54.346372+05:30",
	    "lastResult": "completed",
	    "lastError": "",
	    "lastDuration": 13641583
	}
  ```
  `409 conflict` if a job is already running
- `/api/v1/ou/{ouid}/registry/{registry}/gc/status`:
```
	{
	    "registry": "myreg",
	    "phase": "preparing",
	    "jobId": "d6f65dcf-5bf3-42e8-9736-776f8407eb0d",
	    "requestedBy": "api",
	    "scheduledAt": "2025-09-24T12:49:44.923922+05:30",
	    "readOnlySince": "2025-09-24T12:39:44.923922+05:30",
	    "startedAt": "0001-01-01T00:00:00Z",
	    "heartbeat": "0001-01-01T00:00:00Z",
	    "message": "",
	    "pushBlocked": true,
	    "lastCompleted": "2025-09-24T12:02:54.346372+05:30",
	    "lastResult": "completed",
	    "lastError": "",
	    "lastDuration": 13641583
	}
```
- `/api/v1/ou/{ouid}/registry/{registry}/gc/{job}/cancel`:
```
{
    "registry": "myreg",
    "phase": "idle",
    "jobId": "",
    "requestedBy": "",
    "scheduledAt": "0001-01-01T00:00:00Z",
    "readOnlySince": "0001-01-01T00:00:00Z",
    "startedAt": "0001-01-01T00:00:00Z",
    "heartbeat": "0001-01-01T00:00:00Z",
    "message": "",
    "pushBlocked": false,
    "lastCompleted": "2025-09-24T12:41:32.882074+05:30",
    "lastResult": "failed",
    "lastError": "cancelled",
    "lastDuration": 0
}
```
# Repo -> List tags:
- GET `/api/v1/ou/{ouid}/registry/{registry}/repo/{repo}/tags/list`: Returns list of all tags for a specific repo
	```
	Example response:
	{
		"ouid":<ouid>,
		"registry":<registry>,
		"name": "reponame",
		"tags":[
			{
				"tag":"v1",
				"lastPushed": <datetime>,
				"digest":<>
				"lastPushedBy": <username>,
				"size":100,
				"uri":<>,
				"kind":<>
			}
		]
	}
	```

# Things to figure out
1. IAM roles
2. metrics: push and pull count for repo and tags, last push timestamp n pushed by. 
3. Multi - arch images how to handle in UI and db.
Container registry uses the distribution/distribution package which implements the HTTP V2 api specification.
## Components:
### 1. Registry service:
Provides standard implementation for login/push/pull and can be used to interact with docker/podman/singularity containers, as well as Helm charts (v3).
Inside each organization, multiple registries can be created. 
## 2. Control Plane APIs:
![[Pasted image 20250919124748.png]]

`/create/apikey`: Receives user info, scope, organization and generates an API key (password for docker login). scope includes repo specific actions, and admin access (create/delete registry)


DB should have separate collections for each registry.
`{registry}/event`: Listens to event from the registry APIs, stores the action logs in the DB
**Filter out push and pull for manifest file**, store them in a db.
`name of image, tag, last pushed, last pulled, versions` 
Search filters can use any of these fields to search from the db, searching images can be done through `/v2/_catalog`

Which DB to use?

DB collections:
1. registries (cached): list of created registries, their config parameters, root directory, organization, creation date, created by. 
2. api keys: List of API keys with usernames (can set it to company email to ensure uniqueness), organization, scopes and permission
3. {org/registryName}: list of repos (images) with parameters like: last modified, created by, creation date, last modified by, url, layers (roadmap)
4. requests: can be used for rate limiting

`{registry}/metadata`: Adds additional metadata associated with an image (from the UI)


`/create/registry`: Creates a new registry, needs api key for auth. Creates a new service for registry.






## MVP features:
- Push​
- Pull​
- Login​
- Additional metadata​
- Api key generation​
- JWT auth​
- Action logs​





### Discussion points
1. Multiple registries and no concept for multiple repos: 
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











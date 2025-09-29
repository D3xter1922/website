# Registry Page:

----search bar--------refresh-------Create Registry----

| registry name | Created at | Created By | Description | kind | actions button |
| ------------- | ---------- | ---------- | ----------- | ---- | -------------- |
|               |            |            |             |      |                |

## Create Registry menu:
**Request params**:
	`registry-name: string`: name of the created registry (unique identifier)	
	`region:  string`: region for storage bucket
	`description: string`: description to show in UI

# Repository Page
----search bar--------refresh-------Create Repository----
--total repos: x---

| Repo name | Created at/by | last updated at/by | tag immutability | encryprion | actions button          | Lifecycle | URL |
| --------- | ------------- | ------------------ | ---------------- | ---------- | ----------------------- | --------- | --- |
|           |               |                    |                  |            | edit, delete, setup, gc |           |     |
## Create Repo
- POST `/api/v1/ou/{ouid}/registry/{registry}/repositories/create`
	- name (with namespace)
	- tag immutability
	- encryption
	- LifecyclePolicy
- POST `/api/v1/ou/{ouid}/registry/{registry}/repositories/metadata/edit?reponame={name}`
	- tag immutability: bool
	- encryption : string
	- lifecyclePolicy:{}

# Tags page
----search bar--------refresh-------view push commands----
--total tags: x---

| Tag name | Created at | Created By | Digest | Size | actions button | URL |
| -------- | ---------- | ---------- | ------ | ---- | -------------- | --- |
|          |            |            |        |      |                |     |
### View push commands:
Create API key link or a cli
```
kluisz get-credentials placeholder | Docker login --username <> --password-stdin <region/tenant>.kcr.io
```
Tag your image
```
docker tag <repo>:latest <region/tenant>.kcr.io/<registry>/<repo>:latest
```
Push your image
```
docker push <region/tenant>.kcr.io/<registry>/<repo>:latest
```
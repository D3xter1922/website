## 1. Multi-tenancy:
Requirements:
- Complete storage isolation 
- Separate registry for the tenant
- Hierarchy inside the registry: `<OrgUnit>/<repo>/<image>:<tag>`
- KCR scalable architecture
- single server, multiple registry services inside vs multiple backend instances
### a. single server, multiple registry:
- rate limiting policies per tenant,
- path: `kcr.io/<org name>/<registry name>/<repo>/<image>:<tag>
- enforce registry names are unique per organization
- configure subdomain to redirect `<org name>.kcr.io/` to `kcr.io/<org name>/`
- each registry will store data in `<registry name>/v2/_catalog`
- Can cache the instances of registry.
## 2. Cleanup/retention policies:
Requirements:
- While creating a repo, user should be able to specify image cleanup policy. ex(delete unused or old or dangling images). can be executed with a cron job
## 3. Immutable image tags:
Requirements:
- Should prevent (some) image tags from being overwritten
## 4. Multi-region repository:
Requirements:
- Users should not have to worry about different regions while push/pull
- Kcr should identify if the referred image is in a different remote, and fetch from it.
- Need to make sure data is consistent across regions
## 5. Remote repos and Pull through cache:
Requirements:
- Public images used as a base should be cached on the server
- User should not have to rely on 3rd party registries like docker hub
- Need to keep the cached registries up-to-date
## 6. Repo scopes:
requirements:
- Some repositories should allow for anonymous pulls but only authorised pushes. 
## 7. Layers visualisation:
Read the manifest file and show layers (commands in dockerfile)
![[Pasted image 20250922113507.png]]



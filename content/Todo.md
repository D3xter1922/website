1. Define jwt scope properly, and add a check to it.
2. remove root storage param from db, and use registry name as root storage or think about in-memory caching
3. For every registry a user creates, add repo:push,pull in the scope for that user's api key
4. implement garbage collector
5. add gcpullonly flag in jwt
6. test gc race condition
7. add lifecycle policy
	1. define schema
	2. 
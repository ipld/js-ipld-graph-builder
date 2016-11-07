# batch

[./store.js:72-122](https://github.com/wanderer/merkle-trie/blob/cc127b874bde36d6b5d7edb12f412d58869e685a/./store.js#L72-L122 "Source code on GitHub")

flush a cache trie to the db returning a promise that resolves to a merkle
link in the form of a [cid](https://github.com/ipfs/js-cid)

**Parameters**

-   `Cache`  
-   `cache`  

Returns **Promise** 

# createReadStream

[./store.js:129-131](https://github.com/wanderer/merkle-trie/blob/cc127b874bde36d6b5d7edb12f412d58869e685a/./store.js#L129-L131 "Source code on GitHub")

Creates a read stream returning all the Vertices in a trie given a root merkle link

**Parameters**

-   `cid` **[CID]** (<https://github.com/ipfs/js-cid>)

Returns **ReadStream** 

# getCID

[./store.js:50-64](https://github.com/wanderer/merkle-trie/blob/cc127b874bde36d6b5d7edb12f412d58869e685a/./store.js#L50-L64 "Source code on GitHub")

resolves a [CID](https://github.com/ipfs/js-cid) to a Vertex

**Parameters**

-   `cid` **[CID]** (<https://github.com/ipfs/js-cid>)

Returns **Promise** 

# getPath

[./store.js:33-43](https://github.com/wanderer/merkle-trie/blob/cc127b874bde36d6b5d7edb12f412d58869e685a/./store.js#L33-L43 "Source code on GitHub")

Fetches a Vertex from the db

**Parameters**

-   `rootVertex` **Vertex** the vertex to start fetching from
-   `vertex`  
-   `path` **Array** the path to fetch

Returns **Promise** 

# set

[./store.js:16-25](https://github.com/wanderer/merkle-trie/blob/cc127b874bde36d6b5d7edb12f412d58869e685a/./store.js#L16-L25 "Source code on GitHub")

Stores a vertex in the db, returning its merkle link

**Parameters**

-   `Vertex`  
-   `vertex`  

Returns **Promise** 

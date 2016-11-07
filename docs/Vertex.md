# batch

[store.js:72-122](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/store.js#L72-L122 "Source code on GitHub")

flush a cache trie to the db returning a promise that resolves to a merkle
link in the form of a [cid](https://github.com/ipfs/js-cid)

**Parameters**

-   `Cache`  
-   `cache`  

Returns **Promise** 

# constructor

[index.js:14-29](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L14-L29 "Source code on GitHub")

Create a new vertex

**Parameters**

-   `opts` **Object** 
    -   `opts.value` **Any** the value to store in the trie
    -   `opts.edges` **Map** the edges that this vertex has stored a `Map` edge name => `Vertex`
    -   `opts.store` **Store** the store that this vertex will use

# copy

[index.js:225-233](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L225-L233 "Source code on GitHub")

creates a copy of the merkle trie. Work done on this copy will not affect
the original.

Returns **Vertex** 

# createReadStream

[store.js:129-131](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/store.js#L129-L131 "Source code on GitHub")

Creates a read stream returning all the Vertices in a trie given a root merkle link

**Parameters**

-   `cid` **[CID]** (<https://github.com/ipfs/js-cid>)

Returns **ReadStream** 

# del

[index.js:137-139](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L137-L139 "Source code on GitHub")

deletes an Edge at the end of given path

**Parameters**

-   `path` **Array** 

Returns **boolean** Whether or not anything was deleted

# flush

[index.js:216-218](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L216-L218 "Source code on GitHub")

flush the cache of saved operation to the store

Returns **Promise** 

# get

[index.js:146-168](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L146-L168 "Source code on GitHub")

get a vertex given a path

**Parameters**

-   `path` **Array** 

Returns **Promise** 

# getCID

[store.js:50-64](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/store.js#L50-L64 "Source code on GitHub")

resolves a [CID](https://github.com/ipfs/js-cid) to a Vertex

**Parameters**

-   `cid` **[CID]** (<https://github.com/ipfs/js-cid>)

Returns **Promise** 

# getPath

[store.js:33-43](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/store.js#L33-L43 "Source code on GitHub")

Fetches a Vertex from the db

**Parameters**

-   `rootVertex` **Vertex** the vertex to start fetching from
-   `vertex`  
-   `path` **Array** the path to fetch

Returns **Promise** 

# hash

[index.js:84-86](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L84-L86 "Source code on GitHub")

Returns **Promise** the promise resolves the hash of this vertex

# isEmpty

[index.js:103-105](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L103-L105 "Source code on GitHub")

**Properties**

-   `Returns` **boolean** truthy on whether the vertexs is empty

# isLeaf

[index.js:110-112](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L110-L112 "Source code on GitHub")

**Properties**

-   `isLeaf` **boolean** wether or not the current vertex is a leaf

# root

[index.js:36-38](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L36-L38 "Source code on GitHub")

Get the parent or root vertex from which this vertex was found by.
Not all Vertices have root vertices, only vertice that where resolve be
get/update have roots

# serialize

[index.js:43-45](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L43-L45 "Source code on GitHub")

Returns **Promise** the promise resolves the serialized Vertex

# set

[index.js:119-130](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L119-L130 "Source code on GitHub")

Set an edge on a given path to the given vertex

**Parameters**

-   `path` **Array** 
-   `vertex` **Vertex** 
-   `newVertex`  

# set

[store.js:16-25](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/store.js#L16-L25 "Source code on GitHub")

Stores a vertex in the db, returning its merkle link

**Parameters**

-   `Vertex`  
-   `vertex`  

Returns **Promise** 

# update

[index.js:180-210](https://github.com/wanderer/merkle-trie/blob/9a816f019d7eed12f418a6fb15a8632559c6bafa/index.js#L180-L210 "Source code on GitHub")

Updates an edge on a given path . If the path does not already exist this
will extend the path. If no value is returned then the vertex that did exist will be deleted

**Parameters**

-   `path` **Array** 

**Examples**

```javascript
rootVertex.update(path).then(([vertex, resolve]) => {
  resolve(new Vertex({value: 'some new value'}))
})
```

Returns **Promise** the promise resolves a vertex and a callback funtion that is used to update the vertex

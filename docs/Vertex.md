# cid

[./index.js:85-87](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L85-L87 "Source code on GitHub")

Returns **Promise** the promise resolves the hash of this vertex

# constructor

[./index.js:14-30](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L14-L30 "Source code on GitHub")

Create a new vertex

**Parameters**

-   `opts` **Object** 
    -   `opts.value` **Any** the value to store in the trie
    -   `opts.edges` **Map** the edges that this vertex has stored a `Map` edge name => `Vertex`
    -   `opts.store` **Store** the store that this vertex will use

# copy

[./index.js:218-226](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L218-L226 "Source code on GitHub")

creates a copy of the merkle trie. Work done on this copy will not affect
the original.

Returns **Vertex** 

# del

[./index.js:130-132](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L130-L132 "Source code on GitHub")

deletes an Edge at the end of given path

**Parameters**

-   `path` **Array** 

Returns **boolean** Whether or not anything was deleted

# flush

[./index.js:209-211](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L209-L211 "Source code on GitHub")

flush the cache of saved operation to the store

Returns **Promise** 

# get

[./index.js:139-161](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L139-L161 "Source code on GitHub")

get a vertex given a path

**Parameters**

-   `path` **Array** 

Returns **Promise** 

# isEmpty

[./index.js:104-106](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L104-L106 "Source code on GitHub")

**Properties**

-   `Returns` **boolean** truthy on whether the vertexs is empty

# isLeaf

[./index.js:111-113](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L111-L113 "Source code on GitHub")

**Properties**

-   `isLeaf` **boolean** wether or not the current vertex is a leaf

# root

[./index.js:37-39](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L37-L39 "Source code on GitHub")

Get the parent or root vertex from which this vertex was found by.
Not all Vertices have root vertices, only vertice that where resolve be
get/update have roots

# serialize

[./index.js:44-46](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L44-L46 "Source code on GitHub")

Returns **Promise** the promise resolves the serialized Vertex

# set

[./index.js:120-123](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L120-L123 "Source code on GitHub")

Set an edge on a given path to the given vertex

**Parameters**

-   `path` **Array** 
-   `vertex` **Vertex** 
-   `newVertex`  

# update

[./index.js:173-203](https://github.com/wanderer/merkle-trie/blob/1b13d9d9f007ffe387a12b2faa03896220b2ecda/./index.js#L173-L203 "Source code on GitHub")

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

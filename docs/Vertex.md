# constructor

[index.js:13-26](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L13-L26 "Source code on GitHub")

Create a new vertex

**Parameters**

-   `opts` **Object** 
    -   `opts.value` **Any** the value to store in the trie
    -   `opts.edges` **Map** the edges that this vertex has stored a `Map` edge name => `Vertex`
    -   `opts.store` **Store** the store that this vertex will use

# copy

[index.js:209-217](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L209-L217 "Source code on GitHub")

creates a copy of the merkle trie. Work done on this copy will not affect
the original.

Returns **Vertex** 

# del

[index.js:124-126](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L124-L126 "Source code on GitHub")

deletes an Edge at the end of given path

**Parameters**

-   `path` **Array** 

Returns **boolean** Whether or not anything was deleted

# flush

[index.js:200-202](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L200-L202 "Source code on GitHub")

flush the cache of saved operation to the store

Returns **Promise** 

# get

[index.js:133-155](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L133-L155 "Source code on GitHub")

get a vertex given a path

**Parameters**

-   `path` **Array** 

Returns **Promise** 

# hash

[index.js:72-74](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L72-L74 "Source code on GitHub")

Returns **Promise** the promise resolves the hash of this vertex

# isEmpty

[index.js:91-93](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L91-L93 "Source code on GitHub")

**Properties**

-   `Returns` **boolean** truthy on whether the vertexs is empty

# isLeaf

[index.js:98-100](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L98-L100 "Source code on GitHub")

**Properties**

-   `isLeaf` **boolean** wether or not the current vertex is a leaf

# serialize

[index.js:31-33](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L31-L33 "Source code on GitHub")

Returns **Promise** the promise resolves the serialized Vertex

# set

[index.js:107-117](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L107-L117 "Source code on GitHub")

Set an edge on a given path to the given vertex

**Parameters**

-   `path` **Array** 
-   `vertex` **Vertex** 
-   `newVertex`  

# update

[index.js:167-194](https://github.com/wanderer/merkle-trie/blob/7fed38cf275dc8c92da2397030dcf760067b1245/index.js#L167-L194 "Source code on GitHub")

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

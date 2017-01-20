# cid

[./index.js:126-128](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L126-L128 "Source code on GitHub")

Returns **Promise** the promise resolves the hash of this vertex

# constructor

[./index.js:14-34](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L14-L34 "Source code on GitHub")

Create a new vertex

**Parameters**

-   `opts` **Object** 
    -   `opts.value` **Any** the value to store in the trie
    -   `opts.edges` **Map** the edges that this vertex has stored a `Map` edge name => `Vertex`
    -   `opts.store` **Store** the store that this vertex will use

# copy

[./index.js:251-258](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L251-L258 "Source code on GitHub")

creates a copy of the merkle trie. Work done on this copy will not affect
the original.

Returns **Vertex** 

# del

[./index.js:178-182](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L178-L182 "Source code on GitHub")

deletes an Edge at the end of given path

**Parameters**

-   `path` **Array** 

Returns **boolean** Whether or not anything was deleted

# flush

[./index.js:241-244](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L241-L244 "Source code on GitHub")

flush the cache of saved operation to the store

Returns **Promise** 

# get

[./index.js:189-225](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L189-L225 "Source code on GitHub")

get a vertex given a path

**Parameters**

-   `path` **Array** 

Returns **Promise** 

# getParent

[./index.js:231-235](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L231-L235 "Source code on GitHub")

finds the parent vertex

Returns **Promise** 

# isEmpty

[./index.js:145-147](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L145-L147 "Source code on GitHub")

**Properties**

-   `Returns` **boolean** truthy on whether the vertexs is empty

# isLeaf

[./index.js:152-154](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L152-L154 "Source code on GitHub")

**Properties**

-   `isLeaf` **boolean** wether or not the current vertex is a leaf

# isRoot

[./index.js:40-42](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L40-L42 "Source code on GitHub")

Whether or not the Vertex is a root vertex

Returns **Boolean** 

# name

[./index.js:48-50](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L48-L50 "Source code on GitHub")

returns the edge from the parent vertex that this vertex is refernced by

Returns **Any** 

# path

[./index.js:64-66](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L64-L66 "Source code on GitHub")

Get the path from the root vertex to this vertex

Returns **Array** 

# root

[./index.js:56-58](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L56-L58 "Source code on GitHub")

Get the root vertex

Returns **Vertex** 

# rootAndPath

[./index.js:72-80](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L72-L80 "Source code on GitHub")

Gets the root vertex and the path

Returns **Array** 

# serialize

[./index.js:85-87](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L85-L87 "Source code on GitHub")

Returns **Promise** the promise resolves the serialized Vertex

# set

[./index.js:161-171](https://github.com/wanderer/merkle-trie/blob/2443c55449e6daf0d782bca00b0715bfe5106a64/./index.js#L161-L171 "Source code on GitHub")

Set an edge on a given path to the given vertex

**Parameters**

-   `path` **Array** 
-   `vertex` **Vertex** 
-   `newVertex`  

# clone

[index.js:120-122](https://github.com/ipld/js-ipld-graph-builder/blob/864d8678199240d3fa8da451f5b09a2d689cb736/index.js#L120-L122 "Source code on GitHub")

clones an Object via a deeep copy

**Parameters**

-   `root` **Object** return {Object}

# constructor

[index.js:10-13](https://github.com/ipld/js-ipld-graph-builder/blob/864d8678199240d3fa8da451f5b09a2d689cb736/index.js#L10-L13 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)
-   `opts`   (optional, default `{format: 'dag-cbor', hashAlg: 'sha2-256'}`)

# flush

[index.js:97-113](https://github.com/ipld/js-ipld-graph-builder/blob/864d8678199240d3fa8da451f5b09a2d689cb736/index.js#L97-L113 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `root` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)

Returns **Promise** 

# get

[index.js:84-89](https://github.com/ipld/js-ipld-graph-builder/blob/864d8678199240d3fa8da451f5b09a2d689cb736/index.js#L84-L89 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `root` **Object** 
-   `path` **String** 

Returns **Promise** 

# getOptions

[index.js:29-31](https://github.com/ipld/js-ipld-graph-builder/blob/864d8678199240d3fa8da451f5b09a2d689cb736/index.js#L29-L31 "Source code on GitHub")

get options assiocated with an Ojbect

**Parameters**

-   `obj` **Object** 

Returns **Object** 

# set

[index.js:40-54](https://github.com/ipld/js-ipld-graph-builder/blob/864d8678199240d3fa8da451f5b09a2d689cb736/index.js#L40-L54 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `root` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

# setOptions

[index.js:20-22](https://github.com/ipld/js-ipld-graph-builder/blob/864d8678199240d3fa8da451f5b09a2d689cb736/index.js#L20-L22 "Source code on GitHub")

sets [dag.put](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput) options on a JSON object

**Parameters**

-   `obj` **Object** 
-   `opts` **Object** 

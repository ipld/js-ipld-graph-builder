# clone

[index.js:119-121](https://github.com/ipld/js-ipld-graph-builder/blob/31f73c8276c3448ebe68905985e36c154da2b156/index.js#L119-L121 "Source code on GitHub")

clones an Object via a deeep copy

**Parameters**

-   `root` **Object** return {Object}

# constructor

[index.js:10-13](https://github.com/ipld/js-ipld-graph-builder/blob/31f73c8276c3448ebe68905985e36c154da2b156/index.js#L10-L13 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)
-   `opts`   (optional, default `{format: 'dag-cbor', hashAlg: 'sha2-256'}`)

# flush

[index.js:96-112](https://github.com/ipld/js-ipld-graph-builder/blob/31f73c8276c3448ebe68905985e36c154da2b156/index.js#L96-L112 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `root` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)

Returns **Promise** 

# get

[index.js:84-88](https://github.com/ipld/js-ipld-graph-builder/blob/31f73c8276c3448ebe68905985e36c154da2b156/index.js#L84-L88 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `root` **Object** 
-   `path` **String** 

Returns **Promise** 

# getOptions

[index.js:29-31](https://github.com/ipld/js-ipld-graph-builder/blob/31f73c8276c3448ebe68905985e36c154da2b156/index.js#L29-L31 "Source code on GitHub")

get options assiocated with an Ojbect

**Parameters**

-   `obj` **Object** 

Returns **Object** 

# set

[index.js:40-54](https://github.com/ipld/js-ipld-graph-builder/blob/31f73c8276c3448ebe68905985e36c154da2b156/index.js#L40-L54 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `root` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

# setOptions

[index.js:20-22](https://github.com/ipld/js-ipld-graph-builder/blob/31f73c8276c3448ebe68905985e36c154da2b156/index.js#L20-L22 "Source code on GitHub")

sets [dag.put](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput) options on a JSON object

**Parameters**

-   `obj` **Object** 
-   `opts` **Object** 

# constructor

[index.js:28-32](https://github.com/ipld/js-ipld-graph-builder/blob/02c88854065f3c8b0588bcb3da2ce74572864efa/index.js#L28-L32 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)

# flush

[index.js:192-205](https://github.com/ipld/js-ipld-graph-builder/blob/02c88854065f3c8b0588bcb3da2ce74572864efa/index.js#L192-L205 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `node` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)
    -   `opts.onHash` **Function** a callback that happens on each merklized node. It is given two arguments `hash` and `node` which is the node that was hashed

Returns **Promise** 

# get

[index.js:96-100](https://github.com/ipld/js-ipld-graph-builder/blob/02c88854065f3c8b0588bcb3da2ce74572864efa/index.js#L96-L100 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `node` **Object** 
-   `path` **String** 

Returns **Promise** 

# set

[index.js:64-88](https://github.com/ipld/js-ipld-graph-builder/blob/02c88854065f3c8b0588bcb3da2ce74572864efa/index.js#L64-L88 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `node` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

# tree

[index.js:142-161](https://github.com/ipld/js-ipld-graph-builder/blob/02c88854065f3c8b0588bcb3da2ce74572864efa/index.js#L142-L161 "Source code on GitHub")

Resolves all the links in an object and does so recusivly for N `level`

**Parameters**

-   `node` **Object** 
-   `levels` **Integer** 

Returns **Promise** 

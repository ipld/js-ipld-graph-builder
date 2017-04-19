# constructor

[index.js:22-24](https://github.com/ipld/js-ipld-graph-builder/blob/c8653f6162ace4b4ca164893f3706f02fa6140d9/index.js#L22-L24 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)

# flush

[index.js:166-174](https://github.com/ipld/js-ipld-graph-builder/blob/c8653f6162ace4b4ca164893f3706f02fa6140d9/index.js#L166-L174 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `node` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)

Returns **Promise** 

# get

[index.js:110-114](https://github.com/ipld/js-ipld-graph-builder/blob/c8653f6162ace4b4ca164893f3706f02fa6140d9/index.js#L110-L114 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `node` **Object** 
-   `path` **String** 

Returns **Promise** 

# set

[index.js:41-64](https://github.com/ipld/js-ipld-graph-builder/blob/c8653f6162ace4b4ca164893f3706f02fa6140d9/index.js#L41-L64 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `node` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

# tree

[index.js:122-138](https://github.com/ipld/js-ipld-graph-builder/blob/c8653f6162ace4b4ca164893f3706f02fa6140d9/index.js#L122-L138 "Source code on GitHub")

Resolves all the links in an object and does so recusivly for N `level`

**Parameters**

-   `node` **Object** 
-   `levels` **Integer** 

Returns **Promise** 

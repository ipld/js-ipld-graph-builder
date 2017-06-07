# constructor

[index.js:28-31](https://github.com/ipld/js-ipld-graph-builder/blob/e6b992b8dcb95bb3ddc829714f744c15e2365754/index.js#L28-L31 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)

# flush

[index.js:181-194](https://github.com/ipld/js-ipld-graph-builder/blob/e6b992b8dcb95bb3ddc829714f744c15e2365754/index.js#L181-L194 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `node` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)
    -   `opts.onHash` **Function** a callback that happens on each merklized node. It is given two arguments `hash` and `node` which is the node that was hashed

Returns **Promise** 

# get

[index.js:84-88](https://github.com/ipld/js-ipld-graph-builder/blob/e6b992b8dcb95bb3ddc829714f744c15e2365754/index.js#L84-L88 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `node` **Object** 
-   `path` **String** 

Returns **Promise** 

# set

[index.js:52-76](https://github.com/ipld/js-ipld-graph-builder/blob/e6b992b8dcb95bb3ddc829714f744c15e2365754/index.js#L52-L76 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `node` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

# tree

[index.js:130-147](https://github.com/ipld/js-ipld-graph-builder/blob/e6b992b8dcb95bb3ddc829714f744c15e2365754/index.js#L130-L147 "Source code on GitHub")

Resolves all the links in an object and does so recusivly for N `level`

**Parameters**

-   `node` **Object** 
-   `levels` **Integer** 

Returns **Promise** 

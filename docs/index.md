# constructor

[index.js:28-31](https://github.com/ipld/js-ipld-graph-builder/blob/54f294bb1dd2f013167f6c87932bcaa59d71caa3/index.js#L28-L31 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)

# flush

[index.js:172-180](https://github.com/ipld/js-ipld-graph-builder/blob/54f294bb1dd2f013167f6c87932bcaa59d71caa3/index.js#L172-L180 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `node` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)

Returns **Promise** 

# get

[index.js:117-121](https://github.com/ipld/js-ipld-graph-builder/blob/54f294bb1dd2f013167f6c87932bcaa59d71caa3/index.js#L117-L121 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `node` **Object** 
-   `path` **String** 

Returns **Promise** 

# set

[index.js:48-71](https://github.com/ipld/js-ipld-graph-builder/blob/54f294bb1dd2f013167f6c87932bcaa59d71caa3/index.js#L48-L71 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `node` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

# tree

[index.js:129-145](https://github.com/ipld/js-ipld-graph-builder/blob/54f294bb1dd2f013167f6c87932bcaa59d71caa3/index.js#L129-L145 "Source code on GitHub")

Resolves all the links in an object and does so recusivly for N `level`

**Parameters**

-   `node` **Object** 
-   `levels` **Integer** 

Returns **Promise** 

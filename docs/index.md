# constructor

[index.js:22-24](https://github.com/ipld/js-ipld-graph-builder/blob/d7ec2cf17864ccaaf6fcc30b61a25af37040966f/index.js#L22-L24 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)

# flush

[index.js:138-146](https://github.com/ipld/js-ipld-graph-builder/blob/d7ec2cf17864ccaaf6fcc30b61a25af37040966f/index.js#L138-L146 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `root` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)

Returns **Promise** 

# get

[index.js:106-110](https://github.com/ipld/js-ipld-graph-builder/blob/d7ec2cf17864ccaaf6fcc30b61a25af37040966f/index.js#L106-L110 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `root` **Object** 
-   `path` **String** 

Returns **Promise** 

# set

[index.js:33-56](https://github.com/ipld/js-ipld-graph-builder/blob/d7ec2cf17864ccaaf6fcc30b61a25af37040966f/index.js#L33-L56 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `root` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

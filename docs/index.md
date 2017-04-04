# constructor

[index.js:9-11](https://github.com/ipld/js-ipld-graph-builder/blob/55d90e1319e12c71a53bfe915555c769d6514355/index.js#L9-L11 "Source code on GitHub")

**Parameters**

-   `ipfsDag` **Object** an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)

# flush

[index.js:79-95](https://github.com/ipld/js-ipld-graph-builder/blob/55d90e1319e12c71a53bfe915555c769d6514355/index.js#L79-L95 "Source code on GitHub")

flush an object to ipfs returning the resulting CID in a promise

**Parameters**

-   `root` **Object** 
-   `opts` **Object** encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)

Returns **Promise** 

# get

[index.js:67-71](https://github.com/ipld/js-ipld-graph-builder/blob/55d90e1319e12c71a53bfe915555c769d6514355/index.js#L67-L71 "Source code on GitHub")

traverses an object's path and returns the resulting value in a Promise

**Parameters**

-   `root` **Object** 
-   `path` **String** 

Returns **Promise** 

# set

[index.js:20-34](https://github.com/ipld/js-ipld-graph-builder/blob/55d90e1319e12c71a53bfe915555c769d6514355/index.js#L20-L34 "Source code on GitHub")

sets a value on a root object given its path

**Parameters**

-   `root` **Object** 
-   `path` **String** 
-   `value` **Any** 

Returns **Promise** 

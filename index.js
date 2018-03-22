const assert = require('assert')
const LockMap = require('lockmap')
const Store = require('./datastore.js')

const DEFAULTS = {
  format: 'dag-cbor',
  hashAlg: 'sha2-256'
}

function isObject (obj) {
  return typeof obj === 'object' && obj !== null
}

function clearObject (myObject) {
  for (var member in myObject) {
    delete myObject[member]
  }
}

module.exports = class Graph {
  /**
   * @param {Object} ipfsDag an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)
   */
  constructor (dag) {
    assert(dag, 'ipld-graph must have an instance of ipfs.dag')
    if (!(dag instanceof Store)) {
      dag = new Store(dag)
    }
    this._dag = dag
    this._loading = new LockMap()
  }

  async _loadCID (node, link, dropOptions) {
    const loadingOp = this._loading.get(link)
    if (loadingOp) {
      return loadingOp
    } else {
      const resolve = this._loading.lock(link)
      let value = await this._dag.get(link, node, dropOptions)
      node['/'] = value
      this._loading.delete(link)
      resolve()
    }
  }

  /**
   * given a node on the graph this returns all the leaf node that have not yet been saved
   * @param {Object} node
   * @return {Array}
   */
  findUnsavedLeafNodes (node) {
    let links = []
    for (const name in node) {
      const edge = node[name]
      if (isObject(edge)) {
        if (edge['/'] !== undefined && !this._dag.constructor.isValidLink(edge['/'])) {
          links.push(edge)
        } else {
          links = this.findUnsavedLeafNodes(edge).concat(links)
        }
      }
    }
    return links
  }

  /**
   * sets a value on a root object given its path
   * @param {Object} node
   * @param {String} path
   * @param {*} value
   * @param {boolean} noLink - if true, value is added as a plain object instead of a link
   * @return {Promise}
   */
  async set (node, path, value, noLink) {
    path = formatPath(path)
    if (!noLink) {
      value = {
        '/': value
      }
    }
    const last = path.pop()
    let {
      value: foundVal,
      remainderPath: remainder,
      parent
    } = await this._get(node, path)

    // if the found value is a litaral attach an object to the parent object
    if (!isObject(foundVal)) {
      const pos = path.length - remainder.length - 1
      const name = path.slice(pos, pos + 1)[0]
      foundVal = parent[name] = {}
    }
    // extend the path for the left over path names
    for (const name of remainder) {
      foundVal = foundVal[name] = {}
    }
    foundVal[last] = value
    return node
  }

  /**
   * traverses an object's path and returns the resulting value in a Promise
   * @param {Object} node
   * @param {String} path
   * @param {boolean} dropOptions - whether to add the encoding options of the
   * nodes when loading from IPFS. Defaults to true
   * @return {Promise}
   */
  async get (node, path, dropOptions) {
    path = formatPath(path)
    const {value} = await this._get(node, path, dropOptions)
    return value
  }

  async _get (node, path, dropOptions) {
    let parent = node
    path = path.slice(0)
    while (1) {
      const link = node['/']
      // if there is a link, traverse throught it
      if (this._dag.constructor.isValidLink(link)) {
        await this._loadCID(node, link, dropOptions)
      } else {
        if (link !== undefined) {
          // link is a POJO
          node = link
        }
        // traverse through POJOs
        if (!path.length) {
          break
        }
        const name = path.shift()
        const edge = node[name]
        node = edge
        if (isObject(edge)) {
          parent = node
        } else {
          break
        }
      }
    }
    return {
      value: node,
      remainderPath: path,
      parent: parent
    }
  }

  /**
   * Resolves all the links in an object and does so recusivly for N `level`
   * @param {Object} node
   * @param {Integer} levels
   * @param {boolean} dropOptions - whether to add the encoding options of the
   * nodes when loading from IPFS. Defaults to true
   * @return {Promise}
   */
  async tree (node, levels = 1, dropOptions) {
    const orignal = node
    if (node) {
      const link = node['/']
      if (this._dag.constructor.isValidLink(link)) {
        await this._loadCID(node, link, dropOptions)
        node = node['/']
      }
      if (levels && isObject(node)) {
        levels--
        const promises = []
        for (const name in node) {
          const edge = node[name]
          promises.push(this.tree(edge, levels, dropOptions))
        }
        await Promise.all(promises)
      }
    }
    return orignal
  }

  _flush (node, opts) {
    const links = this.findUnsavedLeafNodes(node)
    const awaiting = links.map(link => this._flush(link, opts))

    return Promise.all(awaiting).then(() => {
      const link = node['/']
      const options = Object.assign({}, opts, node.options)
      delete node.options
      return this._dag.put(link, options).then(buffer => {
        node['/'] = buffer
      })
    })
  }

  /**
   * flush an object to ipfs returning the resulting CID in a promise
   * @param {Object} node
   * @param {Object} opts - encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)
   * @param {Function} opts.onHash - a callback that happens on each merklized node. It is given two arguments `hash` and `node` which is the node that was hashed
   * @return {Promise}
   */
  async flush (node, opts = {}) {
    if (!this._dag.constructor.isValidLink(node['/'])) {
      const mergedOptions = Object.assign({}, DEFAULTS, opts)
      if (!node['/']) {
        const oldRoot = Object.assign({}, node)
        clearObject(node)
        node['/'] = oldRoot
      }
      await this._flush(node, mergedOptions)
    }
    return node
  }
}

function formatPath (path) {
  if (!path.split) {
    path = path.toString()
  }
  return path.split('/')
}

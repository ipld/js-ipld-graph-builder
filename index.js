const CID = require('cids')
const multihashes = require('multihashes')
const assert = require('assert')

function isValidCID (link) {
  try {
    CID.isCID(new CID(link))
  } catch (e) {
    return false
  }
  return true
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
  constructor (ipfsDag) {
    assert(ipfsDag, 'ipld-graph must have an instance of ipfs.dag')
    this._dag = ipfsDag
    this._loading = new Map()
  }

  _loadCID (node, link) {
    const loadingOp = this._loading.get(link)
    if (loadingOp) {
      return loadingOp
    } else {
      const promise = new Promise(async (resolve, reject) => {
        const cid = new CID(link)
        node.options = {}
        node.options.format = cid.codec
        node.options.hashAlg = multihashes.decode(cid.multihash).name
        let value = (await this._dag.get(cid)).value
        if (value && typeof value.toJSON === 'function') {
          value = value.toJSON()
        }
        node['/'] = value
        this._loading.delete(link)
        resolve()
      })
      this._loading.set(link, promise)
      return promise
    }
  }

  /**
   * sets a value on a root object given its path
   * @param {Object} node
   * @param {String} path
   * @param {*} value
   * @return {Promise}
   */
  async set (node, path, value) {
    value = {
      '/': value
    }
    path = path.split('/')
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
   * @return {Promise}
   */
  async get (node, path) {
    path = path.split('/')
    const {value} = await this._get(node, path)
    return value
  }

  async _get (node, path) {
    let parent = node
    path = path.slice(0)
    while (1) {
      const link = node['/']
      // if there is a link, traverse throught it
      if (isValidCID(link)) {
        await this._loadCID(node, link)
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
   * @return {Promise}
   */
  async tree (node, levels = 1) {
    const orignal = node
    if (isObject(node)) {
      const link = node['/']
      if (isValidCID(link)) {
        await this._loadCID(node, link)
        node = node['/']
      }
      if (levels) {
        levels--
        const promises = []
        for (const name in node) {
          const edge = node[name]
          promises.push(this.tree(edge, levels))
        }
        await Promise.all(promises)
      }
    }
    return orignal
  }

  async _flush (node, opts) {
    const awaiting = []
    if (isObject(node)) {
      for (const name in node) {
        const edge = node[name]
        awaiting.push(this._flush(edge, opts))
      }

      await Promise.all(awaiting)

      const link = node['/']
      if (link !== undefined && !isValidCID(link)) {
        let options = Object.assign(opts, node.options)
        delete node.options
        return this._dag.put(link, options).then(cid => {
          const str = cid.toBaseEncodedString()
          node['/'] = str
        })
      }
    }
  }

  /**
   * flush an object to ipfs returning the resulting CID in a promise
   * @param {Object} node
   * @param {Object} opts - encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)
   * @param {Function} opts.onHash - a callback that happens on each merklized node. It is given two arguments `hash` and `node` which is the node that was hashed
   * @return {Promise}
   */
  async flush (node, opts = {}) {
    const defaults = {
      format: 'dag-cbor',
      hashAlg: 'sha2-256'
    }
    Object.assign(opts, defaults)
    if (!node['/']) {
      const oldRoot = Object.assign({}, node)
      clearObject(node)
      node['/'] = oldRoot
    }
    await this._flush(node, opts)
    return node
  }
}

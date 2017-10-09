const CID = require('cids')
const multihashes = require('multihashes')

module.exports = class Store {
  constructor (dag) {
    this._dag = dag
  }

  put (val, options) {
    return this._dag.put(val, options).then(link => link.buffer)
  }

  get (link, node, dropOptions = false) {
    const cid = new CID(link)
    if (!dropOptions) {
      node.options = {}
      node.options.format = cid.codec
      node.options.hashAlg = multihashes.decode(cid.multihash).name
    }
    return this._dag.get(cid).then(node => node.value)
  }

  static isValidLink (link) {
    try {
      const cid = new CID(link)
      return CID.isCID(cid)
    } catch (e) {
      return false
    }
  }
}

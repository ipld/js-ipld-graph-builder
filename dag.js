const CID = require('cids')
const multihashes = require('multihashes')
const Buffer = require('safe-buffer').Buffer

module.exports = class DAGoverlay {
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

  isValidLink (link) {
    return Buffer.isBuffer(link)
    // try {
    //   const cid = new CID(link)
    //   CID.isCID(cid)
    //   return cid
    // } catch (e) {
    //   return false
    // }
  }
}

module.exports = class Link {
  /**
   * a merkle link
   * @param {string} hash the hash of the merkle link
   */
  constructor (merklelink) {
    this.hash = merklelink['/']
  }

  toBuffer () {
    return this.hash
  }
}

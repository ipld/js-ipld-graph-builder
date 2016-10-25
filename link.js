module.exports = class Link {
  /**
   * a merkle link
   * @param {string} hash the hash of the merkle link
   */
  constructor (hash) {
    this.hash = hash
  }

  toBuffer () {
    return this.hash
  }
}

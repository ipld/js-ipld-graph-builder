const tape = require('tape')
const IPFS = require('ipfs')
const CID = require('cids')
const Graph = require('../')

const node = new IPFS()
node.on('error', err => {
  console.log(err)
})

node.on('start', () => {
  tape('testing graph builder', async t => {
    const graph = new Graph(node.dag)
    const a = {
      some: {
        thing: 'nested'
      }
    }
    const b = {
      lol: 'test'
    }
    let expect = {
      some: {
        thing: {
          else: {
            here: {
              '/': {
                lol: 'test'
              }
            }
          }
        }
      }
    }

    await graph.set(a, 'some/thing/else/here', b)
    t.deepEquals(a, expect, 'should set a value correctly')
    await graph.set(a, 'some', b)
    expect = {
      some: {
        '/': {
          'lol': 'test'
        }
      }
    }
    t.deepEquals(a, expect, 'should set a value correctly')

    const some = await graph.get(expect, 'some')
    t.deepEquals(some, {'lol': 'test'}, 'should traverse objects with links')

    const cid = await graph.flush(a)
    let result = await node.dag.get(new CID(cid['/']), 'some/lol')
    t.deepEquals(result.value, 'test', 'should flush to dag store')

    result = await node.dag.get(new CID(cid['/']))

    let getResult = await graph.get(result.value, 'some/lol')
    t.deepEquals(getResult, 'test', 'should get a value correctly')

    getResult = await graph.get(expect, 'some/lol')
    t.deepEquals(getResult, 'test', 'should get a value correctly')

    t.end()
  })

  tape('flushing multiple leaf values', async t => {
    const graph = new Graph(node.dag)
    const a = {
      '/': {
        thing: {
          two: {
            '/': {
              lol: 'test'
            }
          },
          else: {
            '/': {
              lol: 'test'
            }
          }
        }
      }
    }

    const b = a['/']
    const expectedA = {
      '/': 'zdpuAncHcnA7MJnwFrxY8JxFQ5i8secxvWcWuLiktwatTgpxf'
    }
    const expectedB = {
      thing: {
        two: {
          '/': 'zdpuB1BH4aTUFEXbCxESk41PQieE1fLcpPcmFnqd89ZPtJWaf'
        },
        else: {
          '/': 'zdpuB1BH4aTUFEXbCxESk41PQieE1fLcpPcmFnqd89ZPtJWaf'
        }
      }
    }
    const expectedTee = {
      '/': {
        'thing': {
          'two': {
            '/': {
              'lol': 'test'
            },
            'options': {
              'format': 'dag-cbor',
              'hashAlg': 'sha2-256'
            }
          },
          'else': {
            '/': {
              'lol': 'test'
            },
            'options': {
              'format': 'dag-cbor',
              'hashAlg': 'sha2-256'
            }
          }
        }
      },
      'options': {
        'format': 'dag-cbor',
        'hashAlg': 'sha2-256'
      }
    }

    await graph.flush(a)
    t.deepEquals(a, expectedA, 'should flush correctly')
    t.deepEquals(b, expectedB, 'should flush correctly')

    const copyA = Object.assign({}, a)
    await graph.tree(a)
    t.equals(a['/']['thing']['two']['/'].toString('hex'), '01711220db3e85891631bb4fa52af90bb7af455f4a6982fd28a5e7060ac485d3f6b4ca4c', 'should load one level')

    await graph.tree(a, Infinity)
    t.deepEquals(a, expectedTee)

    const val = await graph.get(copyA, 'thing/two/lol')
    t.equals(val, 'test', 'should find the corret value')
    t.end()
  })
  tape('testing setting leaf values', async t => {
    const graph = new Graph(node.dag)
    const a = {
      some: {
        thing: 'nested'
      }
    }
    const b = {
      lol: 'test'
    }
    let expect = {
      some: {
        thing: {
          else: {
            '/': {
              lol: 'test'
            }
          }
        }
      }
    }

    await graph.set(a, 'some/thing/else', b)
    t.deepEquals(a, expect, 'should set a value correctly')
    await graph.set(a, 'some', b)
    expect = {
      some: {
        '/': {
          'lol': 'test'
        }
      }
    }
    t.deepEquals(a, expect, 'should set a value correctly')

    t.end()
  })

  tape('failure cases', async t => {
    const graph = new Graph(node.dag)
    const value = {
      '/': {
        id: {
          nonce: Buffer.from([0]),
          parent: {
            '/': null
          }
        },
        type: 'test',
        vm: {
          '/': ''
        }
      }
    }

    const expected = {
      '/': 'zdpuAvtdKSdBZgMcRa7VG6rrAPBu77LbainVF6oNEEE8cp8yW'
    }

    await graph.flush(value)
    t.deepEquals(value, expected)

    const testGet = {
      '/': {
        nonce: Buffer.from([0]),
        parent: {
          '/': null
        }
      }
    }

    const result = await graph.get(testGet, 'parent')
    t.equals(result, null)

    node.stop(() => {
      t.end()
      process.exit()
    })
  })
})

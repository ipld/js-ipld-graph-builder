const tape = require('tape')
const IPFS = require('ipfs')
const CID = require('cids')
const Graph = require('../')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode

const node = new IPFS({
  start: false
})

node.on('ready', () => {
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
    t.deepEquals(some, {
      'lol': 'test'
    }, 'should traverse objects with links')

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
      lol: Buffer.from([0])
    }
    let expect = {
      some: {
        thing: {
          else: {
            '/': {
              lol: Buffer.from([0])
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
          'lol': Buffer.from([0])
        }
      }
    }
    t.deepEquals(a, expect, 'should set a value correctly')

    t.end()
  })

  tape('ProtoBufs', async t => {
    const graph = new Graph(node.dag)

    const expected = {
      '/': {
        data: Buffer.from([0x73, 0x6f, 0x6d, 0x65, 0x20, 0x64, 0x61, 0x74, 0x61]),
        links: [],
        multihash: 'Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr',
        size: 11
      },
      options: {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      }
    }

    DAGNode.create(Buffer.from('some data'), async (err, node1) => {
      console.log(err)
      const r = await node.dag.put(node1, {format: 'dag-pb'})
      const json = {
        '/': r.multihash
      }
      await graph.tree(json, Infinity)
      t.deepEquals(json, expected)
      t.end()
    })
  })

  tape('failure cases', async t => {
    const graph = new Graph(node.dag)
    const value = {
      '/': {
        id: {
          nonce: [0],
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

    const expectedTree = {
      '/': {
        'id': {
          'nonce': [0],
          'parent': {
            '/': null,
            'options': {
              'format': 'dag-cbor',
              'hashAlg': 'sha2-256'
            }
          }
        },
        'vm': {
          '/': '',
          'options': {
            'format': 'dag-cbor',
            'hashAlg': 'sha2-256'
          }
        },
        'type': 'test'
      },
      'options': {
        'format': 'dag-cbor',
        'hashAlg': 'sha2-256'
      }
    }
    const expected = {
      '/': 'zdpuAx5z8MCXxywGK9FiBDaj7tVCC4zZs7ficVRD2w5hvo4vG'
    }

    const expected2 = Object.assign({}, expected)

    await graph.flush(value)
    t.deepEquals(value, expected)

    const testGet = {
      '/': {
        nonce: [0],
        parent: {
          '/': null
        }
      }
    }

    let result = await graph.get(testGet, 'parent')
    t.equals(result, null)
    await graph.tree(expected, Infinity)
    t.deepEquals(expected, expectedTree, 'tree should travers graph with null leafs')

    await graph.flush(expected)
    t.deepEquals(expected, expected2, 'should round trip')

    const singlePath = {
      '/': {
        parent: null
      }
    }

    result = await graph.get(singlePath, 'parent')
    t.equals(result, null, 'should get null value')

    t.end()
  })

  tape('testing sequentail consistances', async t => {
    const graph = new Graph(node.dag)
    let test = {
      some: {
        thing: {
          else: {
            '/': {
              lol: {
                test: 1
              }
            }
          }
        }
      }
    }

    await graph.flush(test)
    const a = graph.get(test, 'some/thing/else/lol')
    const b = graph.get(test, 'some/thing/else/lol')
    const r = await Promise.all([a, b])
    t.equals(r[0], r[1])

    t.end()
  })
})

const tape = require('tape')
const IPFS = require('ipfs')
const CID = require('cids')
const Graph = require('../')
const Datastore = require('../datastore.js')

const node = new IPFS({
  start: false
})

node.on('ready', () => {
  tape('testing graph builder', async t => {
    const graph = new Graph(new Datastore(node.dag))
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
      '/': Buffer.from('01711220207ebd54e4992fbd944fca95bb84825d0153e87caa61fb742ba9e98fbbeb2710', 'hex')
    }
    const expectedB = {
      thing: {
        two: {
          '/': Buffer.from('01711220db3e85891631bb4fa52af90bb7af455f4a6982fd28a5e7060ac485d3f6b4ca4c', 'hex')
        },
        else: {
          '/': Buffer.from('01711220db3e85891631bb4fa52af90bb7af455f4a6982fd28a5e7060ac485d3f6b4ca4c', 'hex')
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

    const expectedTeeNoOps = {
      '/': {
        'thing': {
          'two': {
            '/': {
              'lol': 'test'
            }
          },
          'else': {
            '/': {
              'lol': 'test'
            }
          }
        }
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

    await graph.flush(a)
    await graph.tree(a, Infinity, true)
    t.deepEquals(a, expectedTeeNoOps, 'should tree correctly with no ops')

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

  tape('testing setting leaf values as plain objects', async t => {
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
            lol: Buffer.from([0])
          }
        }
      }
    }

    await graph.set(a, 'some/thing/else', b, true)
    t.deepEquals(a, expect, 'should set a value correctly')
    await graph.set(a, 'some', b, true)
    expect = {
      some: {
        'lol': Buffer.from([0])
      }
    }
    t.deepEquals(a, expect, 'should set a value correctly')

    t.end()
  })

  tape('testing setting leaf values in a subtree as plain objects', async t => {
    const graph = new Graph(node.dag)
    const a = {
      some: {
        thing: 'nested'
      }
    }
    const b = {
      lol: {
        trololo: 'lololo'
      }
    }
    let expect = {
      some: {
        thing: {
          else: {
            '/': {
              lol: {
                trololo: 'lololo'
              }
            }
          }
        }
      }
    }

    await graph.set(a, 'some/thing/else', b)
    t.deepEquals(a, expect, 'should set a value correctly')
    const c = 'stc'
    await graph.set(a, 'some/thing/else/lol/rofl', c, true)
    expect = {
      some: {
        thing: {
          else: {
            '/': {
              lol: {
                trololo: 'lololo',
                rofl: 'stc'
              }
            }
          }
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
      '/': Buffer.from('01711220ad50688a54e58cff28d2f727754a61d3349c66b1dbe2eafb344ec78edcae54fd', 'hex')
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
    const r = await graph.tree(expected, Infinity)
    t.equals(r, expected, 'tree should also return the correct result')
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

    try {
      const graph2 = new Graph(node.dag)
      const root = {
        '/': Buffer.from('01711220ad58688a54e58cff28d2f727754a61d3349c66b1dbe2eafb344ec78edcae54fd', 'hex')
      }
      await graph2.get(root, 'test/test/test')
    } catch (e) {
      t.end()
    }
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

  tape('testing ints as keys', async t => {
    const graph = new Graph(node.dag)
    let test = ['test']

    await graph.flush(test)
    const b = await graph.get(test, 0)
    t.equals(b, 'test')

    await graph.set(test, 1, 'test2')
    await graph.flush(test)
    const c = await graph.get(test, 1)

    t.equals(c, 'test2')

    t.end()
  })

  tape('flushing the same root mutliple time should have the same result', async t => {
    const graph = new Graph(node.dag)
    let test = { '/': ['test'] }

    await graph.flush(test)
    const r1 = test['/'].toString('hex')

    await graph.flush(test)
    const r2 = test['/'].toString('hex')
    t.equals(r1, r2)

    t.end()
  })
})

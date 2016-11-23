import m from 'mithril'
import msearch from '../src'

m.mount(test, m(msearch, {
  outer: {
    config: function (e, old, context, node) {console.log(this ,node)},
    style: {width: '100px'}
  },
  clear: {
    style: {width: '10px'}
  },
  clearChar: 'x',
  onclear: v=> console.log('content cleared')
}))

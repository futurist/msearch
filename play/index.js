import m from 'mithril'
import msearch from '../src'

m.mount(test, m(msearch, {
  css:{
    '.clear':{
      width: '25px'
    }
  },
  outer: {
    style: {width: '100px'}
  },
  input: {
    oninput: function (e) {
      console.log(this.value)
    }
  },
  clear: {
    style: {height: '10px'}
  },
  clearChar: 'x',
  onclear: v=> console.log('content cleared')
}))

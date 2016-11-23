import m from 'mithril'
import msearch from '../src'

msearch.config({
  '.clear':{
    width: '25px'
  }
}, 'x')

m.mount(test, m(msearch, {
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
  onclear: v=> console.log('content cleared')
}))

m.mount(test2, m(msearch, {
  outer: {
    style: {width: '200px'}
  },
  input: {
    oninput: function (e) {
      console.log(222, this.value)
    }
  },
  clearChar: 'xx',
  onclear: v=> console.log('content 222 cleared')
}))

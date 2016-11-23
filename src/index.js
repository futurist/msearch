import mithril from 'mithril'
import cssobj_mithril from 'cssobj-mithril'
import cssobj from 'cssobj'
import objutil from 'objutil'

const css = {
  '.input': {
    position: 'relative',
    input: {
      boxSizing: 'border-box',
      width: '100%',
      paddingRight: '15px'
    }
  },
  '.clear': {
    position: 'absolute',
    width: '15px',
    top: 0,
    right: 0,
    color: 'gray',
    textDecoration: 'none',
    textAlign: 'center',
    '&:hover':{
      color: 'black'
    }
  }
}

const m = cssobj_mithril(mithril)(cssobj(
  css,
  {
    local: true
  }
))

const mSearch = {
  controller(options) {
    const ctrl = this
    ctrl.options = options = objutil.defaults(options, {
      clearChar: '×',
      outer: {},
      input: {},
      clear: {
        onclick: e => {
          const input = e.target.previousSibling
          input.value = ''
          input.focus()
          if(typeof options.onclear=='function'){
            options.onclear(e)
          }
        }
      }
    })
    const oldConfig = options.input.config
    options.input.config = (el, old, ctx, node) => {
      if(old) return
      if(typeof oldConfig=='function') {
        oldConfig.apply(node, arguments)
      }
      const style = el.nextSibling.style
      if('width' in style) {
        el.style.paddingRight = style.width
      }
    }
  },
  view(ctrl) {
    const options = ctrl.options
    return m(
      '.input',
      options.outer,
      [
        m('input', options.input),
        m('a.clear[href=javascript:;]', options.clear, options.clearChar)
      ]
    )
  }
}

export default mSearch

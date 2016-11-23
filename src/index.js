import mithril from 'mithril'
import cssobj_mithril from 'cssobj-mithril'
import cssobj from 'cssobj'
import defaultUnit from 'cssobj-plugin-default-unit'
import objutil from 'objutil'

const css = {
  '.input': {
    border: '1px solid red',
    position: 'relative',
    width: 100,
    input: {
      boxSizing: 'border-box',
      width: 60
    }
  },
  '.clear, .confirm': {
    position: 'absolute',
    width: 20,
    top: 0,
    right: 0,
    color: 'gray',
    textDecoration: 'none',
    textAlign: 'center',
    '&:hover':{
      color: 'black'
    }
  },
  '.clear': {
    right: 20
  }
}

const m = cssobj_mithril(mithril)(cssobj(
  css,
  {
    local: true,
    plugins: [
      defaultUnit()
    ]
  }
))

const mSearch = {
  controller(options) {
    const ctrl = this
    ctrl.options = objutil.defaults(options, {
      hasClear: true,
      hasConfirm: true
    })
  },
  view(ctrl) {
    const options = ctrl.options
    return m('.input', [
      m('input'),
      options.hasClear ? m('a.clear[href=javascript:;]', '×') : [],
      options.hasConfirm ? m('a.confirm[href=javascript:;]', '✓') : []
    ])
  }
}

export default mSearch

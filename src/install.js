import View from './components/view'
import Link from './components/link'

export let _Vue
class VueRouterLayer {
  constructor (router, layer) {
    this.router = router
    this.layer = layer
  }

  push (location, onComplete, onAbort) {
    return this.router.pushLayer(this.layer, location, onComplete, onAbort)
  }

  replace (location, onComplete, onAbort) {
    return this.router.replaceLayer(this.layer, location, onComplete, onAbort)
  }
}

export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        this._routerLayer = 0
        Vue.util.defineReactive(this, '_routes', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
        this._routerLayer = this.$parent ? this.$parent._routerLayer : 0
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$routerLayer', {
    get () { return new VueRouterLayer(this._routerRoot._router, this._routerLayer) }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._routes[this._routerLayer] }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}

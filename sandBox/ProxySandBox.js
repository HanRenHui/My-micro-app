export default class ProxySandBox {
    constructor() {
        this.proxy = null
        this.map = {}
        this.active()
    }

    active() {
        this.proxy = new Proxy(window, {
            get: (target, k) => {
                let v =  this.map[k] ? this.map[k] : target[k]
                if (typeof v === 'function') {
                    v = v.bind(target)
                }
                return v
            },
            set: (target, k, v) => {
                this.map[k] = v
                return true;
            }
        })
    }

    unActive() {
        this.map = {}       
    }
}
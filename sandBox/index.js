import ProxySandBox from './ProxySandBox';

function performScript(script, app, global) {
    window.proxy = global
    console.log(12232323, script)
    const scriptText = `
        return ((window) => {
            const module = {exports: {}}
            const exports = module.exports
            ;${script}
            console.log(111111, module.exports, exports === module.exports)
            return exports
        }
        )(window.proxy)
    `
    return new Function(scriptText)()
}

function isLifeCycle(lifeCycle) {
    return lifeCycle && lifeCycle.bootstrap && lifeCycle.mount && lifeCycle.unmount
}

export const sandBox =  (script, app) => {
    if (!app.proxy) {
        app.proxy = new ProxySandBox()
    } 
    
    window.__MICRO_WEB__ = true;

    const lifeCycle = performScript(script, app, app.proxy.proxy)
    console.log('lifeCycle', lifeCycle)
    if (isLifeCycle(lifeCycle)) {
        app.mount = lifeCycle.mount
        app.unmount = lifeCycle.unmount
        app.bootstrap = lifeCycle.bootstrap
    }
}
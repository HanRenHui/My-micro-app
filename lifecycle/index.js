import { getList } from './../const/subApp'
import { getLifyCycle } from './../const/lifeCycle'
import { sandBox } from './../sandBox/index';

function findApp(key) {
    return getList().find(item => {
        return item.activeRule === key
    } )
}

async function runMainLifeCycle(key) {
    await Promise.all(getLifyCycle()[key].map(async item => await item()))
}

export async function lifeCycle() {
    const preApp = findApp(window.__ORIGIN_APP__)    
    const nextApp = findApp(window.__CURRENT_APP__)
    
    if (!nextApp) {
        return;
    }
    if(preApp) {
        await unmount(preApp)
    }

    const app = await beforeLoad(nextApp)

    await mount(app)
}

async function unmount(app) {
    app.proxy.unActive()
    await app.unmount && app.unmount()
    await runMainLifeCycle('destroyed')
}

const cache = {}

export async function parseHtml(app) {
    if (cache[app.name]) return cache[app.name]

    const res = await fetch(app.entry)
    const htmlContent = await res.text()

    let allScripts = []

    const div = document.createElement('div')
    div.innerHTML = htmlContent
    const [dom, scriptUrls, scripts] = getResources(div, app)
    const scriptContents = await Promise.all(scriptUrls.map(async url => {
        const res = await fetch(url)
        return await res.text()
    }))
    allScripts = [...scripts, ...scriptContents]

    cache[app.name] = [dom, allScripts]

    return [dom, allScripts]
}

async function beforeLoad(app) {
    runMainLifeCycle('beforeLoad')

    const [dom, allScripts] = await parseHtml(app)

    // app.beforeLoad && app.beforeLoad()
    const el = document.querySelector(app.container)

    el.innerHTML = dom;

    allScripts.forEach(s => sandBox(s, app))
    
    return app
    // return appContext
}

function mount(app) {
    app.mount && app.mount()
    runMainLifeCycle('mounted')
}

function getResources(root, app) {
    const { entry } = app
    const scripts = []
    const scriptUrls = []
    const deepParse = (ele) => {
        if (!ele) return;
        if(ele.tagName.toLowerCase() === 'script') {
            if (ele.src) {
                if (ele.src.startsWith('http')) {
                    scriptUrls.push(ele.src)
                } else {
                    scriptUrls.push(`http:${entry}${ele.src}`)
                }
            } else {
                scripts.push(ele.innerHTML)
            }
            ele.parentNode && ele.parentNode.replaceChild(document.createComment('哈哈哈已被替换'), ele)
        }
        if (ele.children) {
            Array.from(ele.children).forEach(child => deepParse(child))
        }
    }
    deepParse(root)
    const dom = root.outerHTML
    return [
        dom, 
        scriptUrls,
        scripts
    ]
}
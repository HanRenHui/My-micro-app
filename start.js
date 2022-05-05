import { setList, getList } from './const/subApp'
import { setLifyCycle } from './const/lifeCycle'
import { rewriteRouter } from './router'
import { parseHtml } from './lifecycle/index'


export const registerMicroApps = (appList, lifyCycle) => {
    setList(appList)
    setLifyCycle(lifyCycle)
}

async function preFetch() {
    const pathname = window.location.pathname
    const currentRule = pathname.match(/^\/\w+/)[0]
    const apps = getList().filter(item => item.activeRule !== currentRule)
    Promise.all(apps.map(async app => parseHtml(app)))
}

export const start = () => {

    rewriteRouter()

    const list = getList()
    const pathname = window.location.pathname
    const currentRule = pathname.match(/^\/\w+/)[0]
    const targetAppItem = list.find(item => {
        return item.activeRule === currentRule
    } )
    if (targetAppItem) {
        const { pathname, hash } = window.location
        const url = pathname + hash
        window.history.pushState('', '', url)
        window.__CURRENT_APP__ = targetAppItem.activeRule
    }

    preFetch()
}
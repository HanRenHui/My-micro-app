import { lifeCycle } from '../lifecycle/index';

function patchRouter(originEvent, eventName) {
  return function () {
    const e = new Event(eventName);
    originEvent.apply(this, arguments);
    window.dispatchEvent(e);
  };
}

function shouleTure() {
  window.__PRE_APP__ = window.__CURRENT_APP__;
  const pathname = window.location.pathname.match(/^\/\w+/)[0];
  if (pathname === window.__CURRENT_APP__) {
    return false;
  }
  window.__CURRENT_APP__ = pathname;
  return true;
}

function tureApp() {
  if (!shouleTure()) {
    return;
  }
  console.log('路由跳转了');
  lifeCycle();
}

export function rewriteRouter() {
  window.history.pushState = patchRouter(
    window.history.pushState,
    'micro_push'
  );
  window.history.replaceState = patchRouter(
    window.history.replaceState,
    'micro_replace'
  );

  window.addEventListener('micro_push', tureApp);
  window.addEventListener('micro_replace', tureApp);
  window.addEventListener('popstate', tureApp);
}

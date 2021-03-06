// @flow

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import alaska from 'alaska';
import random from 'string-random';
import pathToRegexp from 'path-to-regexp';
import Session from './session';

export default function (options: Alaska$Config$session) {
  const storeOpts = options.store || {};
  const cookieOpts = options.cookie || {};
  const key: string = cookieOpts.key || 'alaska.sid';
  // $Flow require参数需要为字符串
  const Store = require(storeOpts.type).default;
  const store = new Store(alaska.main, storeOpts);
  let ignore: ?RegExp[] = null;

  function convert(input) {
    if (typeof input === 'string') {
      // $Flow
      ignore.push(pathToRegexp(input));
    } else if (input.test) {
      // $Flow
      ignore.push(input);
    } else {
      throw new Error('Invalid session ignore option: ' + String(input));
    }
  }

  if (options.ignore) {
    ignore = [];
    if (Array.isArray(options.ignore)) {
      options.ignore.forEach(convert);
    } else {
      convert(options.ignore);
    }
  }

  return async function sessionMiddleware(ctx: Alaska$Context, next: Function) {
    if (ignore) {
      for (let reg of ignore) {
        if (reg.test(ctx.path)) {
          await next();
          return;
        }
      }
    }
    ctx.sessionKey = key;
    let sid = '';
    if (cookieOpts && cookieOpts.get) {
      ctx.sessionId = cookieOpts.get(ctx, key, cookieOpts);
      sid = ctx.sessionId;
    } else {
      // $Flow
      ctx.sessionId = ctx.cookies.get(key, cookieOpts);
      sid = ctx.sessionId;
    }
    let json;
    let session;

    if (sid) {
      json = await store.get(sid);
    } else {
      ctx.sessionId = random(24);
      sid = ctx.sessionId;
      if (cookieOpts && cookieOpts.set) {
        cookieOpts.set(ctx, key, sid, cookieOpts);
      } else {
        ctx.cookies.set(key, sid, cookieOpts);
      }
    }

    if (json) {
      ctx.sessionId = sid;
      try {
        session = new Session(ctx, json);
      } catch (err) {
        if (!(err instanceof SyntaxError)) {
          throw err;
        }
        session = new Session(ctx, {});
      }
    } else {
      session = new Session(ctx, {});
    }

    // $Flow
    Object.defineProperty(ctx, 'session', {
      get() {
        if (session) return session;
        if (session === false) return null;
        return null;
      },
      set(val) {
        if (val === null) return (session = false);
        if (typeof val === 'object') return (session = new Session(ctx, val));
        throw new Error('ctx.session can only be set as null or an object.');
      }
    });

    let jsonString = JSON.stringify(json);

    function onNext() {
      if (session === false) {
        // 清除Session
        if (cookieOpts && cookieOpts.set) {
          cookieOpts.set(ctx, key, '', cookieOpts);
        } else {
          ctx.cookies.set(key, '', cookieOpts);
        }
        store.del(sid);
      } else if (!json && !session.length) {
        // 未更改
      } else if (session.isChanged(jsonString)) {
        // 保存
        json = session.toJSON();
        store.set(sid, json);
      }
    }

    try {
      await next();
      onNext();
    } catch (error) {
      onNext();
    }
  };
}

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import fs from 'mz/fs';
import mime from 'mime';
import * as util from '../util';

export default function loadAppMiddlewares() {
  this.loadAppMiddlewares = util.noop;
  let app = this.alaska.app;
  let alaska = this.alaska;
  let service = this;
  const locales = this.config('locales');
  const localeCookieKey = this.config('localeCookieKey');
  const localeQueryKey = this.config('localeQueryKey');
  app.use(function (ctx, next) {
    ctx.set('X-Powered-By', 'Alaska');
    ctx.service = service;
    ctx.alaska = alaska;

    //切换语言
    if (localeQueryKey) {
      if (ctx.query[localeQueryKey]) {
        let locale = ctx.query[localeQueryKey];
        if (locales.indexOf(locale) > -1) {
          ctx._locale = locale;
          ctx.cookies.set(localeCookieKey, locale, {
            maxAge: 365 * 86400 * 1000
          });
        }
      }
    }

    /**
     * 发送文件
     * @param {string} filePath
     * @param {Object} options
     */
    ctx.sendfile = async function (filePath, options) {
      options = options || {};
      let trailingSlash = '/' === filePath[filePath.length - 1];
      let index = options.index;
      if (index && trailingSlash) filePath += index;
      let maxage = options.maxage || options.maxAge || 0;
      let hidden = options.hidden || false;
      if (!hidden && util.isHidden(filePath)) return;

      let stats;
      try {
        stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          if (index) {
            filePath += '/' + index;
            stats = await fs.stat(filePath);
          } else {
            return;
          }
        }
      } catch (err) {
        let notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
        if (~notfound.indexOf(err.code)) return;
        err.status = 500;
        throw err;
      }
      ctx.set('Last-Modified', stats.mtime.toUTCString());
      ctx.set('Content-Length', stats.size);
      ctx.set('Cache-Control', 'max-age=' + (maxage / 1000 | 0));
      ctx.type = options.type || mime.lookup(filePath);
      ctx.body = fs.createReadStream(filePath);
    };
    return next();
  });
  this.config('appMiddlewares', []).forEach(function (name) {
    if (typeof name === 'function') {
      //数组中直接就是一个中间件函数
      app.use(name);
      return;
    }
    let options;
    if (typeof name === 'object') {
      options = name.options;
      name = name.name;
    }
    if (name.startsWith('.')) {
      //如果是一个文件路径
      name = service.dir + '/' + name;
    }
    let middleware = require(name);
    app.use(middleware(options));
  });
}

// @flow

import path from 'path';

export default async function loadStatics() {
  this.loadStatics = Promise.resolve();

  for (let sub of this.serviceList) {
    await sub.loadStatics();
  }

  this.debug('loadStatics');

  this.config('statics', []).forEach((c) => {
    let root = path.resolve(this.dir, c.root);
    let prefix = (c.prefix || '') + '/*';
    let prefixLength = this.config('prefix').length + c.prefix.length;
    let index = c.index === false ? false : (c.index || 'index.html');
    this.router.register(prefix, ['GET', 'HEAD'], async(ctx, next) => {
      await next();
      if (ctx.body != null || ctx.status !== 404) return;
      let filePath = root;
      if (prefixLength) {
        filePath += ctx.path.substr(prefixLength);
      } else {
        filePath += ctx.path;
      }
      await ctx.sendfile(filePath, {
        index,
        maxAge: c.maxAge
      });
    });
  });
};
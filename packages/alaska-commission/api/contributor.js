// @flow

import _ from 'lodash';
import User from 'alaska-user/models/User';
import service from '../';

export default async function (ctx: Alaska$Context) {
  let _user: ?Object = ctx.user || service.error(403);
  let user: Object = _user || {};
  let obj: Object = await User.paginate({
    page: parseInt(ctx.state.page || ctx.query._page) || 1,
    limit: parseInt(ctx.state.limit || ctx.query._limit) || 10,
    filters: _.assign({}, {
      promoter: user._id
    }, ctx.state.filters)
  });
  // $Flow results 查询返回结果，类型不定 line 19
  ctx.body.results = _.map(obj.results, (u) => u.data(ctx.state.scope || 'tiny'));
}

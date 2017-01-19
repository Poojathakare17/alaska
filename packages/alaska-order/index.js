// @flow

import alaska, { Service } from 'alaska';

class OrderService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-order';
    super(options);
  }

  preLoadConfig() {
    let PAYMENT: any = alaska.service('alaska-payment', true);
    if (PAYMENT) {
      PAYMENT.addConfigDir(__dirname + '/config/alaska-payment');
    }
  }
}

export default new OrderService();

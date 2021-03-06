// @flow

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import { Service } from 'alaska';
import _ from 'lodash';

class SmsService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.id = options.id || 'alaska-sms';
    options.dir = options.dir || __dirname;
    super(options, alaska);
  }

  preLoadModels() {
    let drivers = this.config('drivers');
    if (!drivers || !Object.keys(drivers).length) {
      throw new Error('No sms driver found');
    }
    let driversOptions = [];
    let defaultDriver;
    let driversMap = {};
    _.forEach(drivers, (options, key) => {
      let label = options.label || key;
      driversOptions.push({ label, value: key });
      let driver;
      if (_.isFunction(options.send)) {
        //已经实例化的driver
        driver = options;
      } else {
        driver = this.createDriver(options);
      }
      driversMap[key] = driver;
      if (!defaultDriver || driver.default) {
        defaultDriver = driver;
      }
    });
    this.driversOptions = driversOptions;
    this.defaultDriver = defaultDriver;
    this.driversMap = driversMap;
  }

  driversOptions: Object[];
  defaultDriver: any;
  driversMap: Object;
}

export default new SmsService();

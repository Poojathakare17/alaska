import _ from 'lodash';
import BALANCE from 'alaska-balance';

export const fields = {
  currency: {
    label: 'Currency',
    type: 'select',
    options: BALANCE.currencies
  }
};

export default function (Payment) {
  if (_.find(Payment.fields.type.options, (opt) => opt.value === 'balance')) return;
  Payment.fields.type.options.push({ label: 'Balance', value: 'balance' });
}

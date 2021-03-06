// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getOptionValue } from './utils';

export default class SelectFieldCell extends React.Component {

  static contextTypes = {
    t: PropTypes.func
  };

  props: {
    value: any,
    field: Object,
    model: Object,
  };

  shouldComponentUpdate(props: Object) {
    /* eslint eqeqeq:0 */
    return props.value != this.props.value;
  }

  render() {
    const t = this.context.t;
    let { field, value, model } = this.props;
    let el;
    let cls = 'select-field-cell';

    if (field.multi) {
      el = [];
      let valueMap = {};
      _.forEach(value, (v) => (valueMap[getOptionValue(v)] = true));
      _.forEach(field.options, (opt) => {
        if (valueMap[opt.value]) {
          let label = opt.label || opt.value;
          if (field.translate !== false) {
            label = t(label, model.serviceId);
          }
          if (el.length) {
            el.push(' , ');
          }
          let c;
          if (opt.style) {
            c = 'text-' + opt.style;
          }
          el.push(<span className={c} key={opt.value}>{label}</span>);
        }
      });
    } else {
      let option = _.find(field.options, (opt) => opt.value === value);
      el = option ? option.label : value;
      if (field.translate !== false) {
        el = t(el, model.serviceId);
      }
      if (option && option.style) {
        cls += ' text-' + option.style;
      }
    }
    return <div className={cls}>{el}</div>;
  }
}

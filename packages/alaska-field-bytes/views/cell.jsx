// @flow

import React from 'react';
import _ from 'lodash';

const { string, any } = React.PropTypes;

export default class BytesFieldCell extends React.Component {

  static propTypes = {
    value: string,
    field: any
  };

  shouldComponentUpdate(props: Object) {
    return props.value !== this.props.value;
  }

  render() {
    const { value, field } = this.props;
    let display = value || '';
    if (display) {
      let { unit, size, precision } = field;
      let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
      while (display > size && units.length > 1) {
        display /= size;
        units.shift();
      }
      display = _.round(display, precision) + units[0] + unit;
    }
    return (
      <div>{display}</div>
    );
  }
}

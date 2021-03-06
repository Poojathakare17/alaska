// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import DateTime from 'react-datetime';
import moment from 'moment';
// $Flow
import 'moment/locale/zh-cn';

export default class DateFieldView extends React.Component {

  static contextTypes = {
    settings: PropTypes.object
  };

  props: {
    className: string,
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: any,
    onChange: Function,
  };

  componentWillMount() {
    moment.locale(this.context.settings.locale);
  }

  shouldComponentUpdate(props: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model');
  }

  render() {
    let { className, value, field, disabled, errorText, onChange } = this.props;
    let help = field.help;
    className += ' date-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    if (field.format && value) {
      value = moment(value).format(field.format);
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-static">{value}</p>;
    } else if (disabled) {
      inputElement = <input type="text" className="form-control" disabled value={value} />;
    } else {
      inputElement = <DateTime
        value={value}
        dateFormat={field.format}
        timeFormat={false}
        onChange={onChange}
      />;
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? <label className="control-label">{label}</label> : null;
      return (
        <div className={className}>
          {labelElement}
          {inputElement}
          {helpElement}
        </div>
      );
    }

    return (
      <div className={className}>
        <label className="col-sm-2 control-label">{label}</label>
        <div className="col-sm-10">
          {inputElement}
          {helpElement}
        </div>
      </div>
    );
  }
}

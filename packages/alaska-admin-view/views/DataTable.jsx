// @flow

import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router';
import { IF, ELSE } from 'jsx-plus';
import shallowEqualWithout from 'shallow-equal-without';
import DataTableRow from './DataTableRow';

const { object, array, string, func } = React.PropTypes;

export default class DataTable extends React.Component {

  static propTypes = {
    model: object,
    columns: array,
    selected: array,
    data: array,
    sort: string,
    onSort: func,
    onSelect: func,
    onRemove: func
  };

  static contextTypes = {
    router: object,
    settings: object,
    views: object,
    t: func,
  };

  state: {
    data:Object[];
    columns:Object[];
    selected:Object;
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      data: props.data || [],
      selected: {},
      columns: []
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Object) {
    this.init(nextProps);
  }

  shouldComponentUpdate(props: Object, state: Object) {
    if (!state.data || !state.columns) {
      return false;
    }
    return !shallowEqualWithout(state, this.state);
  }

  init(props: Object) {
    let model = props.model || this.props.model;
    if (!model) return;
    const { settings } = this.context;

    let state = {};
    if (props.data) {
      state.data = props.data;
    }
    if (props.selected) {
      state.selected = _.reduce(props.selected, (res, record) => {
        res[record._id] = true;
        return res;
      }, {});
    }

    let columns = [];
    (props.columns || model.defaultColumns).forEach(key => {
      let field = model.fields[key];
      if (field) {
        if (field.super && !settings.superMode) return;
        columns.push({
          key,
          field
        });
      }
    });
    state.columns = columns;
    this.setState(state);
  }

  isAllSelected() {
    const { data, selected } = this.state;
    if (!data || !data.length) {
      return false;
    }
    for (let record of data) {
      if (!selected[record._id]) return false;
    }
    return true;
  };

  handleSelectAll = () => {
    let records = [];
    if (!this.isAllSelected()) {
      records = _.clone(this.state.data);
    }
    this.props.onSelect(records);
  };
  handleSelect = (record: Object, isSelected: boolean) => {
    let selected = _.clone(this.state.selected);
    if (isSelected) {
      selected[record._id] = true;
    } else {
      delete selected[record._id];
    }
    this.setState({ selected });
    let records = _.filter(this.state.data, (record) => selected[record._id]);
    this.props.onSelect(records);
  };
  handleEdit = (record: Object) => {
    const { model } = this.props;
    const { router } = this.context;
    let url = '/edit/' + model.serviceId + '/' + model.name + '/' + record._id;
    router.push(url);
  };

  render() {
    const { model, sort, onSort, onSelect, onRemove } = this.props;
    const { t } = this.context;
    const { columns, data, selected } = this.state;
    if (!model || !columns) {
      return <div className="loading">Loading...</div>;
    }

    let selectEl = onSelect ?
      <th onClick={this.handleSelectAll} width="29"><input type="checkbox" checked={this.isAllSelected()} />
      </th> : null;
    return (
      <table className="data-table table table-hover">
        <thead>
        <tr>
          {selectEl}
          {
            columns.map((col) => {
              let sortIcon = null;
              let handleClick;
              if (!col.nosort && onSort) {
                if (col.key === sort) {
                  sortIcon = <i className="fa fa-sort-asc" />;
                  handleClick = () => onSort('-' + col.key);
                } else if ('-' + col.key === sort) {
                  sortIcon = <i className="fa fa-sort-desc" />;
                  handleClick = () => onSort(col.key);
                } else {
                  handleClick = () => onSort('-' + col.key);
                }
              }
              return <th
                key={col.field.path}
                onClick={handleClick}
              >{t(col.field.label, model.serviceId)}{sortIcon}</th>;
            })
          }
          <th></th>
        </tr>
        </thead>
        <tbody>
        {data.map((record, index) => <DataTableRow
          key={index}
          record={record}
          columns={columns}
          model={model}
          onEdit={this.handleEdit}
          onSelect={onSelect?this.handleSelect:null}
          onRemove={onRemove}
          selected={selected[record._id]}
        />)}
        </tbody>
      </table>
    );
  }
}

// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { loadList } from 'alaska-admin-view/redux/lists';
import { save } from 'alaska-admin-view/redux/save';

const KEY = 'alaska-settings.settings';

class SettingsEditor extends React.Component {

  static contextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func
  };

  props: {
    lists: Object,
    actions: Object,
    loadList:Function,
    save:Function,
  };

  state: {
    values: {},
    fields: {},
    map: {},
    groups: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      values: {},
      fields: {},
      map: {},
      groups: {}
    };
  }

  componentWillMount() {
    this.refresh();
  }

  componentWillReceiveProps(props) {
    let newState = {};
    if (props.lists[KEY]) {
      const { t } = this.context;
      const results = props.lists[KEY].results;
      const map = newState.map = {};
      _.forEach(results, (item) => (map[item._id] = item));

      const fields = newState.fields = {};
      const groups = newState.groups = {};
      _.forEach(results, (item) => {
        let groupKey = item.group || 'Basic Settings';
        if (!groups[groupKey]) {
          groups[groupKey] = {
            title: t(groupKey, item.service || 'alaska-settings'),
            items: []
          };
        }
        groups[groupKey].items.push(item);
        fields[item._id] = Object.assign({
          label: t(item.title, item.service),
          help: t(item.help, item.service),
          service: item.service
        }, item.options);
      });
    }
    this.setState(newState);
  }

  refresh = () => {
    this.props.loadList({
      service: 'alaska-settings',
      model: 'Settings',
      key: KEY,
      limit: 10000
    });
    this.setState({
      values: {}
    });
  };

  handleChange(key, value) {
    let values = Object.assign({}, this.state.values, {
      [key]: value
    });
    this.setState({ values });
  }

  handleSave = () => {
    const { values, map } = this.state;
    const save = this.props.save;
    _.forEach(values, (value, id) => {
      let data = Object.assign({}, map[id], { id, value });
      save({
        service: 'alaska-settings',
        model: 'Settings',
        key: KEY,
        _r: Math.random()
      }, data);
    });
    setTimeout(this.refresh, 1000);
  };

  render() {
    const { t, views } = this.context;
    const { lists } = this.props;
    const { values, groups, fields } = this.state;
    let content: any;
    if (!lists[KEY]) {
      content = <div className="loading">Loading...</div>;
    } else {
      content = [];
      _.forEach(groups, (group, index) => {
        let items = _.map(group.items, (item, itemIndex) => {
          let FieldView = views[item.type] || views.MixedFieldView;
          let value = values[item._id];
          if (value === undefined) {
            value = item.value;
          }
          return (<FieldView
            key={itemIndex}
            field={fields[item._id]}
            value={value}
            onChange={this.handleChange.bind(this, item._id)}
          />);
        });
        content.push(<div className="panel panel-default" key={index}>
          <div className="panel-heading">{group.title}</div>
          <div className="panel-body">{items}</div>
        </div>);
      });
    }
    return (
      <div className="editor-content">
        <div className="content-header">
          <h4>{t('Settings', 'alaska-settings')}</h4>
        </div>
        <div className="form-horizontal">
          {content}
        </div>
        <nav className="navbar navbar-fixed-bottom bottom-bar">
          <div className="container-fluid">
            <div className="navbar-form navbar-right">
              <button
                onClick={this.handleSave}
                className="btn btn-primary"
              >{t('Save')}</button>
              <button
                onClick={this.refresh}
                className="btn btn-warning"
              >{t('Refresh')}</button>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default connect(
  ({ lists }) => ({ lists }),
  (dispatch) => bindActionCreators({
    loadList,
    save
  }, dispatch)
)(SettingsEditor);

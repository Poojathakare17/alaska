// @flow

import React from 'react';
import { NavDropdown, MenuItem } from 'react-bootstrap';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import * as layoutRedux from '../redux/layout';
import { connect } from 'react-redux';
import Node from './Node';
import LocaleNav from './LocaleNav';
import * as loginRedux from '../redux/login';
const { node, object, func, string } = React.PropTypes;

class Header extends React.Component {

  static propTypes = {
    children: node,
    user: object,
    layout: string
  };

  static contextTypes = {
    actions: object,
    views: object,
    settings: object,
    t: func,
  };

  state: {
    open:boolean;
    anchorEl:?Object;
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null
    };
  }

  componentWillReceiveProps() {
    let newState = {};
    this.setState(newState);
  }

  handleToggle = () => {
    let { layout } = this.props;
    if (window.innerWidth <= 768) {
      //小屏幕
      if (layout.toString() === 'hidden') {
        layout = 'icon';
      } else {
        layout = 'hidden';
      }
    } else {
      if (layout.toString() === 'full') {
        layout = 'icon';
      } else {
        layout = 'full';
      }
    }
    this.props.layoutAction(layout);
  };

  handleTouchTap = (event) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleRefresh = () => {
    this.context.actions.refresh();
    this.setState({
      open: false
    });
  };

  handleLogout = () => {
    this.props.logoutAction();
    this.setState({
      open: false
    });
  };

  render() {
    const { user, layout } = this.props;
    const { t, views } = this.context;
    const navs = _.map(views.navs, (Nav, index) => (<Nav key={index}/>));
    let username = null;
    if (layout.toString() === 'full') {
      username = user.username;
    }

    return (
      <Node id="header" tag="nav" className="navbar navbar-default">
        <div className="container-fluid">
          <div className="nav menu-toggle" onClick={this.handleToggle}><i
            className="fa fa-bars"
          />
          </div>
          <Node id="topNav" tag="ul" className="nav navbar-nav navbar-right">
            {navs}
            <LocaleNav />
            <NavDropdown
              eventKey={3}
              title={<div><img src={user.avatar || 'static/img/avatar.png'} />{username}</div>}
              id="userNav"
            >
              <MenuItem eventKey={3.1} onClick={this.handleRefresh}>{t('Refresh')}<i
                className="fa fa-refresh pull-right"
              />
              </MenuItem>
              <MenuItem eventKey={3.2} onClick={this.handleLogout}>{t('Logout')}<i
                className="fa fa-sign-out pull-right"
              /></MenuItem>
            </NavDropdown>
          </Node>
        </div>
      </Node>
    );
  }
}

export default connect(({ user, layout }) => ({ user, layout }), (dispatch) => bindActionCreators({
  logoutAction: loginRedux.logout,
  layoutAction: layoutRedux.layout
}, dispatch))(Header);

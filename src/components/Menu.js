import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';

class Menu extends Component {

  state = {
    items: [
      { name: 'A B', path: '/', selected: true, permission: [1], icon: 'fas fa-cube' },
      { name: 'A B C', path: '/odds-espnet', permission: [1], icon: 'fas fa-cube' },
      { name: 'CEV', path: '/odds-hda', icon: 'fas fa-cube', permission: [1] },
      { name: 'Odds Sure', path: '/odds-sure', freeAccess: true, icon: 'fas fa-cube' },
      { name: 'Histórico', path: '/odd-history', permission: [1], icon: 'fas fa-list' },
    ]
  }
  componentDidMount() {
    let items = this.state.items;
    let item = this.state.items.find(x => x.path === window.location.pathname);
    if (item != null) {
      items[0].selected = false;
      item.selected = true;
    }
    this.setState({ items });

  }
  redirect = (item) => {

    let path = item.path;
    if (document.location.pathname !== path)
      this.props.history.push(path);
    else {
      this.props.history.push('/default');
      setTimeout(() => {
        this.props.history.push(path);
      }, 1);
    }
    this.state.items.forEach(x => x.selected = false);
    item.selected = true;

    this.hideMenu();
  }
  hideMenu = () => {
    document.getElementById('menu-more').style.transform = 'translateX(-100%)';
    document.getElementById('menu-panel').style.display = 'none';
  }
  render() {

    let permission = common.getUser() ? Number(common.getUser().permission) : 0;
    let items = this.state.items.filter(x => x.freeAccess || x.permission.find(y => permission === y) != null);
    return (
      <React.Fragment>
        <div className="menu-panel" id="menu-panel" onClick={this.hideMenu} ></div>
        <div className="menu-more" id="menu-more" onClick={common.hideMore} >
          <div className="logo-text">
            Forra Sports
          </div>
          <div className="items">
            {items.map((x, i) => <div className={x.selected ? 'active' : ''} key={i} onClick={() => { this.redirect(x) }} >
              <i className={x.icon}></i> {x.name}
            </div>)}
            <div onClick={() => { if (window.confirm('Deseja sair do sistema!')) { common.setUser(null); window.location.href = '/login'; } }} >
              <i className="fas fa-sign-out-alt"></i> Sair
        </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Menu);

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';

class Menu extends Component {

  state = {
    items: [
      { id: 1, name: 'A B', path: '/', selected: true, permission: [1], icon: 'fas fa-cube' },
      { id: 2, name: 'A B C', path: '/odds-espnet', permission: [1], icon: 'fas fa-cube' },
      { id: 3, name: 'CEV', path: '/odds-hda', icon: 'fas fa-cube', permission: [1] },
      { id: 4, name: 'Odds Sure', path: '/odds-sure', freeAccess: true, icon: 'fas fa-cube' },
      { id: 5, name: 'Histórico', path: '/odd-history', permission: [1], icon: 'fas fa-list' },
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
  redirect = (item, e) => {

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
  setFavorite = (menuItem, e) => {

    e.stopPropagation();

    if (menuItem.favorite)
      return this.setFavoriteRemove(menuItem, e);

    menuItem.favorite = true;
    this.setState(this.state.items);

    let item = e.target.parentNode;
    let itemHeight = item.clientHeight;
    //Create Favorite Container
    let favoriteContainer = document.createElement('div');
    favoriteContainer.className = 'item-container';
    favoriteContainer.style.height = '0px';
    //Get Distance to Translate Item
    let favorite = document.getElementById('favorite');
    let favoriteBottom = favorite.getBoundingClientRect().bottom;
    let itemTop = item.getBoundingClientRect().top;
    let distance = itemTop - favoriteBottom;
    //Translate
    item.style.transform = 'translateY(-' + (distance + itemHeight) + 'px)';
    //Add Favorite Container
    favorite.appendChild(favoriteContainer);
    //Item Container Set Height
    let parent = item.parentNode;
    parent.style.height = parent.clientHeight + 'px';
    //Decrease Parent Container, Increase Favorite Container
    setTimeout(() => {
      parent.style.height = '0px';
      favoriteContainer.style.height = itemHeight + 'px';
    }, 1);
    //Add Item do Favorite Container
    setTimeout(() => {
      item.style.transform = null;
      favoriteContainer.append(item);
    }, 500);
  }
  setFavoriteRemove = (menuItem, e) => {

    menuItem.favorite = false;
    this.setState(this.state.items);

    let item = e.target.parentNode;
    let itemHeight = item.clientHeight;
    //Create Favorite Container
    // let favoriteContainer = document.createElement('div');
    // favoriteContainer.className = 'item-container';
    // favoriteContainer.style.height = '0px';
    //Get Distance to Translate Item
    let itemContainer = document.getElementById(menuItem.id);
    let itemContainerTop = itemContainer.getBoundingClientRect().top;
    let itemTop = item.getBoundingClientRect().bottom;
    let distance = itemContainerTop - itemTop;
    //Translate
    item.style.transform = 'translateY(' + (distance) + 'px)';
    //Add Favorite Container
    //favorite.appendChild(favoriteContainer);
    //Item Container Set Height
    let parent = item.parentNode;
    parent.style.height = parent.clientHeight + 'px';
    //Decrease Parent Container, Increase Favorite Container
    setTimeout(() => {
      parent.style.height = '0px';
      itemContainer.style.height = itemHeight + 'px';
    }, 1);
    //Add Item do Favorite Container
    setTimeout(() => {
      item.style.transform = null;
      itemContainer.append(item);
    }, 500);
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
          <div id="favorite" className="items" >

          </div>
          <div className="items">
            {items.map((x, i) => <div id={x.id} className="item-container" key={i} >
              <div className={x.selected ? 'item active' : 'item'} onClick={this.redirect.bind(this, x)} >
                <i className={x.icon}></i> {x.name} <i onClick={this.setFavorite.bind(this, x)} className={x.favorite ? 'fas fa-star' : 'far fa-star'}></i>
              </div>
            </div>)}
            <div className="item" onClick={() => { if (window.confirm('Deseja sair do sistema!')) { common.setUser(null); window.location.href = '/login'; } }} >
              <i className="fas fa-sign-out-alt"></i> Sair
        </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Menu);

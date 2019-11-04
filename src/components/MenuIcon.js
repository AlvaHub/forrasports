import React, { Component } from 'react'
import * as common from './Common';
import { withRouter } from 'react-router-dom';

class MenuIcon extends Component {

    state = {
        items: this.props.items
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
    }
    showMenu = () => {
        document.getElementById('menu-more').style.transform = 'translateX(0)';
        document.getElementById('menu-panel').style.display = 'block';
    }
    render() {

        let permission = common.getUser() ? Number(common.getUser().permission) : 0;
        let items = this.state.items.filter(x => x.freeAccess || x.permission.find(y => permission === y) != null);

        return (
            <div>
                <div className="menu-inline align-items-center show-md"  >
                    <div className="item" onClick={this.showMenu}>
                        <i className="fas fa-bars"></i>
                    </div>
                    {items.map((x, i) =>
                        <div id={x.id} className={x.selected ? 'item active' : 'item'} key={i} onClick={this.redirect.bind(this, x)} >
                            <i className={x.icon}></i>
                        </div>
                    )}
                    <div className="item" onClick={() => { if (window.confirm('Deseja sair do sistema!')) { common.setUser(null); this.props.history.push('/login') } }} >
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                </div>
                <button type="button" title="Menu" className="btn btn-sm hidden-md" onClick={this.showMenu}  ><i className="fas fa-bars"></i></button>
            </div>
        )
    }
}
export default withRouter(MenuIcon)
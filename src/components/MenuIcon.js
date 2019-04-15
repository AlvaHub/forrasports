import React, { Component } from 'react'
import * as common from './Common';
import { withRouter } from 'react-router-dom';

class MenuIcon extends Component {

    showMore(e) {
        e.stopPropagation();
        document.getElementById('menu-more').className = 'menu-more menu-come';
        //document.body.addEventListener('click', common.hideMore);
        setTimeout(() => {
            document.body.className = 'no-overflow';
        }, 600);
    }
    render() {
        return (
            <div className="font-sm pl-2 block-inline menu-btn"  >
                <button type="button" title="Sair" className="btn btn-sm" onClick={() => { if (window.confirm('Deseja sair do sistema!')) { common.setUser(null); this.props.history.push('/login') } }} ><i className="fas fa-sign-out-alt"></i></button>
                <button type="button" title="Odds" className="btn btn-sm" onClick={() => { this.props.history.push('/') }} ><i className="fas fa-cube"></i></button>
                <button type="button" title="Histórico" className="btn btn-sm" onClick={() => { this.props.history.push('/odd_history') }} ><i className="fas fa-cubes"></i></button>
            </div>
            // <div onClick={showMore}  ><i className="fas fa-bars ml-2"></i><div></div></div>
        )
    }
}
export default withRouter(MenuIcon)
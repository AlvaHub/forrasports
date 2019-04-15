import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import './App.css';
import Menu from './components/Menu';
import Odds from './components/Odds';
import Login from './components/Login';
import loadingImage from './images/loading-spinner.svg';
import User from './components/admin/User';
import Parameter from './components/admin/Parameter';
import * as common from './components/Common';
import MenuIcon from './components/MenuIcon'
import OddHistory from './components/OddHistory'

import { BrowserRouter, Route } from 'react-router-dom'

class App extends Component {
  constructor(props) {
    super(props);

    document.documentElement.style.setProperty('--window', `${window.innerHeight}px`);
    window.addEventListener('resize', () => {
      document.documentElement.style.setProperty('--window', `${window.innerHeight}px`);
    });
    if (window.location.pathname !== '/login' && common.getUser() === null)
      return window.location.href = "/login";

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);



  }
  state = {
    title: { left: '', center: "Natan Sports", right: '' },
    loading: '',
    show: false,
  }
  changeTitleHandler = title => {

    if (!title.left) title.left = window.location.pathname === '/login' || <MenuIcon />;
    this.setState({ title: title });
  }
  loadingShow = () => {
    this.setState({ loading: 'loading-show' });
  }
  loadingHide = () => {
    this.setState({ loading: '' });
  }
  componentDidMount() {

    common.setTheme();
  }
  dateChanged = (e) => {
    this.setState({ year: e.target.value });
  }
  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }


  render() {

    return (
      <BrowserRouter>
        <React.Fragment>
          <div className="navigation-bar row no-gutters" >
            <div className="col-12 row no-gutters">
              <div className="col text-left align-self-center" >{this.state.title.left}</div>
              <div className="col-auto text-center align-self-center" >{this.state.title.center}</div>
              <div className="col text-right align-self-center" >{this.state.title.right}
              </div>
            </div>
          </div>
          {window.location.pathname === '/login' || <Menu show={this.loadingShow} hide={this.loadingHide} />}
          <div id="master" className="page p-1">
            <Route path="/login" render={() => <Login changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/" exact render={() => { return common.getUser() && <Odds changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} /> }} />
            <Route path="/default" />
            <Route path="/admin/user" render={() => <User changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/admin/parameter" render={() => <Parameter changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/odd_history" render={() => <OddHistory changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
          </div>
          <div className={'loading ' + this.state.loading} ><img src={loadingImage} alt="" /></div>
        </React.Fragment >
      </BrowserRouter>

    );
  }
}

export default App;

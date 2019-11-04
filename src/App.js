import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import './css/App.css';
import './css/OddsEspnet.css';
import './css/OddsSure.css';
import Menu from './components/Menu';
import Odds from './components/Odds';
import Login from './components/Login';
import loadingImage from './images/loading-spinner.svg';
import User from './components/admin/User';
import Parameter from './components/admin/Parameter';
import * as common from './components/Common';
import MenuIcon from './components/MenuIcon'
import OddHistory from './components/OddHistory'
import OddsEspnet from './components/OddsEspnet'
import OddsSure from './components/OddsSure'
import OddsHDA from './components/OddsHDA'
import { formatDate } from 'react-day-picker/moment';
import MyModal from './components/MyModal';
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

    // window.addEventListener("beforeunload", function (e) {
    //   //Clear User
    //   if (!common.getUser())
    //     return;
    //   let dataInput = { user_id: common.getUser().id };
    //   //common.postData('data/dataloading.php?data=clear_user', dataInput).then(function () {
    //   //});
    // });
  }
  state = {
    title: { left: '', center: "", right: '' },
    loading: '',
    show: false,
    apple: 1,
    data_loading_interval: '0',
    minutes: [],
    runningCount: 0
  }
  changeTitleHandler = title => {
    if (common.isUserInactive()) {
      title.left = common.getUser() && <div className="pl-2 pointer" onClick={() => { if (window.confirm('Deseja sair do sistema!')) { common.setUser(null); window.location.href = '/login'; } }} ><i className="fas fa-sign-out-alt"></i> Sair</div>;
      this.setState({ title: title });
      return;
    }


    if (!title.left) title.left = window.location.pathname === '/login' || <button type="button" title="Menu" className="btn btn-sm" onClick={this.showMenu}  ><i className="fas fa-bars"></i></button>;
    this.setState({ title: title });
  }
  showMenu = () => {
    document.getElementById('menu-more').style.transform = 'translateX(0)';
    document.getElementById('menu-panel').style.display = 'block';

  }
  loadingShow = () => {
    this.setState({ loading: 'loading-show' });
  }
  loadingHide = () => {
    this.setState({ loading: '' });
  }
  componentDidMount() {
    common.setTheme();
    let minutes = [];
    for (let index = 1; index < 31; index++)
      minutes.push(index);
    this.setState({ minutes });

    if (common.isUserInactive())
      return;

    //Check if data loading is running and keep the loading bar updating 
    this.checkLoading();
    if (!this.globalInterval)
      this.globalInterval = setInterval(() => {
        this.checkLoading();
      }, 5000);
  }
  componentWillUnmount() {

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
  checkLoading = () => {

    common.getData('data/dataloading.php?data=data_loading_percent').then((info) => {

      if (info.status_id === "SU") { //Success means data loading finished
        if (this.state.isLoading || !this.state.first_check) {
          //console.log(this.childComponent);
          if (this.childComponent && this.childComponent.bindList && this.state.first_check)
            this.childComponent.bindList();

          this.setState({ isLoading: false, data_loading_info: info, isError: false, first_check: true, runningCount: 0 })
          this.nextLoadData(info.user_id);
        }
      }
      else if (info.status_id === "ER") {
        if (this.state.isLoading || !this.state.first_check) {
          this.setState({ isLoading: false, data_loading_info: info, isError: true, first_check: true, runningCount: 0 })
          this.nextLoadData(info.user_id);
        }
      }
      else {
        document.getElementById('percent-bar').style.width = info.step_percent + '%';
        document.getElementById('percent-number').innerHTML = info.step_percent + '%';
        this.setState({ isLoading: true, data_loading_info: info, isError: false, runningCount: this.state.runningCount + 1 })
        if (this.state.runningCount === 70) { //It means service got stuck

          common.getData('clear.php').then((info) => {
            this.setState({ isLoading: false, data_loading_info: info, isError: true, first_check: true, runningCount: 0 });
            this.nextLoadData(info.user_id);
          });
        }
      }
    }, err => { console.log(err); });

  }
  loadDataClicked = () => {

    let that = this;
    this.loadingShow();

    if (common.isUserInactive()) {
      setTimeout(() => {
        alert('Não foi possivel obter os dados do Bet365!')
        that.loadingHide();
      }, 5000);
      return;
    }
    this.loadingShow();
    let dataInput = { user_id: common.getUser().id, interval: this.state.data_loading_interval };
    common.postData('data/dataloading.php?data=set_user', dataInput).then(function (data) {

      if (data.message) {
        that.loadingHide();
        alert(data.message);
        return;
      }
      else
        that.loadData();
    });
  }
  loadData = () => {

    document.getElementById('percent-bar').style.width = '0%';
    document.getElementById('percent-number').innerHTML = '0%';
    this.setState({ isLoading: true, isError: false, loading: '' })
    common.getData('start.php').then((data) => {

    }, (err) => { this.setState({ isLoading: false, isError: false }); console.log(err) });
  }
  nextLoadData(userId) {
    if (!common.getUser())
      return;

    if (common.getUser().id == userId && this.state.data_loading_interval !== "0") { // Means that loading is scheduled, so prepare to run the next one
      document.getElementById("btn_loading").setAttribute("disabled", "disabled");

      if (this.timeoutLoading)
        clearTimeout(this.timeoutLoading);
      this.timeoutLoading = setTimeout(() => { this.loadData() }, Number(this.state.data_loading_interval) * 60 * 1000);
      //Number(this.state.data_loading_interval) * 60 * 1000
    }
  }
  handleChange = e => {
    let data = this.state.data;
    this.setState({ [e.target.name]: e.target.value })

    if (e.target.name === "data_loading_interval") {
      if (this.timeoutLoading)
        clearTimeout(this.timeoutLoading);
      var btn = document.getElementById("btn_loading");
      btn.removeAttribute('disabled');
      if (e.target.value === "0") {
        btn.innerText = "Atualizar";
        btn.className = btn.className.replace("btn-secondary", "btn-danger");
      }

      else {
        btn.innerText = e.target.value + " min.";
        btn.className = btn.className.replace("btn-danger", "btn-secondary");
      }

    }
  }
  clearPinnacle = () => {
    var that = this;
    common.getData('data/dataloading.php?data=clear_pinnacle').then(function (data) {
      if (data === "1")
        that.setState({ clear_pin: true })
    });
  }
  customFilterOpen = () => {

    let that = this;
    common.getData('data/dataloading.php?data=check_loading&user_id=' + common.getUser().id).then(function (data) {
      if (data.message) {
        alert(data.message);
        return;
      }
      that.setState({ showModal: true, clear_pin: false })
    });

  }
  customFilterSave = () => {

    let dataInput = { user_id: common.getUser().id, interval: this.state.data_loading_interval };
    let that = this;
    common.postData('data/dataloading.php?data=set_user', dataInput).then(function (data) {

      if (data.message) {
        that.setState({ showModal: false });
        alert(data.message);
        return;
      }
      if (data === 1)
        that.setState({ showModal: false });

    });

  }
  clearBindList = () => { this.bindList = null; }
  setChild = (component) => {
    this.childComponent = component
  }
  render() {

    let permission = common.getUser() ? common.getUser().permission : '0';
    return (
      <BrowserRouter>
        <React.Fragment>
          <MyModal handleShow={this.state.showModal} handleClose={() => { this.setState({ showModal: false }) }} title="Configurações" >
            <div className="row" >
              <div className="col-12 row no-gutters" >
                <div className="pl-1 pt-1 w-100 font-weight-bold" >Atualização (minutos)</div>
                <div className="col-12 p-1" >
                  <select className="form-control form-control-sm" name="data_loading_interval" onChange={this.handleChange.bind(this)} value={this.state.data_loading_interval}>
                    <option value="0">Manual</option>
                    {this.state.minutes.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div className="col-12 p-1 pt-2 text-right" >
                  <button type="button" className={'btn btn-primary btn-sm float-left'} onClick={this.clearPinnacle.bind(this)}>Refresh Pin <i hidden={!this.state.clear_pin} className="fas fa-check"></i></button>
                  <button type="button" className={'btn btn-secondary'} onClick={this.customFilterSave.bind(this)}>Salvar</button>
                </div>
              </div>
            </div>
          </MyModal>
          <div className="navigation-bar row no-gutters" >
            <div className="col-12 row no-gutters">
              <div className="col-auto col-sm text-left align-self-center" >{this.state.title.left}</div>
              <div className="col-auto title align-self-center" >
                {this.state.title.center}
                {this.state.data_loading_info && common.getUser() &&
                  <div className="show-md date-loading" >{formatDate(this.state.data_loading_info.date_finish, "DD/MM/YY HH:mm:ss")} ({this.state.data_loading_info.duration} seg.)</div>
                }
              </div>
              <div className="col text-right align-self-center">
                <div style={{ display: 'flex' }} className="justify-content-end" >
                  <div hidden={!common.getUser()}  >
                    <div className="loading-bar" hidden={!this.state.isLoading}>
                      <div className="container">
                        <div className="percent-bar" id="percent-bar"></div>
                        <span className="percent-number" id="percent-number">0%</span>
                      </div>
                    </div>
                    <div className="data-loading-info" hidden={this.state.isLoading} >
                      {this.state.data_loading_info &&
                        <div className="block-inline hidden-md mr-2" >{formatDate(this.state.data_loading_info.date_finish, "DD/MM/YY HH:mm:ss")} ({this.state.data_loading_info.duration} seg.)</div>
                      }
                      <i className="mr-1 fas fa-cog text-dark" hidden={common.isUserInactive()} style={{ fontSize: 16, position: 'relative', top: '3px' }} onClick={this.customFilterOpen.bind(this)}></i>
                      <i className="mr-1 fas fa-times-circle text-danger" onClick={() => { alert(this.state.data_loading_info ? 'Houve um erro na última execução:\r\r' + this.state.data_loading_info.error_msg : '') }} title={this.state.data_loading_info ? this.state.data_loading_info.error_msg : ''} hidden={!this.state.isError} style={{ fontSize: 16, position: 'relative', top: '3px' }}></i>
                      <button type="button" id="btn_loading" className={'mr-2 btn btn-sm btn-danger btn-loading'} onClick={this.loadDataClicked.bind(this)}>Atualizar</button>
                    </div>
                  </div>
                  <div>
                    {this.state.title.right}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {window.location.pathname === '/login' || <Menu show={this.loadingShow} hide={this.loadingHide} />}
          <div id="master" className="page p-1">
            <Route path="/login" render={() => <Login changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            {permission === '1' &&
              <React.Fragment >
                <Route path="/default" />
                <Route path="/admin/user" render={() => <User changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
                <Route path="/admin/parameter" render={() => <Parameter changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
                <Route path="/odd-history" render={() => <OddHistory changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
                <Route path="/odds-espnet" render={() => <OddsEspnet setChild={this.setChild} changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
                <Route path="/odds-hda" render={() => <OddsHDA setChild={this.setChild} changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
              </React.Fragment >}
            {(permission === '1' || permission === '2') &&
              <Route path="/" exact render={() => { return common.getUser() && <Odds setChild={this.setChild} changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} /> }} />
            }
            <Route path="/odds-sure" render={() => <OddsSure setChild={this.setChild} changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
          </div>
          <div className={'loading ' + this.state.loading} ><img src={loadingImage} alt="" /></div>
        </React.Fragment >
      </BrowserRouter>

    );
  }
}

export default App;

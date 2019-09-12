import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import './css/App.css';
import './css/OddsEspnet.css';
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

    window.addEventListener("beforeunload", function (e) {
      //Clear User
      if (!common.getUser())
        return;
      let dataInput = { user_id: common.getUser().id };
      common.postData('data/dataloading.php?data=clear_user', dataInput).then(function () {
      });
    });
  }
  state = {
    title: { left: '', center: "Natan Sports", right: '' },
    loading: '',
    show: false,
    apple: 1,
    data_loading_interval: '0',
    minutes: [],
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
    let minutes = [];
    for (let index = 1; index < 31; index++)
      minutes.push(index);
    this.setState({ minutes });

    //Check if data loading is running and keep the loading bar updating 
    this.checkLoading();

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

    this.globalInterval = setInterval(() => {
      common.getData('data/dataloading.php?data=data_loading_percent').then((info) => {
    
        if (info.status_id === "SU") { //Success means data loading finished
          if (this.state.isLoading) {
            //console.log(this.childComponent);
            if (this.childComponent && this.childComponent.bindList)
              this.childComponent.bindList();
  
            this.setState({ isLoading: false, data_loading_info : info, isError : false})
          }
        }
        else if(info.status_id === "ER"){
          this.setState({ isLoading: false, data_loading_info : info, isError : true})
        }
        else {
          this.setState({ isLoading: true, data_loading_info : info, isError : false  })
          document.getElementById('percent-bar').style.width = info.step_percent + '%';
          document.getElementById('percent-number').innerHTML = info.step_percent + '%';
        }
      });
    }, 5000);
  }
  loadDataClicked = () => {
    let that = this;
    let dataInput = { user_id: common.getUser().id, interval: this.state.data_loading_interval };
    common.postData('data/dataloading.php?data=set_user', dataInput).then(function (data) {

      if (data.message) {
        alert(data.message);
        return;
      }
      clearInterval(that.globalInterval);
      that.loadData();

    });
  }
  loadData = () => {

    document.getElementById('percent-bar').style.width = '0%';
    document.getElementById('percent-number').innerHTML = '0%';

    this.setState({ isLoading: true, isError : false })

    common.getData('start.php').then((data) => {

    }, (err) => { clearInterval(intervalLoading); this.setState({ isLoading: false }); console.log(err) })

    var intervalLoading = null;
    setTimeout(() => {
      intervalLoading = setInterval(() => {
        //Fill Loading Bar Percent
        common.getData('data/dataloading.php?data=data_loading_percent').then((info) => {
          console.log(info);
          if (info.status_id === "SU" || info.status_id === "ER") { //Success means data loading finished
            clearInterval(intervalLoading);
            if (this.childComponent && this.childComponent.bindList)
              this.childComponent.bindList();
            this.setState({ isLoading: false , isError : info.status_id === "ER"})

            if (this.state.data_loading_interval !== "0") { // Means that loading is scheduled, so prepare to run the next one
              document.getElementById("btn_loading").setAttribute("disabled", "disabled");
              this.timeoutLoading = setTimeout(() => { this.loadData() }, Number(this.state.data_loading_interval) * 60 * 1000);
            }
          }
          else if(info.status_id === "ER"){
            this.setState({ isLoading: false, data_loading_info : info, isError : true})
          }
          document.getElementById('percent-bar').style.width = info.step_percent + '%';
          document.getElementById('percent-number').innerHTML = info.step_percent + '%';
        });
      }, 5000);
    }, 3000);
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
              <div className="col text-left align-self-center" >{this.state.title.left}</div>
              <div className="col-auto text-center align-self-center" >{this.state.title.center}</div>
              <div className="col text-right align-self-center">
                <div className="block-inline" hidden={!common.getUser()}  >
                  <div className="loading-bar" hidden={!this.state.isLoading}>
                    <div className="container">
                      <div className="percent-bar" id="percent-bar"></div>
                      <span className="percent-number" id="percent-number">0%</span>
                    </div>
                  </div>
                  <div className="data-loading-info" hidden={this.state.isLoading} >
                    {this.state.data_loading_info &&
                      <div className="block-inline hidden-xs mr-2" >{formatDate(this.state.data_loading_info.date_finish, "DD/MM/YY HH:mm:ss")} ({this.state.data_loading_info.duration} seg.)</div>
                    }
                    <i className="mr-1 fas fa-cog text-dark" style={{ fontSize: 16, position: 'relative', top: '3px' }} onClick={this.customFilterOpen.bind(this)}></i>
                    <i className="mr-1 fas fa-times-circle text-danger" title="Houve erro na última execução" hidden={!this.state.isError} style={{ fontSize: 16, position: 'relative', top: '3px' }}></i>
                    <button type="button" id="btn_loading" className={'mr-2 btn btn-sm btn-danger btn-loading'} onClick={this.loadDataClicked.bind(this)}>Atualizar</button>

                  </div>
                </div>
                <div className="block-inline" >
                  {this.state.title.right}
                </div>
              </div>
            </div>
          </div>
          {window.location.pathname === '/login' || <Menu show={this.loadingShow} hide={this.loadingHide} />}
          <div id="master" className="page p-1">
            <Route path="/login" render={() => <Login changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/" exact render={() => { return common.getUser() && <Odds setChild={this.setChild} changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} /> }} />
            <Route path="/default" />
            <Route path="/admin/user" render={() => <User changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/admin/parameter" render={() => <Parameter changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/odd-history" render={() => <OddHistory changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
            <Route path="/odds-espnet" render={() => <OddsEspnet setChild={this.setChild} changeTitle={this.changeTitleHandler} show={this.loadingShow} hide={this.loadingHide} />} />
          </div>
          <div className={'loading ' + this.state.loading} ><img src={loadingImage} alt="" /></div>
        </React.Fragment >
      </BrowserRouter>

    );
  }
}

export default App;

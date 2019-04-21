import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import { formatDate } from 'react-day-picker/moment';
import MyModal from './MyModal';
import CurrencyFormat from 'react-currency-format';
import 'moment/locale/pt-br';

class Odds extends Component {
  constructor(props) {
    super(props);


  }
  barList(isLoading, data_loading_info) {
    this.props.changeTitle({
      left: null,
      center: <div className="pointer" onClick={this.bindList.bind(this)}  ><div className="hidden-xs">Odds</div>
        {data_loading_info && <small className="last-update show-xs"><div><b>Atualização</b></div> {formatDate(data_loading_info.date_finish, "DD/MM/YY HH:mm:ss")} </small>}</div>, right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div>
      , right:
        <div>
          <div className="loading-bar" hidden={!isLoading}>
            <div className="container">
              <div className="percent-bar" id="percent-bar"></div>
              <span className="percent-number" id="percent-number">0%</span>
            </div>
          </div>
          <div className="data-loading-info" hidden={isLoading} >
            {data_loading_info &&
              <div className="block-inline hidden-xs" ><b>Atualização :</b> {formatDate(data_loading_info.date_finish, "DD/MM/YY HH:mm:ss")} ({data_loading_info.duration} seg.)</div>
            }
            <button type="button" id="btn_loading" className={'ml-2 mr-2 btn btn-sm btn-danger btn-loading'} onClick={this.loadData.bind(this)}>Atualizar</button>
            <i className="fas fa-filter  ml-2 text-dark font-md show-xs" onClick={this.showFilter.bind(this)}></i>
          </div>
        </div>
    });
  }
  barForm = (title) => {
    this.props.changeTitle({
      left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title,

    });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form  pb-0 go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter hidden-xs';
    common.scrollLast();

  }
  componentWillUnmount() {

  }
  componentDidMount() {

    let minutes = [];
    for (let index = 1; index < 31; index++)
      minutes.push(index);
    this.setState({ minutes });

    this.barList(false);
    //BIND LIST
    this.bindList();
    //GET FILTER CUSTOM
    common.getData('data/odds.php?data=filter_custom').then((dataList) => {

      for (let i = 0; i < dataList.length; i++) {
        let x = dataList[i];
        for (var field in x) {
          var value = x[field];

          if (!isNaN(value)) {
            value = Number(value).toPrecision();
            if (Number(value) === 0 || Number(value) === 100)
              value = "";
            x[field] = value;
          }
        }
        this.setState({ customFilters: dataList, custom: dataList[0] });
      }

    });
    //GET BET USER
    common.getData("data/betuser.php?data=by_user&user_id=" + common.getUser().id).then((bets) => {
      if (bets.length > 0) {
        this.setState({ bets });
      }

    });
  }
  bindList() {
    this.props.show();
    let userId = common.getUser().id;
    common.getData('data/odds.php?date=' + this.state.filter_date + '&user_id=' + userId).then((items) => {
      this.setState({ itemsAll: items });
      setTimeout(() => { this.filterImportant() }, 1);
    })
    common.getData('data/dataloading.php?data=data_loading').then((data_loading) => {
      this.barList(false, data_loading);
      this.setState({ data_loading })
    })
    common.getData('data/odds.php?data=dates').then(
      (dates) => {

        dates.push(...this.state.datesPlus);
        this.setState({ dates })
      }
    )
  }
  componentDidUpdate() {

  }
  state = {
    itemsAll: [],
    items: [],
    bets: [],
    data_loading: {},
    data_loading_interval: "0",
    filter: {
      isGreen: false,
      isYellow: false,
      isRed: false,
      isImportant: false,

    },
    customFilters: [],
    custom: {},
    filter_search: "",
    filter_bet365Greater: "0",
    filter_date: "0",
    dates: [{ id: '0', name: 'Carregando...' }],
    datesPlus: [{ id: 'green', name: '< 0.85' }, { id: 'yellow', name: '< 0.90' }, { id: 'red', name: '< 0.93' },],
    minutes: []
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
  showFilter() {
    var css = document.getElementById('filter').className;
    css = css.indexOf('hidden-xs') > 0 ? 'filter' : 'filter hidden-xs';
    document.getElementById('filter').className = css;
  }
  hideFilter() {
    document.getElementById('filter').className = 'filter hidden-xs';
  }
  checkHideFilter = () => {
    var css = document.getElementById('filter').className;
    if (css.indexOf('hidden-xs') < 0)
      document.getElementById('filter').className = 'filter hidden-xs';
  }
  filter(e) {

    let bet365Greater = e.target.name === "filter_bet365Greater" ? e.target.value : this.state.filter_bet365Greater;
    let search = e.target.name === "filter_search" ? e.target.value : this.state.filter_search;
    let value = search.toUpperCase();

    let items = this.state.itemsAll;
    if (value !== "" || bet365Greater !== "0") {
      if (value.indexOf("\"") > -1) {
        value = value.replace(/\"/g, "");
        items = this.state.itemsAll.filter(x =>
          ((x.league_name + "").toUpperCase() === value
            || (x.event_name + "").toUpperCase() === value
            || (x.odd_name + "").toUpperCase() === value
          ) && (bet365Greater === "0" ? true : bet365Greater === "greater" ? (x.odd_365 > x.odd_pin) : (x.odd_365 < x.odd_pin))
        )
      } else {
        items = this.state.itemsAll.filter(x =>
          ((x.league_name + "").toUpperCase().indexOf(value) >= 0
            || (x.event_name + "").toUpperCase().indexOf(value) >= 0
            || (x.odd_name + "").toUpperCase().indexOf(value) >= 0
          ) && (bet365Greater === "0" ? true : bet365Greater === "greater" ? (x.odd_365 > x.odd_pin) : (x.odd_365 < x.odd_pin))
        )
      }
    }
    for (var f in this.state.filter) {
      this.state.filter[f] = false;
    }
    this.setState({ items, [e.target.name]: e.target.value });
  }
  filterImportantClicked = (e) => {
    let filter = this.state.filter;
    filter[e.target.name] = !this.state.filter[e.target.name];
    filter.current = e.target.name;
    if (e.target.name === "isImportant")
      filter.isGreen = filter.isYellow = filter.isRed = false;
    else
      filter.isImportant = false;

    this.setState({ filter });
    setTimeout(() => { this.filterImportant(e) }, 1);
  }
  filterImportant = () => {
    let filter = this.state.filter;
    var items = this.state.itemsAll;

    if (filter.current === "isImportant") {

      let c = this.state.customFilters.find(x => x.name === "Tela");
      if (filter.isImportant) {
        if (this.customHasValue(c.odd_from) || this.customHasValue(c.odd_to) ||
          this.customHasValue(c.pin365_from) || this.customHasValue(c.pin365_to) ||
          this.customHasValue(c.ev_from) || this.customHasValue(c.ev_to)) {
          //Custom Important Filter
          items = this.state.itemsAll.filter(x =>
            x.odd_365 >= this.customValueFrom(c.odd_from) && x.odd_365 <= this.customValueTo(c.odd_to) &&
            x.pin365 >= this.customValueFrom(c.pin365_from) && x.pin365 <= this.customValueTo(c.pin365_to) &&
            x.percent >= this.customValueFrom(c.ev_from) && x.percent <= this.customValueTo(c.ev_to)
          );
        }
        else //Standart Important Filter
          items = this.state.itemsAll.filter(x => x.pin365 < 0.93);
      }
    }
    else if (filter.isGreen || filter.isYellow || filter.isRed) {
      items = this.state.itemsAll.filter(x =>
        (filter.isGreen ? x.pin365 < 0.85 : false) ||
        (filter.isYellow ? x.pin365 >= 0.85 && x.pin365 < 0.90 : false) ||
        (filter.isRed ? x.pin365 >= 0.90 && x.pin365 < 0.93 : false)
      );
    }
    this.setState({ items });
    this.props.hide();
  }
  formatP365(value) {
    var css = "";
    if (value < 0.85)
      css = "bg-green";
    else if (value < 0.9)
      css = "bg-yellow";
    else if (value < 0.93)
      css = "bg-red";

    return css;

  }
  filterDate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
    setTimeout(() => { this.bindList(); }, 1);
  }
  betAdd = (x, index, e) => {
    let bets = this.state.bets;
    x.user_id = common.getUser().id;
    if (bets.find(y => y.id_365 === x.id_365 && y.odd_name === x.odd_name) != null){
      if(window.confirm('Aposta já adicionada. Deseja remover?')){
        this.betRemove(x,e);
      }
      return;
    }
      

    //Blink Effect
    var row = document.getElementById('row_' + index);
    row.className = row.className.replace(" add-blink", "");

    common.postData("data/betuser.php?data=insert", x).then((data) => {
      if (data === "1") {
        bets.push(x);

        this.setState({ bets });
        //Blink Effect
        row.className = row.className + " add-blink";
      }
    });
  }
  betRemove = (x, e) => {

    let bets = this.state.bets;
    x.user_id = common.getUser().id;

    common.postData("data/betuser.php?data=delete", x).then((data) => {
      if (data === "1") {
        let index = bets.indexOf(x);
        bets.splice(index, 1);
        x.user_id = null;
        this.setState({ bets });
      }
    });
  }
  loadData = () => {

    document.getElementById('percent-bar').style.width = "0%";
    document.getElementById('percent-number').innerHTML = '0%';

    this.barList(true);

    common.getData('start.php').then((data) => {
      console.log(data);
    }, (err) => { clearInterval(intervalLoading); this.barList(false, this.state.data_loading); console.log(err) })

    var intervalLoading = null;
    setTimeout(() => {
      intervalLoading = setInterval(() => {

        common.getData('data/dataloading.php?data=data_loading_percent').then((info) => {
          console.log(info);
          if (info.status_id === "SU") {
            clearInterval(intervalLoading);

            this.barList(false, this.state.data_loading);
            this.bindList();
            if (this.state.data_loading_interval !== "0") {
              document.getElementById("btn_loading").setAttribute("disabled", "disabled");
              this.timeoutLoading = setTimeout(() => { this.loadData() }, Number(this.state.data_loading_interval) * 60 * 1000);
            }
          }

          document.getElementById('percent-bar').style.width = info.step_percent + "%";
          document.getElementById('percent-number').innerHTML = info.step_percent + '%';
        });
      }, 5000);
    }, 3000);
  }
  customFilterOpen = () => {
    this.setState({ showModal: true, clear_pin: false })
  }
  customFilterChange = (e) => {

    if (e.target.name === "custom_name") {
      let custom = this.state.customFilters.find(x => Number(x.id) === Number(e.target.value))
      this.setState({ custom });
      return;
    }
    let custom = this.state.custom;
    custom[e.target.name] = e.target.value;
    this.setState({ custom });

  }
  customFilterSave = () => {

    let custom = this.state.custom;
    let x = {};
    x.name = custom.name;
    x.user_id = common.getUser().id;
    x.odd_from = this.customValueFrom(custom.odd_from);
    x.odd_to = this.customValueTo(custom.odd_to);
    x.pin365_from = this.customValueFrom(custom.pin365_from);
    x.pin365_to = this.customValueTo(custom.pin365_to);
    x.ev_from = this.customValueFrom(custom.ev_from);
    x.ev_to = this.customValueTo(custom.ev_to);
    common.postData('data/odds.php?data=filter_custom_save', x).then(function (data) {

    });
    this.filterImportant();
    this.setState({ showModal: false });
    // setTimeout(() => {
    //   document.getElementsByName('isImportant')[0].click();
    // }, 1);
  }
  customValueFormat(field) {
    if (isNaN(field)) return field;
    if (parseInt(field) === 0 || parseInt(field) === 100) return "";
    return field;
  }
  customHasValue(field) {
    return (field && field !== "" && !isNaN(field))
  }
  customValueFrom(field) {
    if (isNaN(field)) return 0;
    return Number(field);
  }
  customValueTo(field) {
    if (!field || field === "" || isNaN(field)) return 100;
    return Number(field);
  }
  clearPinnacle = () => {
    var that = this;
    common.getData('data/dataloading.php?data=clear_pinnacle').then(function (data) {
      if (data === "1")
        that.setState({ clear_pin: true })
    });
  }
  render() {

    return (
      <React.Fragment>
        <MyModal handleShow={this.state.showModal} handleClose={() => { this.setState({ showModal: false }) }} title="Configurações" >
          <div className="row" >
            <div className="col-12 row no-gutters" >
              <div className="pl-1 w-100 font-weight-bold" >Tipo de Filtro</div>
              <div className="col-12 p-1" >
                <select className="form-control form-control-sm" name="custom_name" onChange={this.customFilterChange.bind(this)} value={this.state.custom.id}>
                  {this.state.customFilters.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>  </div>
              <div className="pl-1 w-100 font-weight-bold" >Cotação</div>
              <div className="col-6 p-1" >
                <CurrencyFormat type="text" className="form-control form-control-sm" name="odd_from" value={this.customValueFormat(this.state.custom.odd_from)} onChange={this.customFilterChange.bind(this)} placeholder="" />
              </div>
              <div className="col-6 p-1 pt-0" >
                <CurrencyFormat type="text" className="form-control form-control-sm" name="odd_to" value={(this.state.custom.odd_to)} onChange={this.customFilterChange.bind(this)} placeholder="" />
              </div>
              <div className="pl-1 pt-1 w-100 font-weight-bold" >B / A</div>
              <div className="col-6 p-1" >
                <CurrencyFormat type="text" className="form-control form-control-sm" name="pin365_from" value={(this.state.custom.pin365_from)} onChange={this.customFilterChange.bind(this)} placeholder="" />
              </div>
              <div className="col-6 p-1" >
                <input type="text" className="form-control form-control-sm" name="pin365_to" value={(this.state.custom.pin365_to)} onChange={this.customFilterChange.bind(this)} placeholder="" />
              </div>
              <div className="pl-1 pt-1 w-100 font-weight-bold" >% EV</div>
              <div className="col-6 p-1" >
                <CurrencyFormat type="text" className="form-control form-control-sm" name="ev_from" value={(this.state.custom.ev_from)} onChange={this.customFilterChange.bind(this)} placeholder="" />
              </div>
              <div className="col-6 p-1" >
                <CurrencyFormat type="text" className="form-control form-control-sm" name="ev_to" value={(this.state.custom.ev_to)} onChange={this.customFilterChange.bind(this)} placeholder="" />
              </div>
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
        <div className="filter hidden-xs " id="filter">
          <div className="row no-gutters text-dark" >
            <div className="col-12 col-sm-3 p-sm-1" >
              <input type="text" className="form-control form-control-sm" name="filter_search" value={this.state.filter_search} onChange={this.filter.bind(this)} placeholder="Buscar..." />
            </div>
            <div className="col-12 col-sm-2 p-sm-1" >
              <select className="form-control form-control-sm" name="filter_date" onChange={this.filterDate} value={this.state.filter_date} >
                {this.state.dates.map(x => <option key={x.id} value={x.id}> {x.id.indexOf("-") < 0 ? x.name : formatDate(x.name, "DD/MM/YY dddd")}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-2 align-self-center no-overflow no-break p-sm-1">
              <select className="form-control form-control-sm" name="filter_bet365Greater" onChange={this.filter.bind(this)} value={this.state.filter_bet365Greater}>
                <option value="0">Mais Filtro</option>
                <option value="lower">Bet365 Menor</option>
                <option value="greater">Bet365 Maior</option>
              </select>
            </div>
            <div className="col-12 col-sm-5 align-self-center text-right pr-4 no-overflow no-break p-sm-1">
              <button type="button" name="viewBets" className={'ml-2  mr-1 btn btn-sm ' + (this.state.view_bets ? 'btn-secondary' : 'btn-outline-secondary')} onClick={() => { this.setState({ view_bets: !this.state.view_bets }) }}>Seleções</button>
              <b>Qtd: </b><span id="selected_qtd" className={'mr-2'}>{this.state.bets.length}</span>
              <button type="button" name="isGreen" className={'hidden-xs mr-2 btn btn-sm ' + (this.state.filter.isGreen ? 'btn-success' : 'btn-outline-success')} onClick={this.filterImportantClicked.bind(this)}>0.85</button>
              <button type="button" name="isYellow" className={'hidden-xs mr-2 btn btn-sm ' + (this.state.filter.isYellow ? 'btn-warning' : 'btn-outline-warning')} onClick={this.filterImportantClicked.bind(this)}>0.90</button>
              <button type="button" name="isRed" className={'hidden-xs mr-2 btn btn-sm ' + (this.state.filter.isRed ? 'btn-danger' : 'btn-outline-danger')} onClick={this.filterImportantClicked.bind(this)}>0.93</button>
              <button type="button" name="isImportant" className={'mr-1 btn btn-sm ' + (this.state.filter.isImportant ? 'btn-secondary' : 'btn-outline-secondary')} onClick={this.filterImportantClicked.bind(this)}>Importantes</button>
              <i className="mr-2 fas fa-wrench" onClick={this.customFilterOpen.bind(this)}></i>
              <b>Registros : {this.state.items.length}</b>
            </div>
            <div className="col-12 show-xs p-1 pb-0 text-right">
              <button type="button" className="btn btn-secondary btn-sm" onClick={this.hideFilter.bind(this)}>Fechar</button>
            </div>
          </div>
        </div>
        <div className="margin-top-filter" ></div>
        <div id="list">
          <div className="div-odds table-responsive" >
            <table id="table-odds" className="table table-dark table-hover table-bordered table-striped table-sm  table-scroll table-odds w-100" onClick={this.checkHideFilter} >
              <thead  >
                <tr>
                  <th></th>
                  <th onClick={common.tableSort.bind(this, 'start')} >Data</th>
                  <th onClick={common.tableSort.bind(this, 'league_name')} >Liga</th>
                  <th onClick={common.tableSort.bind(this, 'event_name')} >Evento</th>
                  <th onClick={common.tableSort.bind(this, 'odd_name')} >Mercado</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_365')} >A</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_pin')} >B</th>
                  <th onClick={common.tableSortNumber.bind(this, 'pin365')} >B / A</th>
                  <th onClick={common.tableSortNumber.bind(this, 'percent')}  >% EV</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items.map((x, i) => <tr key={i} id={'row_' + i} >
                  <td onClick={this.betAdd.bind(this, x, i)} id="" >{i + 1}
                  <i hidden={x.user_id !== '1'} className={'fas fa-user-graduate ml-1 float-right'}></i>
                  <i hidden={x.user_id !== '2'} className={'fas fa-user ml-1 float-right'}></i>
                  </td>
                  <td>{formatDate(x.start, "DD/MM/YYYY HH:mm")} <small className={'float-right'}>{x.updated_at}</small></td>
                  <td>{x.league_name}</td>
                  <td>{x.event_name}</td>
                  <td>{x.odd_name}</td>
                  <td>{common.odd365(x.odd_365)}</td>
                  <td>{x.odd_pin}</td>
                  <td className={this.formatP365(x.pin365)}>{x.pin365} </td>
                  <td>{x.percent}</td>
                </tr>)}
              </tbody>
            </table>
            <div className="div-table-bets" hidden={!this.state.view_bets}>
              <div className="table-responsive" >
                <table id="table-bets" className="table  table-bordered table-sm table-scroll table-bets w-100" >
                  <thead  >
                    <tr>
                      <th></th>
                      <th>Data</th>
                      <th>Liga</th>
                      <th>Evento</th>
                      <th>Mercado</th>
                      <th>A</th>
                      <th >B</th>
                      <th>B/A</th>
                      <th>% EV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.bets.map((x, i) => <tr key={i}>
                      <td onClick={this.betRemove.bind(this, x)} >{i + 1}</td>
                      <td>{formatDate(x.start, "DD/MM/YYYY - HH:mm")}hs
                  <div>{x.atualizacao}</div>
                      </td>
                      <td>{x.league_name}</td>
                      <td>{x.event_name}</td>
                      <td>{x.odd_name}</td>
                      <td>
                        {x.odd_365}
                        <div>{x.odd_365_new}</div>
                      </td>
                      <td>{x.odd_pin}
                        <div>{x.odd_pin_new}</div>
                      </td>
                      <td>
                        {x.pin365}
                      </td>
                      <td>
                        {x.percent}
                        <div>{x.percent_new}</div>
                      </td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Odds);
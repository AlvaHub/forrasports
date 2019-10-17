import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import { formatDate } from 'react-day-picker/moment';
import MyModal from './MyModal';
import CurrencyFormat from 'react-currency-format';
import 'moment/locale/pt-br';

class OddsEspnet extends Component {
  constructor(props) {
    super(props);


  }
  barList() {
    this.props.changeTitle({
      left: null,
      center: <div className="pointer" onClick={this.bindList.bind(this)}  ><div className="hidden-xs">Odds C</div></div>,
      right: <i className="fas fa-filter  ml-2 text-dark font-md show-xs" onClick={this.showFilter.bind(this)}></i>
    });
  }
  componentWillUnmount() {
    this.props.setChild(null);
  }
  componentDidMount() {

    this.props.setChild(this);

    let minutes = [];
    for (let index = 1; index < 31; index++)
      minutes.push(index);
    this.setState({ minutes });

    //BIND LIST
    this.barList();
    common.getData('data/odds.php?data=dates').then(
      (dates) => {
        dates.push(...this.state.datesPlus);
        if (dates.length > 0) {
          this.setState({ dates, filter_date: dates[0].id })
          setTimeout(() => { this.bindList(); }, 1);
        }
      }
    );
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

  }
  bindList() {
    this.props.show();
    let userId = common.getUser().id;
    common.getData('data/odds.php?data=espnet&date=' + this.state.filter_date + '&user_id=' + userId).then((items) => {


      // items.forEach(x => {
      //   if (x.odd_name === 'Home or Draw' || x.odd_name === 'Away or Draw') {
      //     let homeAway = x.odd_name === 'Home or Draw' ? 'Home' : 'Away';
      //     let search = items.filter(y => (y.odd_name === homeAway || y.odd_name === 'Draw') && x.event_name === y.event_name);
      //     if (search.length === 2) {
      //       let searchHome = search.find(y => y.odd_name === homeAway);
      //       let searchDraw = search.find(y => y.odd_name === 'Draw');
      //       x.espnet_home_draw = (1 / ((1 / Number(search[0].odd_espnet)) + (1 / Number(search[1].odd_espnet)))).toFixed(2);
      //       x.espnet_home = searchHome.odd_espnet;
      //       x.espnet_draw = searchDraw.odd_espnet;
      //       if (search[0].odd_365 && search[1].odd_365) {
      //         x.bet365_home_draw = (1 / ((1 / Number(search[0].odd_365)) + (1 / Number(search[1].odd_365)))).toFixed(2);
      //         x.bet365_home = searchHome.odd_365;
      //         x.bet365_draw = searchDraw.odd_365;
      //       }
      //       if (search[0].odd_pin && search[1].odd_pin) {
      //         x.pin_home_draw = (1 / ((1 / Number(search[0].odd_pin)) + (1 / Number(search[1].odd_pin)))).toFixed(2);
      //         x.pin_home = searchHome.odd_pin;
      //         x.pin_draw = searchDraw.odd_pin;
      //       }
      //       if (search[0].odd_espnet_sp && search[1].odd_espnet_sp) {
      //         x.espnet_sp_home_draw = (1 / ((1 / Number(search[0].odd_espnet_sp)) + (1 / Number(search[1].odd_espnet_sp)))).toFixed(2);
      //         x.espnet_sp_home = searchHome.odd_espnet_sp;
      //         x.espnet_sp_draw = searchDraw.odd_espnet_sp;
      //       }
      //     }
      //   }
      // });
      let bets = items.filter(x => x.user_id !== null);
      this.setState({ itemsAll: items.filter(x => x.user_id === null), bets });
      setTimeout(() => { this.filterImportant() }, 1);
    });
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
    minutes: [],
    view_bets: null
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

    this.setState({ filter });
    setTimeout(() => { this.filterImportant(e) }, 1);
  }
  filterImportant = () => {
    let filter = this.state.filter;
    var items = this.state.itemsAll;

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

      if (filter.isBothScore) {
        items = this.state.items.filter(x => x.odd_name.indexOf('Both') > -1);
      }
    }
    else if (filter.isBothScore) {
      items = this.state.itemsAll.filter(x => x.odd_name.indexOf('Both') > -1);
    }
    this.setState({ items });
    this.props.hide();
  }
  formatP365(value) {
    if (!value)
      return "";
    var css = "";
    if (value < 0.85)
      css = "bg-green";
    else if (value < 0.9)
      css = "bg-yellow";
    else if (value < 0.93)
      css = "bg-red";

    return css;

  }
  formatEV(value) {
    var css = "";
    if (value >= 5)
      css = "bg-green text-white";
    else if (value >= 3.5)
      css = "bg-yellow text-white";
    else if (value >= 2)
      css = "bg-red text-white";

    return css;

  }
  formatP365Light(value) {
    var css = "";
    if (value < 0.85)
      css = "bg-success pl-1 rounded text-white";
    else if (value < 0.9)
      css = "bg-yellow pl-1 rounded text-white";
    else if (value < 0.93)
      css = "bg-red pl-1 rounded text-white";

    return css;

  }
  filterDate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
    setTimeout(() => { this.bindList(); }, 1);
  }
  betAdd = (x, index, e) => {
    let bets = this.state.bets;
    x.user_id = common.getUser().id.toString();
    if (bets.find(y => y.id_365 === x.id_365 && y.odd_name === x.odd_name) != null) {
      if (window.confirm('Aposta já adicionada. Deseja remover?')) {
        this.betRemove(x, e);
      }
      return;
    }


    //Blink Effect
    var row = document.getElementById('row_' + index);
    row.className = row.className.replace(" add-blink", "");

    common.postData("data/betuser.php?data=insert", x).then((data) => {
      if (data === "1") {
        x.user_odd_365 = x.odd_365;
        x.user_odd_pin = x.odd_pin;
        x.user_pin365 = x.pin365;
        x.user_percent = x.percent;

        bets.push(x);
        let items = this.state.items;
        items.splice(index, 1);

        this.setState({ items, bets });
        //Blink Effect
        row.className = row.className + " add-blink";
      }
    });
  }
  betRemove = (x, e) => {

    if (!window.confirm("Deseja cancelar esta aposta?"))
      return;

    let bets = this.state.bets;
    x.user_id = common.getUser().id;

    common.postData("data/betuser.php?data=delete", x).then((data) => {

      if (data === "1") {
        let index = bets.indexOf(x);
        bets.splice(index, 1);
        let items = this.state.items;
        items.push(x);
        x.user_id = null;
        this.setState({ items, bets });
      }
    });
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
              <div className="col-12 p-1 pt-2 text-right" >
                <button type="button" className={'btn btn-secondary'} onClick={this.customFilterSave.bind(this)}>Salvar</button>
              </div>
            </div>
          </div>
        </MyModal>
        <div className="filter hidden-xs" id="filter">
          <div className="row no-gutters text-dark" >
            <div className="col-12 col-sm-3 p-sm-1" >
              <input type="text" className="form-control form-control-sm" name="filter_search" value={this.state.filter_search} onChange={this.filter.bind(this)} placeholder="Buscar..." />
            </div>
            <div className="col-12 col-sm-2 p-sm-1" >
              <select className="form-control form-control-sm" name="filter_date" onChange={this.filterDate} value={this.state.filter_date} >
                {this.state.dates.map(x => <option key={x.id} value={x.id}> {x.id.indexOf("-") < 0 ? x.name : formatDate(x.name, "DD/MM/YY dddd")}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm align-self-center no-overflow no-break p-sm-1">
              {/* <select className="form-control form-control-sm" name="filter_bet365Greater" onChange={this.filter.bind(this)} value={this.state.filter_bet365Greater}>
                <option value="0">Mais Filtro</option>
                <option value="lower">Bet365 Menor</option>
                <option value="greater">Bet365 Maior</option>
              </select> */}
              <b>A:
                <span className="bg-secondary p-1 text-white ml-1">{this.state.bets.filter(x => x.odd_365 === x.user_odd_365).length}</span>
                <span className="bg-success p-1 text-white ">{this.state.bets.filter(x => x.odd_365 < x.user_odd_365).length}</span>
                <span className="bg-danger p-1 text-white ">{this.state.bets.filter(x => x.odd_365 > x.user_odd_365).length}</span>
              </b>
              <b className="ml-2">B:
                <span className="bg-secondary p-1 text-white ml-1">{this.state.bets.filter(x => x.odd_pin === x.user_odd_pin).length}</span>
                <span className="bg-success p-1 text-white ">{this.state.bets.filter(x => x.odd_pin < x.user_odd_pin).length}</span>
                <span className="bg-danger p-1 text-white ">{this.state.bets.filter(x => x.odd_pin > x.user_odd_pin).length}</span>
              </b>
              <b className="ml-2">P:
                <span className="bg-secondary p-1 text-white ml-1">{this.state.bets.filter(x => x.pin365 === x.user_pin365).length}</span>
                <span className="bg-success p-1 text-white ">{this.state.bets.filter(x => x.pin365 < x.user_pin365).length}</span>
                <span className="bg-danger p-1 text-white ">{this.state.bets.filter(x => x.pin365 > x.user_pin365).length}</span>
              </b>
            </div>
            <div className="col-12 col-sm-5 col-md-auto  align-self-center text-right pr-4 no-overflow no-break p-sm-1">
              <button type="button" name="viewBets" className={'ml-2  mr-1 btn btn-sm ' + (this.state.view_bets ? 'btn-secondary' : 'btn-outline-secondary')} onClick={() => { this.setState({ view_bets: !this.state.view_bets }) }}>Seleções</button>
              <b>Qtd: </b><span id="selected_qtd" className={'mr-2'}>{this.state.bets.length}</span>
              <button type="button" name="isBothScore" className={'mr-1 btn btn-sm ' + (this.state.filter.isBothScore ? 'btn-info' : 'btn-outline-info')} onClick={this.filterImportantClicked.bind(this)}>Ambas M</button>
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
          <div className="div-odds-espnet table-responsive" >
            <table id="table-odds-espnet" className="table-odds-espnet table-scroll table-odds w-100" onClick={this.checkHideFilter} >
              <thead  >
                <tr>
                  <th></th>
                  <th onClick={common.tableSort.bind(this, 'start')} >Data</th>
                  <th onClick={common.tableSort.bind(this, 'updated_at')} >Min</th>
                  <th onClick={common.tableSort.bind(this, 'league_name')} >Liga</th>
                  <th onClick={common.tableSort.bind(this, 'event_name')} >Evento</th>
                  <th onClick={common.tableSort.bind(this, 'odd_name')} >Mercado</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_365')} >A</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_pin')} >B</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_espnet')} >C</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_espnet_sp')} >D</th>
                  <th onClick={common.tableSortNumber.bind(this, 'pin365')} >B / A</th>
                  <th onClick={common.tableSortNumber.bind(this, 'bet365Espnet')} >A / C</th>
                  <th onClick={common.tableSortNumber.bind(this, 'pinEspnet')} >B / C</th>
                  <th onClick={common.tableSortNumber.bind(this, 'bet365Espnet_sp')} >A / D</th>
                  <th onClick={common.tableSortNumber.bind(this, 'pinEspnet_sp')} >B / D</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items.map((x, i) => <tr key={i} id={'row_' + i} >
                  <td onClick={this.betAdd.bind(this, x, i)} id="" >{i + 1}
                    <i hidden={x.user_id !== '1'} className={'fas fa-user-graduate ml-1 float-right'}></i>
                    <i hidden={x.user_id !== '2'} className={'fas fa-user ml-1 float-right'}></i>
                  </td>
                  <td>{formatDate(x.start, "DD/MM HH:mm")}</td>
                  <td><small>
                    <span hidden={!x.updated_at} className={x.updated_at > 30 ? 'text-warning font-weight-bold' : ''}>{x.updated_at}/</span>
                    <span hidden={!x.updated_at_pin} className={x.updated_at_pin > 30 ? 'text-warning font-weight-bold' : ''}>{x.updated_at_pin}/</span>
                    <span className={x.updated_at_espnet > 30 ? 'text-warning font-weight-bold' : ''}>{x.updated_at_espnet}</span>
                  </small></td>
                  <td>{x.league_name}</td>
                  <td>{x.event_name}</td>
                  <td className={Number(x.diff_line) === 0 ? "" : "text-warning font-weight-bold"}>{x.odd_name}</td>
                  <td  className={x.home_away_365 ? 'odd-atificial' : ''} title={x.home_away_365 ? x.home_away_365 + ' ' + x.draw_365 + ' Original: ' + x.odd_original_365 : ''} >{common.odd365(x.odd_365)}<span className="text-warning ml-1" hidden={!x.bet365_home_draw} title={x.bet365_home + ' ' + x.bet365_draw} >{x.bet365_home_draw}</span></td>
                  <td>{x.odd_pin}<span className="text-warning ml-1" hidden={!x.pin_home_draw} title={x.pin_home + ' ' + x.pin_draw} >{x.pin_home_draw}</span></td>
                  <td className={x.home_away_espnet ? 'odd-atificial' : ''} title={x.home_away_espnet ? x.home_away_espnet + ' ' + x.draw_espnet+ ' Original: ' + x.odd_original_espnet : ''} >{x.odd_espnet}<span className="text-warning ml-1" hidden={!x.espnet_home_draw} title={x.espnet_home + ' ' + x.espnet_draw} >{x.espnet_home_draw}</span></td>
                  <td>{x.odd_espnet_sp}<span className="text-warning ml-1" hidden={!x.espnet_sp_home_draw} title={x.espnet_sp_home + ' ' + x.espnet_sp_draw} >{x.espnet_sp_home_draw}</span></td>
                  <td className={this.formatP365(x.pin365)}>{x.pin365} </td>
                  <td className={this.formatP365(x.bet365Espnet)}>{x.bet365Espnet} </td>
                  <td className={this.formatP365(x.pinEspnet)}>{x.pinEspnet} </td>
                  <td className={this.formatP365(x.bet365Espnet_sp)}>{x.bet365Espnet_sp} </td>
                  <td className={this.formatP365(x.pinEspnet_sp)}>{x.pinEspnet_sp} </td>
                </tr>)}
              </tbody>
            </table>
            <div className={'div-table-bets ' + (this.state.view_bets === null ? '' : (this.state.view_bets ? 'show' : 'hide'))} >
              <div className="table-responsive" >
                <table id="table-bets" className="table  table-bordered table-sm table-scroll table-bets w-100" >
                  <thead  >
                    <tr>
                      <th></th>
                      <th>Data</th>
                      <th>Min</th>
                      <th>Liga</th>
                      <th>Evento</th>
                      <th>Mercado</th>
                      <th>A</th>
                      <th>B</th>
                      <th>B / A</th>
                      <th>% EV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.bets.map((x, i) => <tr key={i}>
                      <td onClick={this.betRemove.bind(this, x)} >{i + 1}</td>
                      <td>{formatDate(x.start, "DD/MM HH:mm")}
                        <div>{x.atualizacao}</div>
                      </td>
                      <td><small>{x.updated_at}/{x.updated_at_pin}</small></td>
                      <td>{x.league_name}</td>
                      <td>{x.event_name}</td>
                      <td>{x.odd_name}</td>
                      <td className={(Number(x.user_odd_365) === Number(x.odd_365) ? '' : (Number(x.user_odd_365) > Number(x.odd_365) ? 'text-white bg-success ' : 'text-white bg-red'))} >
                        {common.odd365(x.odd_365)}
                        <div>{common.odd365(x.user_odd_365)}</div>
                      </td>
                      <td className={(Number(x.user_odd_pin) === Number(x.odd_pin) ? '' : (Number(x.user_odd_pin) > Number(x.odd_pin) ? 'text-white bg-success ' : 'text-white bg-red'))} >
                        {x.odd_pin}
                        <div>{x.user_odd_pin}</div>
                      </td>
                      <td className={(Number(x.user_pin365) === Number(x.pin365) ? '' : (Number(x.user_pin365) > Number(x.pin365) ? 'text-white bg-success ' : 'text-white bg-red'))} >
                        <div>{x.pin365}</div>
                        <div>{x.user_pin365}</div>
                      </td>
                      <td>{x.percent}
                        <div>{x.user_percent}</div>
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

export default withRouter(OddsEspnet);

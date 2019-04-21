import React, { Component } from 'react';
import * as common from './Common';
import MyModal from './MyModal';
import CurrencyFormat from 'react-currency-format';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';

class OddHistory extends Component {
  constructor(props) {
    super(props);

    this.barList();


  }
  componentDidMount() {
    this.bindList();
    //DATES
    common.getData('data/oddhistory.php?data=dates').then((dates) => {
      this.setState({ dates });
    });
  }
  state = {
    items: [],
    itemsAll: [],
    sortField: '',
    itemsByOdd: [],
    filter: {
      user_id: common.getUser().id,
      result: null,
      show_bet_user: false,
      date: "0"
    },
    stats: {
      odd_W: [], odd_L: [], odd_AN: [], odd_HW: [], odd_HL: []
    },
    bets_valid_count: 0,
    proportion: 1,
    bet_return: 0,
    dates: []
  }
  barList() {
    this.props.changeTitle({
      left: null, center: <div className="pointer" onClick={this.bindList.bind(this)}>Histórico</div>,
      right: <div>
        <button className="btn btn-secondary btn-sm mr-3 btn-loading" onClick={this.getResults.bind(this)} >Atualizar</button>
        <i className="fas fa-user mr-3 font-md pointer show-md" onClick={this.showBetUser.bind(this)} ></i>
        <i className="fas fa-filter text-dark font-md show-md" onClick={this.showFilter.bind(this)}></i>
      </div>
    });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  getResults = () => {
    this.props.show();
    var that = this;
    common.getData('match_result.php').then((data) => {

      if (data !== "1") {
        return alert("Não foi possível atualizar os resultados!");
        that.props.hide();
      }
      else {
        this.bindList();
      }
    });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('data/oddhistory.php?data=odd_history&date=' + this.state.filter.date).then((data) => {
      var bets_valid_count = 0;
      that.props.hide();
      let stats = this.state.stats;
      data.forEach(x => {
        if (x.result === "W") {
          x.bet_result = parseFloat(x.odd_365_max) - 1;
          stats.odd_W.push(x.odd_365_max);
        }
        else if (x.result === "L") {
          x.bet_result = -1;
          stats.odd_L.push(x.odd_365_max);
        }
        else if (x.result === "AN") {
          x.bet_result = 0;
          stats.odd_AN.push(x.odd_365_max);
        }
        else if (x.result === "HW") {
          x.bet_result = (parseFloat(x.odd_365_max) - 1) / 2;
          stats.odd_HW.push(x.odd_365_max);
        }
        else if (x.result === "HL") {
          x.bet_result = 0.5;
          stats.odd_HL.push(x.odd_365_max);
        }
        else
          x.bet_result = 0;
        if (x.result && x.result !== "")
          bets_valid_count++;
      });
      this.setState({ itemsAll: data, bets_valid_count });
      this.processFilter();
    });
    common.getData('data/oddhistory.php?data=group_by_odd&date=' + this.state.filter.date).then((itemsByOdd) => {
      this.setState({ itemsByOdd });
    });
  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData() });
    document.getElementById('new').className = 'form come';
    document.getElementById('list').className = 'hidden';
    document.getElementById('filter').className = 'hidden';

    this.barForm();
  }
  back() {
    this.barList();
    document.getElementById('new').className = 'form go';
    document.getElementById('list').className = 'table-responsive';
    document.getElementById('filter').className = 'filter';
    common.scrollLast();
  }
  editData(item) {
    this.props.show();
    common.getData('parameter/' + item.id).then((data) => {
      this.props.hide();
      common.scrollTop();
      data.active = data.active === 1;
      this.setState({ data: data })
      document.getElementById('new').className = 'form come';
      document.getElementById('list').className = 'hidden';
      document.getElementById('filter').className = 'hidden';
      this.barForm();
    });
  }
  save() {
    this.props.show();
    var that = this;
    common.postData('parameter', this.state.data).then(function (data) {
      that.props.hide();
      that.bindList();
      that.back();
    });

  }
  getNewData() {

    return {
      id: 0,
      active: 1,
      permission_id: 1
    }
  }
  handleChange = e => {
    let data = this.state.data;
    if (e.target.type === 'checkbox')
      data[e.target.name] = e.target.checked ? 1 : 0;
    else
      data[e.target.name] = e.target.value;

    this.setState({ data })

  }
  filter(e) {
    let items = [];
    let value = e.target.value.toUpperCase();

    if (e.target.value === '')
      items = this.state.itemsAll;
    else
      items = this.state.itemsAll.filter(x =>
        ((x.league_name + "").toUpperCase().indexOf(value) >= 0
          || (x.event_name + "").toUpperCase().indexOf(value) >= 0
          || (x.odd_name + "").toUpperCase().indexOf(value) >= 0));

    this.setState({ items });
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
  showStats = (index, e) => {

    //If filter is open just close and do no action.
    if (this.checkHideFilter()) return;

    let items = this.state.items;
    items[index].show = !items[index].show;
    this.setState({ items });
  }
  showStatsAll = () => {
    let items = this.state.items;
    let showStatsAll = !this.state.showStatsAll;
    items.forEach(x => x.show = showStatsAll);
    this.setState({ items, showStatsAll });
  }

  showOddsTable = () => {
    this.setState({ showModal: true })
  }
  showFilter() {
    var css = document.getElementById('filter').className;
    css = css.indexOf('hidden-md') > 0 ? 'filter' : 'filter hidden-md';
    document.getElementById('filter').className = css;
  }
  hideFilter() {
    document.getElementById('filter').className = 'filter hidden-md';
  }
  checkHideFilter = () => {
    var css = document.getElementById('filter').className;
    if (css.indexOf('hidden-md') < 0) {
      document.getElementById('filter').className = 'filter hidden-md';
      return true;
    }
    return false;
  }
  //FILTER DATE
  filterDate = (e) => {
    let filter = this.state.filter;
    filter.date = e.target.value;
    setTimeout(() => { this.bindList(); }, 1);
  }
  //FILTER RESULT
  filterResult = (result, e) => {

    let items = this.state.itemsAll;
    let filter = this.state.filter;
    if (filter.last_result !== result)
      filter.result = result;
    else
      filter.result = null;

    filter.last_result = filter.last_result === result ? "" : result;
    this.setState({ filter });
    this.processFilter();

  }
  //FILTER USER
  showBetUser = () => {
    let filter = this.state.filter;
    filter.show_bet_user = !filter.show_bet_user;
    this.setState({ filter });
    this.processFilter();
  }
  //FILTER USER SPECIFIC
  showBetUserSpecific = (e) => {
    let filter = this.state.filter;
    filter.user_id = e.target.value;
    filter.show_bet_user = true;
    this.setState({ filter });
    this.processFilter();
  }
  //PROCESS FILTER
  processFilter = () => {

    setTimeout(() => {
      let filter = this.state.filter;
      let items = this.state.itemsAll;
      items = items.filter(x => (filter.result ? (x.result === filter.result) : true) &&
        (!filter.show_bet_user ? true : filter.user_id === "0" ? x.user_id != null : (x.user_id + "").indexOf(filter.user_id) > -1));

      let bet_return = this.getBetReturn(items, this.state.proportion);
      this.setState({ items, bet_return });
    }, 1);
  }
  setProportion = (e) => {
    if (e.target.value > 0) {
      let bet_return = this.getBetReturn(this.state.items, Number(e.target.value));
      this.setState({ proportion: Number(e.target.value), bet_return });
    }
  }
  getBetReturn(items, proportion) {
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      total += isNaN(items[i]['bet_result']) ? 0 : Number(items[i]['bet_result'] * proportion);
    }
    return total;
  }


  render() {

    return (
      <React.Fragment>
        <MyModal handleShow={this.state.showModal} handleClose={() => { this.setState({ showModal: false }) }} title="Análises" >
          <div className="row p-1" >
            <div className="mb-3 col-12">
              <div className="font-weight-bold mb-1">Cotação Média x Resultado</div>
              <div className="result-label result-W" onClick={this.showOddsTable} >{this.state.stats.odd_W.average()} </div>
              <div className="result-label result-L" onClick={this.showOddsTable}>{this.state.stats.odd_L.average()} </div>
              <div className="result-label result-AN" onClick={this.showOddsTable}>{this.state.stats.odd_AN.average()} </div>
              <div className="result-label result-HW" onClick={this.showOddsTable}>{this.state.stats.odd_HW.average()} </div>
              <div className="result-label result-HL" onClick={this.showOddsTable}>{this.state.stats.odd_HL.average()} </div>
            </div>
            <div className="col-12">
              <div className="font-weight-bold mb-1">Cotação x Resultado</div>
              <table className="table table-dark table-hover table-bordered table-striped table-sm table-odds-group" >
                <thead>
                  <tr>
                    <th>Odd</th>
                    <th>Qtd</th>
                    <th className="result-W text-center">W</th>
                    <th className="result-L text-center">L</th>
                    <th className="result-AN text-center">AN</th>
                    <th className="result-HW text-center">HW</th>
                    <th className="result-HL text-center">HL</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.itemsByOdd.map((x, i) => <tr key={i} >
                    <td>{x.odd}</td>
                    <td>{x.qtd}</td>
                    <td>{x.W} <b className="text-warning">{((x.W / x.qtd) * 100).toFixed(0)}%</b></td>
                    <td>{x.L} <b className="text-warning">{((x.L / x.qtd) * 100).toFixed(0)}%</b></td>
                    <td>{x.AN} <b className="text-warning">{((x.AN / x.qtd) * 100).toFixed(0)}%</b></td>
                    <td>{x.HW} <b className="text-warning">{((x.HW / x.qtd) * 100).toFixed(0)}%</b></td>
                    <td>{x.HL} <b className="text-warning">{((x.HL / x.qtd) * 100).toFixed(0)}%</b></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </MyModal>
        <div className="filter hidden-md" id="filter" >
          <div className="row no-gutters">
            <div className="col-md-2 p-sm-1">
              <select name="dates" value={this.state.filter.date} className="form-control form-control-sm" onChange={this.filterDate.bind(this)} >
                {this.state.dates.map(x => <option key={x.date_start} value={x.date_start} >{formatDate(x.date_start, 'YY/MM/DD dd')} ({x.count})</option>)}
              </select>
            </div>
            <div className="col-md-3 p-sm-1 no-overflow no-break align-self-center">
              <b>Qtd: </b>
              <div className="result-label result-W" onClick={this.filterResult.bind(this, "W")}>{this.state.items.filter(x => x.result === "W").length} </div>
              <div className="result-label result-L" onClick={this.filterResult.bind(this, "L")}>{this.state.items.filter(x => x.result === "L").length} </div>
              <div className="result-label result-AN" onClick={this.filterResult.bind(this, "AN")}>{this.state.items.filter(x => x.result === "AN").length} </div>
              <div className="result-label result-HW" onClick={this.filterResult.bind(this, "HW")}>{this.state.items.filter(x => x.result === "HW").length} </div>
              <div className="result-label result-HL" onClick={this.filterResult.bind(this, "HL")}>{this.state.items.filter(x => x.result === "HL").length} </div>
              <div className="block-inline position-relative" style={{ top: 5 }}><i className="fas fa-chart-bar ml-2 pointer" onClick={this.showOddsTable} style={{ fontSize: 22 }}  ></i></div>
            </div>
            <div className="col-md-1 p-sm-1 no-overflow no-break align-self-center">
              <select className="form-control form-control-sm" name="user_id" value={this.state.filter.user_id} onChange={this.showBetUserSpecific.bind(this)} >
                <option value="0">T</option>
                <option value="2">P</option>
                <option value="1">A</option>
              </select>
            </div>
            <div className="col-md-4 p-sm-1 no-overflow no-break align-self-center">
              <i className="fas fa-user mr-2 font-lg pointer" onClick={this.showBetUser.bind(this)} ></i>
              <button className={'mr-2 btn btn-sm ' + (this.state.showStatsAll ? 'btn-secondary' : 'btn-outline-secondary')} onClick={this.showStatsAll}>Stats</button>
              <CurrencyFormat type="tel" className="form-control form-control-sm block-inline mr-2 no-focus" style={{ width: 50 }} onChange={this.setProportion.bind(this)} value={this.state.proportion} ></CurrencyFormat>
              <b>Stake: </b><b className="text-secondary">{common.formatNumber(this.state.items.filter(y => y.result !== "").length * this.state.proportion)}</b>
              <b className="ml-2">Return: </b>{common.formatNumber(this.state.bet_return, true)}
              <b className="ml-2"></b>{((this.state.bet_return / (this.state.items.filter(y => y.result !== "").length * this.state.proportion)) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="margin-top-filter-md" ></div>
        <div id="list" className="table-responsive">
          <table id="table-odds-history" className="table table-dark table-hover table-bordered table-striped table-sm  table-scroll table-odds-history w-100" >
            <thead  >
              <tr>
                <th></th>
                <th onClick={common.tableSort.bind(this, 'start')} >Data</th>
                <th onClick={common.tableSort.bind(this, 'league_name')} >Liga</th>
                <th onClick={common.tableSort.bind(this, 'event_name')} >Evento</th>
                <th onClick={common.tableSort.bind(this, 'odd_name')} >Mercado</th>
                <th onClick={common.tableSortNumber.bind(this, 'odd_365_max')} >A</th>
                <th onClick={common.tableSortNumber.bind(this, 'odd_pin')} >B</th>
                <th onClick={common.tableSortNumber.bind(this, 'pin365')} >B / A</th>
                <th onClick={common.tableSortNumber.bind(this, 'percent')}  >% EV</th>
                <th onClick={common.tableSort.bind(this, 'created_at')}  >Atualizado</th>
                <th onClick={common.tableSort.bind(this, 'result')} className="text-center"  >Res</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((x, i) => <React.Fragment key={i}>
                <tr onClick={this.showStats.bind(this, i)}>
                  <td>{i + 1}
                    {x.user_id && x.user_id.split(',').map((y, i) =>
                      y === "1" ? <i key={i} className={'fas fa-user-graduate ml-1 float-right ' + x.result}></i> :
                        <i key={i} className={'fas fa-user ml-1 float-right ' + x.result}></i>
                    )}
                  </td>
                  <td>{formatDate(x.start, "DD/MM/YYYY HH:mm")}</td>
                  <td>{x.league_name}</td>
                  <td>{x.event_name}</td>
                  <td>{x.odd_name}</td>
                  <td>{x.odd_365.split(',').map((y, i) => <div key={i} >{common.odd365(y)}</div>)}</td>
                  <td>{x.odd_pin.split(',').map((y, i) => <div key={i} >{y}</div>)}</td>
                  <td >{x.pin365.split(',').map((y, i) => <div key={i} className={this.formatP365(y)} >{y}</div>)} </td>
                  <td>{x.percent.split(',').map((y, i) => <div key={i} >{y}</div>)}</td>
                  <td>{x.created_at.split(',').map((y, i) => <div key={i} >{formatDate(y, "DD/MM HH:mm")}</div>)}</td>
                  <td style={{ verticalAlign: 'middle' }} className={'result ' + x.result}><span>{x.result}</span></td>
                </tr>
                <tr hidden={!x.show}>
                  <td colSpan="100" className="match-stats">
                    <div className="row no-gutters" >
                      <div className="col-3 item" >
                        <div className="title text-light">Home Away</div>
                        <div><b>H: </b>{x.home_first} x {x.away_first}<b>F: </b>{x.home_full} x {x.away_full}</div>
                        <span className="text-total">{x.home_full} x {x.away_full}</span>
                      </div>
                      <div className="col-3 alternate" >
                        <div className="title text-primary">Goals Totals</div>
                        <div><b>H: </b>{x.goals_first}<b>F: </b>{x.goals_full}</div>
                        <b className="text-total">{x.goals_full}</b>
                      </div>
                      <div className="col-3 item" >
                        <div className="title text-success">Corners</div>
                        <div><b>H: </b>{x.corner_home_first} x {x.corner_away_first}
                          <b>F: </b>{x.corner_home_full} x {x.corner_away_full}
                          <br />{
                            <b className="text-total">{x.corner_home_full && x.corner_away_full && parseInt(x.corner_home_full) + parseInt(x.corner_away_full)}</b>}
                        </div>
                      </div>
                      <div className="col-3 alternate" >
                        <div className="title text-danger">Cards</div>
                        <div><b>H: </b>{x.card_home_first} x {x.card_away_first}
                          <b>F: </b>{x.card_home_full} x {x.card_away_full}
                          <br /><b className="text-total">{x.card_home_full && x.card_away_full && parseInt(x.card_home_full) + parseInt(x.card_away_full)}</b>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>)}
            </tbody>
          </table>
        </div>
      </React.Fragment >
    );
  }
}

export default OddHistory;

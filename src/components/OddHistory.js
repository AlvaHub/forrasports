import React, { Component } from 'react';
import * as common from './Common';
import { formatDate } from 'react-day-picker/moment';
import MyModal from './MyModal';


class OddHistory extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();

  }
  state = {
    items: [],
    itemsAll: [],
    sortField: '',
    itemsByOdd: [],
    filter: '',
    permissions: [],
    bets_valid_count : 0,
    data: {},
    stats: {
      odd_W: [], odd_L: [], odd_AN: [], odd_HW: [], odd_HL: []
    }

  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Histórico' });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('data/oddhistory.php?data=odd_history').then((data) => {
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
      })
      this.setState({ items: data, itemsAll: data, bets_valid_count })
    });
    common.getData('data/oddhistory.php?data=group_by_odd').then((itemsByOdd) => {
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
  filterResult = (result, e) => {
    this.props.show();
    let items = this.state.itemsAll;
    if (this.state.last_filter_result !== result)
      items = this.state.itemsAll.filter(x => x.result === result);

    this.setState({ items, last_filter_result: this.state.last_filter_result === result ? "" : result });
    setTimeout(() => {
      this.props.hide();
    }, 1000);
  }
  showOddsTable = () => {
    this.setState({ showModal: true })
  }
  render() {

    return (
      <React.Fragment>
        <MyModal handleShow={this.state.showModal} handleClose={() => { this.setState({ showModal: false }) }} title="Odds Table" >
          <div className="row p-1" >
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
                  <td>{x.W} <b>{((x.W / x.qtd) * 100).toFixed(0)}%</b></td>
                  <td>{x.L} <b>{((x.L / x.qtd) * 100).toFixed(0)}%</b></td>
                  <td>{x.AN} <b>{((x.AN / x.qtd) * 100).toFixed(0)}%</b></td>
                  <td>{x.HW} <b>{((x.HW / x.qtd) * 100).toFixed(0)}%</b></td>
                  <td>{x.HL} <b>{((x.HL / x.qtd) * 100).toFixed(0)}%</b></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </MyModal>
        <div className="filter" id="filter" >
          <div className="row no-gutters">
            <div className="col-md-2 p-sm-1">
              <input type="text" name="showStatsAll" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-md-3 p-sm-1 no-overflow no-break">
              <b>Qtd: </b>
              <div className="result-label result-W" onClick={this.filterResult.bind(this, "W")}>{this.state.items.filter(x => x.result === "W").length} </div>
              <div className="result-label result-L" onClick={this.filterResult.bind(this, "L")}>{this.state.items.filter(x => x.result === "L").length} </div>
              <div className="result-label result-AN" onClick={this.filterResult.bind(this, "AN")}>{this.state.items.filter(x => x.result === "AN").length} </div>
              <div className="result-label result-HW" onClick={this.filterResult.bind(this, "HW")}>{this.state.items.filter(x => x.result === "HW").length} </div>
              <div className="result-label result-HL" onClick={this.filterResult.bind(this, "HL")}>{this.state.items.filter(x => x.result === "HL").length} </div>
            </div>
            <div className="col-md-3 p-sm-1 no-overflow no-break">
              <b>Odd AVG: </b>
              <div className="result-label result-W" onClick={this.showOddsTable} >{this.state.stats.odd_W.average()} </div>
              <div className="result-label result-L" onClick={this.showOddsTable}>{this.state.stats.odd_L.average()} </div>
              <div className="result-label result-AN" onClick={this.showOddsTable}>{this.state.stats.odd_AN.average()} </div>
              <div className="result-label result-HW" onClick={this.showOddsTable}>{this.state.stats.odd_HW.average()} </div>
              <div className="result-label result-HL" onClick={this.showOddsTable}>{this.state.stats.odd_HL.average()} </div>
            </div>
            <div className="col-md-4 p-sm-1 no-overflow no-break align-self-center">
            <button className={'mr-2 btn btn-sm ' + (this.state.showStatsAll ? 'btn-secondary' : 'btn-outline-secondary')} onClick={this.showStatsAll}>Stats</button>
              <b>Stake: </b><b className="text-primary">{common.formatNumber(this.state.bets_valid_count)}</b>
              <b className="ml-2">Return: </b>{this.state.items.sum('bet_result', true)}
            </div>
          </div>
        </div>
        <div className="div-table" ></div>
        <div id="list" className="table-responsive">
          <table id="table-odds-history" className="table table-dark table-hover table-bordered table-striped table-sm  table-scroll table-odds-history w-100" onClick={this.checkHideFilter} >
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
                  <td>{i + 1}</td>
                  <td>{formatDate(x.start, "DD/MM/YYYY HH:mm")}</td>
                  <td>{x.league_name}</td>
                  <td>{x.event_name}</td>
                  <td>{x.odd_name}</td>
                  <td>{x.odd_365.split(',').map((y, i) => <div key={i} >{common.odd365(y)}</div>)}</td>
                  <td>{x.odd_pin.split(',').map((y, i) => <div key={i} >{y}</div>)}</td>
                  <td >{x.pin365.split(',').map((y, i) => <div key={i} className={this.formatP365(y)} >{y}</div>)} </td>
                  <td>{x.percent.split(',').map((y, i) => <div key={i} >{y}</div>)}</td>
                  <td>{x.created_at.split(',').map((y, i) => <div key={i} >{formatDate(y, "DD/MM HH:mm")}</div>)}</td>
                  <td className={'result ' + x.result}><span>{x.result}</span></td>
                </tr>
                <tr hidden={!x.show}>
                  <td colSpan="100" className="match-stats">
                    <div className="row no-gutters" >
                      <div className="col-md-3 item" >
                        <div className="title text-light">Home Away</div>
                        <div><b>H: </b>{x.home_first} x {x.away_first}<b>F: </b>{x.home_full} x {x.away_full}</div>
                        <span className="text-total">{x.home_full} x {x.away_full}</span>
                      </div>
                      <div className="col-md-3 alternate" >
                        <div className="title text-primary">Goals Totals</div>
                        <div><b>H: </b>{x.goals_first}<b>F: </b>{x.goals_full}</div>
                        <b className="text-total">{x.goals_full}</b>
                      </div>
                      <div className="col-md-3 item" >
                        <div className="title text-success">Corners</div>
                        <div><b>H: </b>{x.corner_home_first} x {x.corner_away_first}
                          <b>F: </b>{x.corner_home_full} x {x.corner_away_full}
                          <br />{
                            <b className="text-total">{x.corner_home_full && x.corner_away_full && parseInt(x.corner_home_full) + parseInt(x.corner_away_full)}</b>}
                        </div>
                      </div>
                      <div className="col-md-3 alternate" >
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

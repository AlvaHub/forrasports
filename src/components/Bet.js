import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import WeekSelector from './WeekSelector';
import { formatDate} from 'react-day-picker/moment';
import 'moment/locale/pt-br';
import MyModal from './MyModal';
import { relativeTimeThreshold, parseZone } from 'moment';
// import DayPickerInput from 'react-day-picker/DayPickerInput';
// import 'react-day-picker/lib/style.css';
// import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
// import 'moment/locale/pt-br';

class Bet extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.barList();
  }
  barList() {
    this.props.changeTitle({
      left: null, center: <div className="pointer" onClick={this.weekChanged.bind(this, null)} >Consolidado
       <small  className="last-update">{this.state.lastBetTime ? "Atualização: " + formatDate(this.state.lastBetTime.date,"DD/MM H:mm") + common.formatMinutes(this.state.lastBetTime.minutes) : "" }</small></div>, right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div>
    });
  }
  barForm = (title) => {
    this.props.changeTitle({
      left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title,
      right: <div>
        <i className="fas fa-trash-alt mr-4" onClick={this.deleteBets}></i>
        <i className="fas fa-exchange-alt mr-2" onClick={() => { this.setState({ showModal: true, login_destination: "0" }); }}></i>

      </div>
    });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form  pb-0 go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter hidden-xs';
    common.scrollLast();

  }
  viewDetail(item) {
    this.props.show();

    //Copy Header of selected item to show on detail screen
    document.getElementById("table-detail-head").innerHTML = document.getElementById("table-consolidado-head").outerHTML;
    document.getElementById("table-detail-head-xs").innerHTML = document.getElementById("table-consolidado-head-xs").outerHTML;

    //Copy Row of selected item on detail screen
    document.getElementById("table-detail-body").innerHTML = document.getElementById(item.conta).outerHTML;
    document.getElementById("table-detail-body-xs").innerHTML = document.getElementById(item.conta + '-xs').outerHTML;

    let date_from = this.state.week_id.split('|')[0];
    let date_to = this.state.week_id.split('|')[1];

    common.getData('bet/consolidado-by-login/' + item.conta + '/' + date_from + '/' + date_to).then((data) => {
      this.props.hide();
      common.scrollTop();
      this.setState({ details: data, itemSelected: item })
      document.getElementById('list').className = 'hidden';
      document.getElementById('filter').className = 'hidden';
      document.getElementById('detail').className = 'form  pb-0 come';
      document.getElementById('bet_selected_all').checked = false;
      this.barForm(item.conta);
    });
  }

  componentDidMount() {
    //Combo Login
    common.getData('combo/betlogin').then((data) => { this.setState({ betlogins: data }) })
    common.getData('bet/data/last-bet-time').then((data) => { this.setState({ lastBetTime: data }); this.barList(); })

  }
  componentDidUpdate() {

    let w = document.getElementById('th-event').clientWidth;
    var divsEvents = document.getElementsByClassName('td-event');
    for (let index = 0; index < divsEvents.length; index++) {
      divsEvents[index].style.maxWidth = w;

    }
    w = document.getElementById('th-bet').clientWidth;
    divsEvents = document.getElementsByClassName('td-bet');
    for (let index = 0; index < divsEvents.length; index++) {
      divsEvents[index].style.maxWidth = w;
    }
  }
  weeksLoaded(weeks) {

    this.props.show();

    if (weeks.length === 0) {
      this.setState({ week_id: null, items: [], itemsAll: [], tables: [] });
      this.props.hide();
      return;
    }
    this.weekChanged(weeks[0].id)
  }
  weekChanged(week_id) {
    week_id = week_id ? week_id : this.state.week_id;
    this.props.show();
    var that = this;
    let date_from = week_id.split('|')[0];
    let date_to = week_id.split('|')[1];
    //Consolidado
    common.getData(`bet/consolidado/${date_from}/${date_to}`).then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data, week_id }) });
    //Bets Fixed
    common.getData(`bet-fixed/${date_from}/${date_to}`).then((data) => {

      let tables = [data.descarregos, data.afs, data.repasses]
      this.setState({ tables })
    });
  }

  state = {
    itemsAll: [],
    items: [],
    details: [],
    betlogins: [],
    login_destination: "0",
    tables: [],

  }
  getLastMonday() {
    var index = 0;
    var date_from = null;
    while (true || index < 7) {
      date_from = new Date().addDays(index)
      if (formatDate(date_from, "dddd") === "Monday")
        break;
      index--;
    }
    return date_from;
  }
  handleChange = e => {
    let data = this.state.data;
    if (e.target.name == 'bet_selected_all') {
      let details = this.state.details;
      details.forEach(x => x.selected = e.target.checked ? 1 : 0);
      this.setState({ details })
      return;
    }
    else
      this.setState({ [e.target.name]: e.target.value })

  }
  handleChangeDetail = (index, e) => {
    let details = this.state.details;
    if (e.target.type === 'checkbox')
      details[index][e.target.name] = e.target.checked ? 1 : 0;
    else
      details[index][e.target.name] = e.target.value;
    this.setState({ details })

  }
  showFilter() {
    var css = document.getElementById('filter').className;
    css = css.indexOf('hidden-xs') > 0 ? 'filter' : 'filter hidden-xs';
    document.getElementById('filter').className = css;
  }
  hideFilter() {
    document.getElementById('filter').className = 'filter hidden-xs';
  }
  filter(e) {
    let items = [];
    if (e.target.value == '')
      items = this.state.itemsAll;
    else {
      let value = e.target.value.toUpperCase();
      items = this.state.itemsAll.filter(x =>
        (x.conta + "").toUpperCase().indexOf(value) >= 0 || (x.cliente + "").toUpperCase().indexOf(value) >= 0);
    }

    this.setState({ items });
  }
  handleDayChange(selectedDay, modifiers, dayPickerInput) {
    this.setState({ [dayPickerInput.props.name]: selectedDay })

    setTimeout(() => {
      this.bindList();
    }, 1);

  }
  divClick = (id) => {

    let div = document.getElementById(id);

    if (div.className.indexOf('no-break ') >= 0) {
      div.className = div.className.replace('no-break ', '');
      div.className = 'font-weight-bold ' + div.className;
    } else {
      div.className = div.className.replace('font-weight-bold ', '');
      div.className = 'no-break ' + div.className;
    }

  }
  transferLogin = () => {
    let bets = this.state.details.filter(x => x.selected);
    if (bets.length === 0) return alert('Nenhuma aposta foi selecionada!');
    if (this.state.login_destination == "0") return alert('Selecione o login de destino!');
    let loginName = this.state.betlogins.filter(x => x.id == this.state.login_destination)[0].name;
    if (window.confirm('Confirma a transferência de ' + bets.length + ' apostas para o login ' + loginName + ' ?')) {
      let ids = [];
      bets.forEach(x => ids.push(x.id));
      common.postData('bet/transfer-bets', { ids: ids, login_id: this.state.login_destination, user_id: common.getUser().id }).then((data) => {
        if (data !== 0) {
          this.weekChanged(null);
          this.back();
          this.setState({ showModal: false });

        }
      })
    }
  }
  deleteBets = () => {
    if (!window.confirm('Confirma a exclusão das apostas selecionadas?'))
      return;

    let bets = this.state.details.filter(x => x.selected);
    if (bets.length === 0) return alert('Nenhuma aposta foi selecionada!');
    let ids = [];
    bets.forEach(x => ids.push(x.id));
    console.log(ids);
    this.props.show();
    common.postData('bet/delete-bets', { ids: ids, user_id: common.getUser().id }).then((data) => {
      if (data !== 0) {
        this.viewDetail(this.state.itemSelected);
      }
      else {
        this.props.show();
      }
    });
  }

  render() {

    return (
      <React.Fragment>
        <MyModal handleShow={this.state.showModal} handleClose={() => { this.setState({ showModal: false }) }} title="Trocar Login" >
          <div className="row" >
            <div className="col-12" >
              <select className="form-control" name="login_destination" value={this.state.login_destination || "0"} onChange={this.handleChange} >
                <option value="0">Logins</option>
                {this.state.betlogins.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
              </select>
              <div className="col-12 p-0 mt-2 text-right" >
                <button className="btn btn-danger" onClick={this.transferLogin} >Transferir</button>
              </div>
            </div>
          </div>
        </MyModal>
        <div className="filter hidden-xs" id="filter">
          <div className="row no-gutters offset-sm-1" >
            <div className="col-12 col-sm-4 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <WeekSelector weeksLoaded={this.weeksLoaded.bind(this)} weekChanged={this.weekChanged.bind(this)} hideFilter={this.hideFilter.bind(this)} show={this.props.show} />
          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>

        <div id="list">
          <div className="div-table-consolidado" >
            <table className="table table-dark table-hover table-bordered table-striped table-sm table-consolidado table-scroll hidden-xs w-100" >
              <thead id="table-consolidado-head" >
                <tr>
                  <th onClick={common.tableSort.bind(this, 'conta')} >Conta</th>
                  <th onClick={common.tableSort.bind(this, 'cliente')} >Cliente</th>
                  <th onClick={common.tableSortNumber.bind(this, 'qtd')} >Qtd</th>
                  <th onClick={common.tableSortNumber.bind(this, 'volume')} >Volume</th>
                  <th onClick={common.tableSortNumber.bind(this, 'vale')} >Vale</th>
                  <th onClick={common.tableSortNumber.bind(this, 'atual')} >Atual</th>
                  <th onClick={common.tableSortNumber.bind(this, 'pendente')} >Pend</th>
                  <th onClick={common.tableSortNumber.bind(this, 'um')} >uM</th>
                  <th onClick={common.tableSortNumber.bind(this, 'parcial')} >Parcial</th>
                  <th onClick={common.tableSortNumber.bind(this, 'comissao')} >Com</th>
                  <th onClick={common.tableSortNumber.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSortNumber.bind(this, 'profit_percent')} >%</th>
                  <th onClick={common.tableSortNumber.bind(this, 'resultado')} >Resultado</th>
                </tr>
                <tr className="font-xs totals">
                  <th></th>
                  <th></th>
                  <th>{this.state.items.sumInt('qtd')}</th>
                  <th>{this.state.items.sum('volume')}</th>
                  <th>{this.state.items.sum('vale')}</th>
                  <th>{this.state.items.sum('atual')}</th>
                  <th>{this.state.items.sum('pendente', true)}</th>
                  <th></th>
                  <th>{this.state.items.sum('parcial', true)}</th>
                  <th>{this.state.items.sum('comissao')}</th>
                  <th>{this.state.items.sum('total', true)}</th>
                  <th></th>
                  <th>{this.state.items.sum('resultado', true)}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items.map((x, i) => <tr key={i} id={x.conta} onClick={this.viewDetail.bind(this, x)} >
                  <td>{x.conta}</td>
                  <td>{x.cliente}</td>
                  <td>{x.qtd}</td>
                  <td className={x.volume == 0 ? "yellow" : x.volume < 0 ? 'red' : 'green'} >{common.formatNumber(x.volume)}</td>
                  <td>{x.vale}</td>
                  <td>{x.atual}</td>
                  <td>{x.pendente}</td>
                  <td>{x.um}</td>
                  <td>{common.formatNumber(x.parcial)}
                    <div hidden={x.parcial === x.parcial_check} className={x.parcial === x.parcial_check ? '' : 'bg-red rounded text-white'} >{common.formatNumber(x.parcial_check)}
                    </div>
                  </td>
                  <td>{common.formatNumber(x.comissao)}</td>
                  <td className={x.total == 0 ? "yellow" : x.total < 0 ? 'red' : 'green'} >{common.formatNumber(x.total)}</td>
                  <td>{x.profit_percent}</td>
                  <td className={x.resultado == 0 ? "" : x.resultado < 0 ? 'red' : 'green'} >{common.formatNumber(x.resultado)}</td>
                </tr>)}
                {this.state.tables.map((t, i) => <React.Fragment key={i}>
                  <tr>
                    <td colSpan="12" className={t.title.replace("/", "")} >{t.title}</td>
                  </tr>
                  {t.data.map((x, i) => <tr key={i}>
                    <td>{x.conta}</td>
                    <td>{x.cliente}</td>
                    <td>{x.qtd}</td>
                    <td className={x.volume == 0 ? "yellow" : x.volume < 0 ? 'red' : 'green'} >{common.formatNumber(x.volume)}</td>
                    <td>{x.vale}</td>
                    <td>{x.atual}</td>
                    <td>{x.pendente}</td>
                    <td>{x.um}</td>
                    <td>{common.formatNumber(x.parcial)}</td>
                    <td>{common.formatNumber(x.comissao)}</td>
                    <td className={x.total == 0 ? "yellow" : x.total < 0 ? 'red' : 'green'} >{common.formatNumber(x.total)}</td>
                    <td>{x.profit_percent}</td>
                    <td className={x.resultado == 0 ? "" : x.resultado < 0 ? 'red' : 'green'} >{common.formatNumber(x.resultado)}</td>
                  </tr>)}
                </React.Fragment>)}
              </tbody>
            </table>
          </div>
          <table className="table table-dark table-hover table-bordered table-striped table-sm show-xs table-consolidado-xs table-scroll" >
            <thead id="table-consolidado-head-xs">
              <tr>
                <th>
                  <div className="row no-gutters" >
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'volume')} >Vol<small>{this.state.items.sum('volume')}</small> </div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'vale')} >Vale<small>{this.state.items.sum('vale')}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'atual')} >Atual<small>{this.state.items.sum('atual')}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'pendente')} >Pend<small>{this.state.items.sum('pendente', true)}</small></div>
                    <div className="w-100" ></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'parcial')} >Parc<small>{this.state.items.sum('parcial', true)}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'comissao')} >Com<small>{this.state.items.sum('comissao')}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'total')} >Tot<small>{this.state.items.sum('total', true)}</small></div>
                    <div className="col-3" onClick={common.tableSortNumber.bind(this, 'resultado')} >Res<small>{this.state.items.sum('resultado', true)}</small></div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((x, i) => <tr key={i} id={x.conta + '-xs'} onClick={this.viewDetail.bind(this, x)} >
                <td>
                  <div className="row no-gutters" >
                    <div className="col-12 text-left pl-1" ><b>{x.conta} - {x.cliente} - {x.um} - {x.profit_percent}% - {x.qtd}</b></div>
                    <div className="w-100" ></div>
                    <div className={x.volume == 0 ? "col-3 yellow" : x.volume < 0 ? 'col-3 red' : 'col-3 green'} >{common.formatNumber(x.volume)}</div>
                    <div className="col-3" >{x.vale}</div>
                    <div className="col-3">{x.atual}</div>
                    <div className="col-3">{x.pendente}</div>
                    <div className="w-100" ></div>
                    <div className="col-3">{common.formatNumber(x.parcial)}
                    <div hidden={x.parcial === x.parcial_check} className={x.parcial === x.parcial_check ? '' : 'bg-red rounded text-white'} >{common.formatNumber(x.parcial_check)}
                    </div>
                    </div>
                    <div className="col-3">{common.formatNumber(x.comissao)}</div>
                    <div className={x.total == 0 ? "col-3 yellow" : x.total < 0 ? 'col-3 red' : 'col-3 green'} >{common.formatNumber(x.total)}</div>
                    <div className={x.resultado == 0 ? "col-3" : x.resultado < 0 ? 'col-3 red' : 'col-3 green'} >{common.formatNumber(x.resultado)}</div>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div id="detail" className="form pb-0">
          <table className="table table-dark table-hover table-bordered table-striped table-sm mt-1 hidden-xs" >
            <thead id="table-detail-head" >
            </thead>
            <tbody id="table-detail-body" >
            </tbody>
          </table>
          <table className="table table-dark table-hover table-bordered table-striped table-sm mt-1 table-consolidado-xs show-xs" >
            <thead id="table-detail-head-xs" >
            </thead>
            <tbody id="table-detail-body-xs" >
            </tbody>
          </table>
          {/* <table className="table table-dark table-bordered table-striped table-sm mt-1 table-consolidado-login table-scroll hidden-xs" >
            <thead>
              <tr>
                <th >Eventos</th>
                <th onClick={common.tableSort.bind(this, 'placement_date')} >Data</th>
                <th onClick={common.tableSort.bind(this, 'total_stake')} >Stake</th>
                <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>
                <th onClick={common.tableSort.bind(this, 'data_betstatus')} >Status</th>
              </tr>
            </thead>
            <tbody>
              {this.state.details.map(x => <tr key={x.id}  >
                <td>
                  <div>
                    <b>{x.bet_confirmation.split('<br>')[x.bet_confirmation.split('<br>').length - 1]}</b>
                  </div>
                  <table className="table-detail w-100" >
                    <tbody dangerouslySetInnerHTML={{ __html: x.detail }}></tbody>
                  </table>
                </td>
                <td>{formatDate(x.placement_date, 'DD-MM-YY hh:mm:ss')}</td>
                <td>{x.total_stake}</td>
                <td>{x.total_return}</td>
                <td className={x.total < 0 ? 'green' : 'red'}>{x.total}</td>
                <td>{x.odds}</td>
                <td>{x.comissao}</td>
                <td className="text-center">{x.data_betstatus}</td>

              </tr>)}
            </tbody>
          </table> */}
          <div className="div-table-consolidado-login" >

            <table className="table table-dark table-bordered table-striped table-sm mt-1 table-consolidado-login table-scroll hidden-xs" >
              <thead>
                <tr>
                  <th ><input type="checkbox" id="bet_selected_all" name="bet_selected_all" onChange={this.handleChange} /></th>
                  <th id="th-bet" >Bet Details</th>
                  <th id="th-event">Event</th>
                  <th>EventDate</th>
                  <th>Status</th>
                  <th onClick={common.tableSort.bind(this, 'placement_date')} >Date</th>
                  <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                  <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                  <th onClick={common.tableSort.bind(this, 'data_betstatus')} >Enc</th>
                  <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>

                </tr>
              </thead>
              <tbody>
                {this.state.details.map((x, i) => <tr key={x.id} className={x.status_id == "6" ? 'bet-deleted' : ''}  >
                  <td className="font-sm"><input type="checkbox" name="selected" checked={x.selected || ""} onChange={this.handleChangeDetail.bind(this, i)} /></td>
                  <td className="td-bet">
                    {x.bet_confirmation.split('<br>').map((y, n) => <div title={y} id={'bet-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'bet-' + x.id + '-' + n)} className="no-break font-sm overflow-x" key={n}>{y}</div>)}
                    <div hidden={x.status_id != "6"} className="rounded bg-red text-center">Excluída</div>
                  </td>
                  <td className="top td-event">{x.event_names.split(',').map((y, n) => <div title={y} id={'event-' + x.id + '-' + n} onClick={this.divClick.bind(this, 'event-' + x.id + '-' + n)} className="no-break font-sm" key={n}>{y}</div>)}</td>
                  <td className="top">{x.event_dates.split(',').map((x, n) => <div className="no-break font-sm" key={n}>{formatDate(x, 'DD-MM-YY')}</div>)}</td>
                  <td className="top">{x.event_results.split(',').map((x, n) => <div className="font-sm" key={n}><span className={x.substring(0, 4) + '-Text'}>{x.replace("Ainda por Acontecer", "Aberto")}</span></div>)}</td>
                  <td>{formatDate(x.placement_date, 'DD-MM-YY HH:mm:ss')}</td>
                  <td className="font-sm">{x.total_return}</td>
                  <td className={x.total < 0 ? 'red' : 'green'}>{x.total}</td>
                  <td>{x.odds}</td>
                  <td className="text-center">{x.data_betstatus}</td>
                  <td>{common.formatNumber(x.comissao)}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="div-consolidado-login-xs mt-1 show-xs" >
            {this.state.details.filter(x => x.status_id == null).map(x => <table className="table table-dark table-bordered table-striped table-consolidado-login-xs table-sm  mb-1" key={x.id}  >
              <tbody>
                <tr>
                  <th colSpan="5" >
                    <div className="font-weight-normal">
                      <b className="text-white">{x.bet_confirmation.split('<br>')[x.bet_confirmation.split('<br>').length - 1]}</b> -
                      <span className="ml-1">{formatDate(x.placement_date, 'DD-MM-YY HH:mm:ss')}</span> -
                      <b className="ml-1">{x.data_betstatus == 0 ? 'Encerrado' : 'Aberto'}</b>
                    </div>
                  </th>
                </tr>
                <tr className="row-consolidado-login-xs">
                  <th onClick={common.tableSort.bind(this, 'total_stake')} >Stake</th>
                  <th onClick={common.tableSort.bind(this, 'total_return')} >Return</th>
                  <th onClick={common.tableSort.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSort.bind(this, 'odds')} >Odds</th>
                  <th onClick={common.tableSort.bind(this, 'comissao')} >Com</th>
                </tr>
                <tr className="row-consolidado-login-xs">
                  <td>{x.total_stake}</td>
                  <td>{x.total_return}</td>
                  <td className={x.total == 0 ? 'yellow' : x.total > 0 ? 'green' : 'red'}>{x.total}</td>
                  <td>{x.odds}</td>
                  <td>{x.comissao}</td>
                </tr>
                <tr>
                  <td colSpan="5" >
                    <table className="table-detail w-100" >
                      <tbody>
                        {x.event_names.split(',').map((y, n) => <tr key={n} >
                          <td>{x.event_names.split(',')[n]}<div className="selection">{x.bet_confirmation.split('<br>')[n]}</div></td>
                          <td>{x.event_dates.split(',')[n]}</td>
                          <td className={x.event_results.split(',')[n].substring(0, 4) + ' text-center'}>{x.event_results.split(',')[n]}</td>
                        </tr>)}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>)}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Bet);

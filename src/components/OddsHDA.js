import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import { formatDate } from 'react-day-picker/moment';
import MyModal from './MyModal';
import Filter from './Common';
import 'moment/locale/pt-br';
import '../css/OddsHDA.css';

//Home Draw Away
class OddsHDA extends Component {
  constructor(props) {
    super(props);
  }
  barList() {
    this.props.changeTitle({
      left: null,
      center: <div className="pointer" onClick={this.bindList.bind(this)}><div>Odds CEV</div></div>,
      right: <i className="fas fa-filter  ml-2 text-dark font-md show-xs" onClick={Filter.showFilter.bind(this)}></i>
    });
  }
  componentWillUnmount() {
    this.props.setChild(null);
  }
  componentDidMount() {

    this.props.setChild(this);

    this.barList();
    common.getData('data/odds.php?data=dates').then(
      (dates) => {
        if (dates.length > 0) {
          this.setState({ dates, filter_date: dates[0].id })
          setTimeout(() => { this.bindList(); }, 1);
        }
      });
  }
  bindList() {
    this.props.show();
    let userId = common.getUser().id;
    common.getData('data/odds.php?data=cev&date=' + this.state.filter_date + '&user_id=' + userId).then((items) => {
      this.setState({ itemsAll: items, items });
      this.props.hide();
    });
    common.getData('data/odds.php?data=dates').then((dates) => this.setState({ dates }));
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
      isImportant: false,
    },
    customFilters: [],
    custom: {},
    filter_search: "",
    filter_bet365Greater: "0",
    filter_date: "0",
    dates: [{ id: '0', name: 'Datas' }],
    datesPlus: [],
    minutes: [],
    view_bets: null
  }
  handleChange = e => {
    let data = this.state.data;
    this.setState({ [e.target.name]: e.target.value })
  }
  filter = () => {

  }
  filterDate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
    setTimeout(() => { this.bindList(); }, 1);
  }

  render() {

    return (
      <React.Fragment>
        <MyModal handleShow={this.state.showModal} handleClose={() => { this.setState({ showModal: false }) }} title="Configurações" >
          <div className="row" >
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
            <div className="col-12 col-sm-5 col-md-auto  align-self-center text-right pr-4 no-overflow no-break p-sm-1">
              <b>Registros : {this.state.items.length}</b>
            </div>
            <div className="col-12 show-xs p-1 pb-0 text-right">
              <button type="button" className="btn btn-secondary btn-sm" onClick={Filter.hideFilter.bind(this)}>Fechar</button>
            </div>
          </div>
        </div>
        <div className="margin-top-filter" ></div>
        <div id="list">
          <div className="div-main table-responsive" >
            <table id="table-main" className="table-main table-scroll" onClick={Filter.checkHideFilter} >
              <thead>
                <tr>
                  <th></th>
                  <th onClick={common.tableSort.bind(this, 'start')} >Data</th>
                  <th onClick={common.tableSort.bind(this, 'updated_at')} >Min</th>
                  <th onClick={common.tableSort.bind(this, 'league_name')} >Liga</th>
                  <th onClick={common.tableSort.bind(this, 'event_name')} >Evento</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_home')} >Casa D</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_draw')} >Empate A</th>
                  <th onClick={common.tableSortNumber.bind(this, 'odd_away')} >Fora D</th>
                  <th onClick={common.tableSortNumber.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSortNumber.bind(this, 'bet_home')} >Bet Casa</th>
                  <th onClick={common.tableSortNumber.bind(this, 'bet_draw')} >Bet Empate</th>
                  <th onClick={common.tableSortNumber.bind(this, 'bet_away')} >Bet Fora</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items.map((x, i) => <tr key={i} id={'row_' + i} >
                  <td id="" >{i + 1}
                    <i hidden={x.user_id !== '1'} className={'fas fa-user-graduate ml-1 float-right'}></i>
                    <i hidden={x.user_id !== '2'} className={'fas fa-user ml-1 float-right'}></i>
                  </td>
                  <td>{formatDate(x.start, "DD/MM HH:mm")}</td>
                  <td><small>
                    <span className={x.updated_at_espnet > 30 ? 'text-warning font-weight-bold' : ''}>{x.updated_at_espnet}/</span>
                    <span className={x.updated_at_365 > 30 ? 'text-warning font-weight-bold' : ''}>{x.updated_at_365}</span>
                  </small></td>
                  <td>{x.league_name}</td>
                  <td>{x.event_name}</td>
                  <td>{x.odd_home}</td>
                  <td>{x.odd_draw}</td>
                  <td>{x.odd_away}</td>
                  <td>{x.total}</td>
                  <td>{x.bet_home}</td>
                  <td>{x.bet_draw}</td>
                  <td>{x.bet_away}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(OddsHDA);

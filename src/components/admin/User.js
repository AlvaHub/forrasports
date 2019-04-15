import React, { Component } from 'react';
import * as common from '../Common';


class User extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();
    var that = this;
    common.getData('combo/permission').then((data) => { that.props.hide(); this.setState({ permissions: data }) });

  }
  state = {
    items: [],
    itemsAll: [],
    sortField: '',
    filter: '',
    permissions: [],
    data: {},


  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Usuários', right: <div  onClick={this.newData.bind(this)} >{common.newButton()}</div>  });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('user').then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) })
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
    common.getData('user/' + item.id).then((data) => {
      this.props.hide();
      common.scrollTop();
      data.active = data.active === '1';
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
    common.postData('user', this.state.data).then(function (data) {
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
    if (e.target.value === '')
      items = this.state.itemsAll;
    else
      items = this.state.itemsAll.filter(x => x.name.toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0);
    this.setState({ items });
  }
  render() {

    return (
      <React.Fragment>
        <div className="filter" id="filter" >
          <input type="text" className="form-control form-control-sm col-md-8 offset-md-2" placeholder="Buscar..." onChange={this.filter.bind(this)} />
        </div>
        <div className="div-table" ></div>
        <div id="list" className="table-responsive">
          <table className="table table-dark table-hover table-bordered table-striped table-sm" >
            <thead>
              <tr>
                <th onClick={common.tableSort.bind(this, 'first_name')} >Nome</th>
                <th onClick={common.tableSort.bind(this, 'email')} >Usuário</th>
                <th onClick={common.tableSort.bind(this, 'permission_id')} >Permissão</th>
                <th onClick={common.tableSort.bind(this, 'active')} >Ativo</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.id} onClick={this.editData.bind(this, x)} >
                <td>{x.first_name}</td>
                <td>{x.email}</td>
                <td>{x.permission_name}</td>
                <td>{x.active === '1' ? 'Sim' : 'Não'}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div id="new" className="form" >
          <div>
            <div className="label">Nome</div>
            <input type="text" placeholder="Nome..." className="form-control" name="first_name" value={this.state.data.first_name || ""} onChange={this.handleChange}  ></input>
          </div>
          <div>
            <div className="label">Usuário</div>
            <input type="text" placeholder="Usuário..." className="form-control" name="email" value={this.state.data.email || ""} onChange={this.handleChange}  ></input>
          </div>
          <div>
            <div className="label">Senha</div>
            <input type="text" placeholder="Senha..." className="form-control" name="password" value={this.state.data.password || ""} onChange={this.handleChange}  ></input>
          </div>
          <div>
            <div className="label">Permissão</div>
            <select className="form-control" name="permission_id" value={this.state.data.permission_id} onChange={this.handleChange} >
              {this.state.permissions.map((x, i) => <option key={x.id} value={x.id} >{x.name}</option>)}
            </select>
          </div>
          <div>
            <div className="label">Ativo</div>
            <input type="checkbox" placeholder="Senha..." name="active" checked={this.state.data.active || ""} onChange={this.handleChange}  ></input>
          </div>
          <div className="text-right pt-2">
            <button className="btn btn-main" onClick={this.save.bind(this)} >Salvar</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default User;

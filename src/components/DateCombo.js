import React from 'react'

function DateCombo(props) {
    let years = [];
    for (let index = 2010; index <= new Date().getFullYear(); index++) {
        years.push(index);
    }
    let months = [];
    for (let index = 1; index <= 12; index++) {
        months.push(index);
    }
    let days = [];
    for (let index = 1; index <= 31; index++) {
        days.push(index);
    }
    return ( 
        <div className="date-combo">
            <select className="form-control mr-1 block-inline" name={(props.namePrefix || "") + "day"} style={{ width: 'auto',}} onChange={props.onChange}  value={parseInt(props.day)}  >
                {days.map(x => <option key={x} >{x}</option>)}
           
            </select>
            <select  className="form-control mr-1 block-inline" name={(props.namePrefix || "") + "month"}  style={{ width: 'auto' }}   onChange={props.onChange}  value={parseInt(props.month)} >
                {months.map(x => <option key={x} >{x}</option>)}
            </select>
            <select  className="form-control  mr-1 block-inline" name={(props.namePrefix || "") + "year"}  style={{ width: 'auto' }} onChange={props.onChange} value={props.year} >
                {years.map(x => <option key={x} >{x}</option>)}
            </select>
        </div>
    )
}
export default DateCombo
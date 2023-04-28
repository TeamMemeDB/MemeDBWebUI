import React from 'react';

export class Panel extends React.Component {
  constructor(props){
    super(props);
    this.state = {open: props.closed?false:true};
  }

  render(){
    return <div className={"panel panel-"+this.props.type}>
      <h3>{this.props.title}</h3>
      <button className="nobutton close-button icon-cross" onClick={()=>{this.setState({open:!this.state.open})}}><span className="sr-only">Close</span></button>
      {this.state.open?
        <>
        <hr/>
        <div className="panel-content">
          {this.props.children}
        </div>
        </>
      :
        <></>
      }
    </div>;
  }
}

export class DropDown extends React.Component {
  constructor(props){
    super(props);
    this.state = { selection: props.default };

    this.find = this.find.bind(this);
    this.select = this.select.bind(this);
  }

  render(){
    var menu = [];
    for(var id in this.props.values) {
      var item = this.props.values[id];

      var selected = (this.state.selection == item.id);
      var searched = false;

      var classes = ['btn'];
      if(item.hidden && !(selected || searched)) classes.push('hidden');
      else if(selected) classes.push('selected');

      classes = classes.join(' ');

      menu.push(<button onClick={this.select.bind(this,item.id)} key={item.name} className={classes} title={item.description}>
                  {item.displayname}{(item.counter!==undefined)?<>&nbsp;<i className="dim">({item.counter})</i></>:''}
                </button>);
    }

    var stringrep;
    if(this.state.selection >= 0) {
      var selected = this.find(this.state.selection);
      stringrep = selected?.name[0].toUpperCase()+selected?.name.substring(1);
    }
    else if(this.state.selection == -1) {
      stringrep = 'All';
    }
    else if(this.state.selection == -2) {
      stringrep = 'None';
    }

    return <div className="dropdown">
      <button className="dropbtn btn">{this.props.name}<br/><sub className="dim">{stringrep}</sub></button>
      <div className="dropdown-content">
        <div className="scroll">
          {menu}
        </div>
      </div>
    </div>
  }

  find(tid){
    for(var id in this.props.values){
      var value = this.props.values[id];
      if(value.id == tid) return value;
    }
    console.log("Failed to find "+id)
  }

  select(id) {
    this.setState({selection: id});
  }
}

export class MultiDropDown extends DropDown {
  constructor(props) {
    super(props);
    this.state = {
      selection: props.default,
      inclusive: (props.inclusive!==undefined)? props.inclusive:true,
      search: '',
      maxlength: 100,
      displayname: (props.displayname)? props.displayname: (s)=>s,
      counter: props.counter
    };

    this.find = this.find.bind(this);
    this.select = this.select.bind(this);
  }

  render(){
    var menu = [];
    for(var id in this.props.values) {
      var item = this.props.values[id];

      var classes = ['btn'];

      if(this.state.selection.indexOf(item.id) >= 0 || this.state.selection[0] == -1){
        classes.push('selected');
      }

      if(this.state.search.length > 2){
        if(item.name.includes(this.state.search) || item.description?.includes(this.state.search)){
          classes.push('searched');
        }else{
          classes.push('hidden');
        }
      }else if(item.hidden){
        classes.push('hidden');
      }else if(menu.length >= this.state.maxlength){
        classes.push('hidden');
      }

      classes = classes.join(' ');

      menu.push(<button onClick={this.select.bind(this,item.id)} key={item.name} className={classes} title={item.description}>
                  {this.state.displayname(item.name)}{(this.state.counter!==undefined)?<>&nbsp;<i className="dim">({this.state.counter(item)})</i></>:''}
                </button>);
    }

    if(this.state.maxlength > 100){
      menu.push(<button onClick={()=>{this.setState({maxlength: 100})}} key={-1} className='btn noselect'>Show less...</button>);
    }
    else if(menu.length > this.state.maxlength){
      menu.push(<button onClick={()=>{this.setState({maxlength: 1000})}} key={-1} className='btn noselect'>Show all...</button>);
    }

    var stringrep;
    if(this.state.selection.length >= 1) {
      if(this.state.selection[0] == -1 || this.state.selection.length == this.props.values.length) {
        stringrep = 'All';
      }else{
        if(!this.state.inclusive){
          if(this.state.selection.length <= 5){
            var selected = this.find(this.state.selection);

            let names = [];
            for(var id in selected){
              var select = selected[id];
              names.push(select.name[0].toUpperCase()+select?.name.substring(1));
            }

            stringrep = "Only "+names.join(', ');
          }else{
            var unselected = this.find(this.props.values.map((x) => x.id).filter((i) => this.state.selection.indexOf(i) == -1))

            let names = [];
            for(var id in unselected){
              if(names.length == 5){
                names.push('...');
                break;
              }
              var select = unselected[id];
              names.push(select.name[0].toUpperCase()+select?.name.substring(1));
            }

            stringrep = "All but "+names.join(', ');
          }
        }else{
          var selected = this.find(this.state.selection);
  
          let names = [];
          for(var id in selected){
            if(names.length == 5){
              names.push('...');
              break;
            }

            var select = selected[id];
            names.push(select.name[0].toUpperCase()+select?.name.substring(1));
          }

          stringrep = names.join(', ');
        }
      }
    }
    else {
      stringrep = 'None';
    }

    return <div className="dropdown dropdown-multi">
      <button className="dropbtn btn">{this.props.name}<br/><sub className="dim">{stringrep}</sub></button>
      <div className="dropdown-content">
        {(this.props.values.length > 10)?
          <input className="dropdown-search" type="text" onInput={(e)=>{this.setState({search: e.target.value})}} placeholder="Search..."/>
        :
          <></>
        }
        <div className="scroll">
          {menu}
        </div>
        {(this.props.inclusivityeditor)?
          <div className="dropdown-content-toolbar">
            <button className="btn" title="Select all" onClick={this.select.bind(this, -1)}>
              <i className="icon-select-all"/>
              <br/>
              <sub className="dim">All</sub>
            </button>
            <button className="btn" title="Select none" onClick={this.select.bind(this, -2)}>
              <i className="icon-select-none"/>
              <br/>
              <sub className="dim">None</sub>
            </button>
            <button className={"btn"+(this.state.inclusive?' selected':'')} title="Inclusive" onClick={()=>{this.setState({inclusive:true})}}>
              <i className="icon-plus"/>
              <br/>
              <sub className="dim">Inclusive</sub>
            </button>
            <button className={"btn"+(this.state.inclusive?'':' selected')} title="Exclusive" onClick={()=>{this.setState({inclusive:false})}}>
              <i className="icon-minus"/>
              <br/>
              <sub className="dim">Exclusive</sub>
            </button>
          </div>
        :
          <></>
        }
      </div>
    </div>
  }

  find(tids){
    if(tids[0] == -1) return this.props.values;

    let results = [];
    for(var tidid in tids){
      var tid = tids[tidid];
      for(var id in this.props.values){
        var value = this.props.values[id];
        if(value.id == tid){
          results.push(value);
          break;
        }
      }
    }
    return results;
  }

  select(id) {
    if(id == -1) selection = [-1];
    else if(id == -2) selection = [];
    else{
      var selection;
      if(this.state.selection[0] == -1) selection = this.props.values.map((x) => x.id);
      else selection = this.state.selection.map((x) => x);

      const index = selection.indexOf(id);
      if(index > -1){
        selection.splice(index, 1);
      }else{
        selection.push(id);
      }
    }
    //console.log(selection);
    this.setState({selection: selection});
  }
}
import React from 'react';

export class Panel extends React.Component {
  constructor(props){
    super(props);
    this.state = {open: props.closed?false:true};
  }

  render(){
    return <div className={"panel panel-"+this.props.type}>
      <h3>{this.props.title}</h3>
      <button className="nobutton close-button fas fa-window-close" onClick={()=>{this.setState({open:!this.state.open})}}><span className="sr-only">Close</span></button>
      {this.state.open?
        <>
        <hr/>
        {this.props.children}
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
  }

  render(){
    this.menu = this.props.values.map((item) => <button key={item.name} className="btn" href={item.href}>{item.displayname}</button>);
    if(this.state.selection >= 0) {
      this.stringrep = this.props.values[this.props.default].name[0].toUpperCase()+this.props.values[this.props.default].name.substring(1);
    }
    else if(this.state.selection == -1) {
      this.stringrep = 'All';
    }
    else if(this.state.selection == -2) {
      this.stringrep = 'None';
    }

    return <div className="dropdown">
      <button className="dropbtn btn">{this.props.name}<br/><sub>{this.stringrep}</sub></button>
      <div className="dropdown-content">
        {this.menu}
      </div>
    </div>
  }
}
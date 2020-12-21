import React from 'react';
import './Control.css';

export class Control extends React.Component {
  constructor(props){
    super(props);
    this.state = {open: true};
  }

  render(){
    return <div className={"control control-"+this.props.type}>
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
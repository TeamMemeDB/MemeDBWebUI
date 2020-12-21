import React from 'react';
import './App.css';
import {Browse, Header} from './Layout';

class App extends React.Component {
  render(){
    return <>
      <Header/>
      <Browse/>
    </>;
  }
}

export default App;

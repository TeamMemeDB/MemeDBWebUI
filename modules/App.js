import React from 'react';
import '../styles/App.css';
import {Browse, Header, Footer} from './Layout';

class App extends React.Component {
  render(){
    return <>
      <Header/>
      <Browse/>
      <Footer/>
    </>;
  }
}

export default App;

import React from 'react';
import { Control } from './Control';
import './Layout.css';

import {User,UserNav} from './User';

export class Header extends React.Component {
  render(){
    return <header><HeaderNav></HeaderNav></header>;
  }
}

export class HeaderNav extends React.Component {
  constructor(props){
    super(props);
    this.state = {searchfocus: false};
  }

  render(){
    return <nav>
      <div className={"navbutton navbutton-title-search"+(this.state.searchfocus?' searchfocus':'')}>
        <NavItem href="/">
          <img src="/img/icon.png" alt="MemeDB Icon"/>
          <h1>
            <span color='#fafafa'>Meme</span>
            <span className="accent">DB</span>
          </h1>
        </NavItem>
        <form action="" method="GET">
          <input type="text" name="q" placeholder="Search MemeDB" onFocus={()=>this.setState({searchfocus: true})} onBlur={()=>this.setState({searchfocus: false})}></input>
          <button type="submit" className="btn" value=""><i className='fas fa-search'/></button>
        </form>
      </div>
      <NavItem type="spacer"></NavItem>
      <UserNav user={<User username="Yiays"/>}/>
    </nav>;
  }
}

export class Footer extends React.Component {
  render(){
    return <footer><FooterNav></FooterNav></footer>;
  }
}

export class FooterNav extends React.Component {
  render(){
    return <nav>
      <NavItem href="https://yiays.com">Created by Yiays</NavItem>
      <NavItem type="spacer"></NavItem>
      <NavItem href="/terms">Terms</NavItem>
      <NavItem href="/report">Report Abuse</NavItem>
      <NavItem href="https://github.com/TeamMemeDB">GitHub</NavItem>
      <NavItem href="/dmca">DMCA</NavItem>
    </nav>
  }
}

class NavItem extends React.Component {
  render(){
    return <a href={this.props.href} className={"btn navbutton"+(this.props.type?' navbutton-'+this.props.type:'')}>{this.props.children}</a>
  }
}

export class Browse extends React.Component {
  render(){
    return <div>
      <BrowseControls/>
    </div>;
  }
}

class BrowseControls extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  render(){
    return <Control type="browse" title="Search Tools">
      <NavItem href="/sort" type="sub">
        Sort <i className="fas fa-sort"></i>
        <div className="popup">
          <NavItem href="/sort/new">
            New <i className='fas fa-meteor pink'/>
          </NavItem>
          <NavItem href="/sort/old">
            Old <i className='fas fa-calendar blue'/>
          </NavItem>
          <NavItem href="/sort/top">
            Top <i className='fas fa-fire red'/>
          </NavItem>
          <NavItem href="/sort/bottom">
            Bottom <i className='fas fa-poop brown'/>
          </NavItem>
        </div>
      </NavItem>
      <NavItem href="/sort" type="sub">
        Filter <i className="fas fa-filter"></i>
        <div className="popup">
          <NavItem href="/categories">
            Categories <i className='fas fa-folder yellow'/>
          </NavItem>
          <NavItem href="/tags">
            Tags <i className='fas fa-tag blue'/>
          </NavItem>
        </div>
      </NavItem>
      <NavItem href="/edge">
        Edge <i className='fas fa-pepper-hot red'/>
      </NavItem>
    </Control>;
  }
}
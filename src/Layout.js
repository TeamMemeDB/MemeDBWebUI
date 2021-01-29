import React from 'react';
import { Panel, DropDown } from './Control';
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

const sorts = [
  {name: 'new', displayname: <><i className='fas fa-meteor pink'/> New</>, href: '/sort/new'}, // 0
  {name: 'old', displayname: <><i className='fas fa-calendar blue'/> Old</>, href: '/sort/old'}, // 1
  {name: 'top', displayname: <><i className='fas fa-fire red'/> Top</>, href: '/sort/top'}, // 2
  {name: 'bottom', displayname: <><i className='fas fa-poop brown'/> Bottom</>, href: '/sort/bottom'} // 3
];

const filters = [
  {name: 'categories', displayname: <><i className='fas fa-folder yellow'/> Categories</>, href: '/categories'}, // 0
  {name: 'tags', displayname: <><i className='fas fa-tag blue'/> Tags</>, href: '/tags'}, // 1
  {name: 'edge', displayname: <><i className='fas fa-pepper-hot red'/> Edge</>, href: '/edge'} // 2
]

class BrowseControls extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  render(){
    return <Panel type="browse" title="Search Tools">
      <DropDown name={<><i className="fas fa-sort"/> Sort</>} values={sorts} default={0}/>
      <DropDown name={<><i className="fas fa-filter"/> Filter</>} values={filters} default={2}/>
    </Panel>;
  }
}
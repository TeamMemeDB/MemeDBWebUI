import React from 'react';
import './Layout.css';

import {User,UserNav} from './User';

export class Header extends React.Component {
  render(){
    return <header><Nav></Nav></header>
  }
}

export class Nav extends React.Component {
  render(){
    return <nav>
      <NavItem href="/">
        <img src="/img/icon.png" alt="MemeDB Icon"/>
        <h1>
          <span color='#fafafa'>Meme</span>
          <span className="accent">DB</span>
        </h1>
      </NavItem>
      <form action="/search" method="GET">
        <input type="text" name="q" placeholder="Search MemeDB"></input>
        <button type="submit" className="btn" value=""><i className='fas fa-search'/></button>
      </form>
      <NavItem href="/sort/top">
        Top <i className='fas fa-fire'/>
      </NavItem>
      <NavItem href="/sort/new">
        New <i className='fas fa-meteor'/>
      </NavItem>
      <NavItem href="/categories">
        Categories <i className='fas fa-folder'/>
      </NavItem>
      <NavItem href="/tags">
        Tags <i className='fas fa-tag'/>
      </NavItem>
      <UserNav user={<User username="Yiays"/>}/>
    </nav>
  }
}

export class NavItem extends React.Component {
  render(){
    return <a href={this.props.href} className="btn">{this.props.children}</a>
  }
}
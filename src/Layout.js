import React from 'react';
import './Layout.css';

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
        <input type="submit" className="btn" value="🔍"></input>
      </form>
      <NavItem href="/sort/top">
        Top 🔥
      </NavItem>
      <NavItem href="/sort/new">
        New ✨
      </NavItem>
      <NavItem href="/categories">
        Categories 📂
      </NavItem>
      <NavItem href="/tags">
        Tags #️⃣
      </NavItem>
    </nav>
  }
}

class NavItem extends React.Component {
  render(){
    return <a href={this.props.href} className="btn">{this.props.children}</a>
  }
}
import React from 'react';
import { NavItem } from './Layout.js';

export class UserNav extends React.Component {
  constructor(props){
    super(props);
  }
  render(){
    return <div className='usernav'>
    { this.props.user?
    <>
      <NavItem href='/user/favourites'><i className="icon-star-full accent"/></NavItem>
      <NavItem href='/user'>{this.props.user.username}</NavItem>
      <NavItem href='/user/logout'>Logout</NavItem>
    </>
    :
    <>
      <NavItem href='/user/login' className='blurple-bg'>Login with Discord</NavItem>
    </>
    }
    </div>;
  }
}

export class User {
  constructor(username){
    this.username = username;
  }
}
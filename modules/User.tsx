import React from 'react';
import { NavItem } from './Layout';

export const UserNav = (props) => {
  return <div className='usernav'>
  { props.user?
  <>
    <NavItem href='/user/favourites'><i className="icon-star-full accent"/></NavItem>
    <NavItem href='/user'>{props.user.username}</NavItem>
    <NavItem href='/user/logout'>Logout</NavItem>
  </>
  :
  <>
    <NavItem href='/user/login' className='blurple-bg'>Login with Discord</NavItem>
  </>
  }
  </div>;
}

export class User {
  username:string
  constructor(username:string){
    this.username = username;
  }
}
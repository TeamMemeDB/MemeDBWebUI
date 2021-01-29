import React from 'react';

export class UserNav extends React.Component {
  constructor(props){
    super(props);
  }
  render(){
    return <div className='navbutton navbutton-usernav'>
    { this.props.user?
    <>
      <a href='/user/favourites' className='btn'><i className="fas fa-star accent"/></a>
      <a href='/user' className='btn'>{this.props.user.props.username}</a>
      <a href='/user/logout' className='btn'>Logout</a>
    </>
    :
    <>
      <a href='/user/login' className='btn blurple-bg'>Login with Discord</a>
    </>
    }
    </div>;
  }
}

export class User extends React.Component {
  constructor(props){
    super(props);
    this.state = {username: this.props.username}
  }
}
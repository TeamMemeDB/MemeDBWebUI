import React from 'react';
import { Panel, DropDown, MultiDropDown } from './Control';

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
          <button type="submit" className="btn" value=""><i className='icon-search'/></button>
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

function Pepper(props){
  return <> {
    Array.from({length: props.count}, (_, i) => <i key={i} className='icon-pepper red' title={(props.count) + ' pepper(s)'}/>)
  } </>;
}

export const sortModes = [
  {id:0, name: 'newest first', displayname: <><i className='icon-sparkle pink'/> Newest</>, href: '/sort/new', description:"Newest memes first"},
  {id:1, name: 'oldest first', displayname: <><i className='icon-calendar blue'/> Oldest</>, href: '/sort/old', description:"Oldest memes first"},
  {id:2, name: 'top rated first', displayname: <><i className='icon-fire red'/> Top rated</>, href: '/sort/top', description:"Most upvoted memes first"},
  {id:3, name: 'bottom rated first', displayname: <><i className='icon-bin'/> Bottom rated</>, href: '/sort/bottom', description:"Least upvoted memes first"}
];

export const edgeLevels = [
  {id:5, name: 'Unrated', displayname: <><i className='icon-notification'/></>, description: "Currently unclassified"},
  {id:0, name: 'Family friendly', displayname: <Pepper count={1}/>, description: "Regular content, safe for everyone"},
  {id:1, name: 'NSFW/Edgy', displayname: <Pepper count={2}/>, description: "NSFW or edgy, not for children"},
  {id:2, name: 'Turbo Edgy', displayname: <Pepper count={3}/>, description: "Very NSFW or politically edgy"},
  {id:3, name: 'NSFL/Banned', displayname: <Pepper count={4}/>, description: "Banned from this database"}
];

export class Browse extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      sorts: (props.sorts)? props.sorts: sortModes,
      categories: (props.categories)? props.categories: [{name: '', displayname: <><i className='icon-warning red'/> Categories missing!</> }],
      tags: (props.tags)? props.tags: [{name: '', displayname: <><i className='icon-warning red'/> Tags missing!</>}],
      edge: (props.edge)? props.edge: edgeLevels
    };
  }

  render(){
    return <div className="page">
      <Panel type="toolbelt" title="Search Tools">
        <DropDown name={<><i className="icon-menu2"/> Sort</>} values={this.state.sorts} default={0}/>
        <MultiDropDown name={<><i className="icon-folder"/> Categories</>} values={this.state.categories} default={[-1]} inclusivityeditor={true}/>
        <MultiDropDown name={<><i className="icon-tags"/> Tags</>} values={this.state.tags} default={[-1]} inclusivityeditor={true}/>
        <MultiDropDown name={<><i className="icon-pepper"/> Edge</>} values={this.state.edge} default={[0]} inclusive={false}/>
      </Panel>
    </div>;
  }
}
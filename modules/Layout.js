import React, {useState} from 'react';
import { Panel, DropDown, MultiDropDown } from './Control';
import {User,UserNav} from './User';

let tags,categories;

export const Header = (props) => {
  const [searchFocus, setSearchFocus] = useState(false);

  return <header><nav>
    <div className={"navbutton navbutton-title-search"+(searchFocus?' searchfocus':'')}>
      <NavItem href="/">
        <img src="/img/icon.png" alt="MemeDB Icon"/>
        <h1>
          <span color='#fafafa'>Meme</span>
          <span className="accent">DB</span>
        </h1>
      </NavItem>
      <form action="" method="GET">
        <input type="text" name="q" placeholder="Search MemeDB" onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(true)}></input>
        <button type="submit" className="btn" value=""><i className='icon-search'/></button>
      </form>
    </div>
    <NavItem type="spacer"></NavItem>
    <UserNav user={<User username="Yiays"/>}/>
  </nav></header>;
}

export const Footer = (props) => {
  return <footer><nav>
    <NavItem href="https://yiays.com">Created by Yiays</NavItem>
    <NavItem type="spacer"></NavItem>
    <NavItem href="/terms">Terms</NavItem>
    <NavItem href="/report">Report Abuse</NavItem>
    <NavItem href="https://github.com/TeamMemeDB">GitHub</NavItem>
    <NavItem href="/dmca">DMCA</NavItem>
  </nav></footer>;
}

const NavItem = (props) => {
  return <a href={props.href} className={"btn navbutton"+(props.type?' navbutton-'+props.type:'')}>
    {props.children}
  </a>
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

export const Browse = (props) => {
  const sorts = props.sorts? props.sorts: sortModes;
  const edge = props.edge? props.edge: edgeLevels;
  tags = props.tags;
  categories = props.categories;

  return <div className="page">
    <Panel type="toolbelt" title="Search Tools">
      <DropDown name={<><i className="icon-menu2"/> Sort</>} values={sorts} default={0}/>
      <MultiDropDown name={<><i className="icon-folder"/> Categories</>} values={props.categories} default={[-1]} inclusivityeditor={true} counter={(t) => t.memes}/>
      <MultiDropDown name={<><i className="icon-tags"/> Tags</>} values={props.tags} default={[-1]} inclusivityeditor={true} displayname={(s) => '#'+s} counter={(t) => t.memes}/>
      <DropDown name={<><i className="icon-pepper"/> Edge</>} values={edge} default={[0]} inclusive={false}/>
    </Panel>
    <MemeGrid memes={props.preloadMemes}/>
  </div>;
}

const MemeGrid = (props) => {
  const memes = props.memes?.memes? props.memes.memes: [];
  const stats = props.memes?.stats? props.memes.stats[0]: {count: 0};

  return <div className='memegrid'>{memes.map((meme, i) =>
    <GridMeme key={i} meme={meme}/>
  )}</div>;
}

const GridMeme = (props) => {
  const meme = props.meme;

  let media;
  if(meme.type=='image')
    media = <img src={meme.thumbUrl} alt={meme.transcription?meme.transcription:'Meme number '+meme._id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='gif')
    media = <HoverImg src={meme.thumbUrl} gifSrc={meme.url} alt={meme.transcription?meme.transcription:'Meme number '+meme._id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='video')
    media = <video width={meme.width} height={meme.height} controls poster={meme.thumbUrl} preload='none'><source src={meme.url}></source></video>;
  else
    media = <p style={{color:'red'}}>Unsupported media type {meme.type}</p>

  let bio;
  if(meme.description)
    bio = meme.description;
  else if(meme.transcription)
    bio = meme.transcription;
  else if(meme.topTags)
    bio = meme.topTags.map((tid) => tags[tid].name).join(', ');
  else if(meme.topCategories)
    bio = meme.topCategories.map((cid) => categories[cid].name).join(', ');
  else
    bio = 'Meme #'+meme._id;

  return <div className='meme' href={'/meme/'+meme._id} style={{'backgroundColor':meme.color}}>
    {media}
    <div className='info'>
      {bio}
      <span className='dooter'>
        <button className='updoot'></button>
        {meme.totalVotes}
        <button className='downdoot'></button>
      </span>
    </div>
  </div>
}

// TODO: fullscreen meme view

const HoverImg = ({ imageSrc, gifSrc, width, height, alt }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <img
        src={isHovering ? gifSrc : imageSrc}
        width={width}
        height={height}
        alt={alt}
      />
    </div>
  );
};
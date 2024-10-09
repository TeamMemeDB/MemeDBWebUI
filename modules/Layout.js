import React, {useEffect, useState} from 'react';
import { Panel, DropDown, MultiDropDown, VideoControl } from './Control';
import {User,UserNav} from './User';
import {getContrastYIQ} from '../lib/colour.js';

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
        <input type="text" name="q" placeholder="Search MemeDB" onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)}></input>
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
  {id:'new', name:'newest first', displayname: <><i className='icon-sparkle pink'/> Newest</>, description:"Newest memes first"},
  {id:'old', name:'oldest first', displayname: <><i className='icon-calendar blue'/> Oldest</>, description:"Oldest memes first"},
  {id:'top', name:'top rated first', displayname: <><i className='icon-fire red'/> Top rated</>, description:"Most upvoted memes first"},
  {id:'bottom', name:'bottom rated first', displayname: <><i className='icon-bin'/> Bottom rated</>, description:"Least upvoted memes first"}
];

export const edgeLevels = [
  {id:5, name: 'Unrated', displayname: <><i className='icon-notification'/></>, description: "Currently unclassified"},
  {id:0, name: 'Family friendly', displayname: <Pepper count={1}/>, description: "Regular content, safe for everyone"},
  {id:1, name: 'NSFW/Edgy', displayname: <Pepper count={2}/>, description: "NSFW or edgy, not for children"},
  {id:2, name: 'Turbo Edgy', displayname: <Pepper count={3}/>, description: "Very NSFW or politically edgy"},
  {id:3, name: 'NSFL/Banned', displayname: <Pepper count={4}/>, description: "Banned from this database"}
];

const dropdownFormat = (item) => {
  if('_id' in item) {
    item['id'] = item['_id'];
    delete item['_id'];
  }
  if('memes' in item) {
    item['count'] = item['memes'];
    delete item['memes'];
  }
  return item;
}

export const Browse = (props) => {
  const [currentSort, setCurrentSort] = useState('new');
  const [currentCategories, setCurrentCategories] = useState([-1]);
  const [currentTags, setCurrentTags] = useState([-1]);
  const [currentEdge, setCurrentEdge] = useState(0); // No support for multiple edge levels for now

  const sorts = props.customSorts? props.customSorts: sortModes;
  const edge = props.customEdge? props.customEdge: edgeLevels;
  const tags = props.tags.map(dropdownFormat);
  const categories = props.categories.map(dropdownFormat);
  const [data, setData] = useState(props.preloadData);
  const [query, setQuery] = useState(props.preloadQuery);
  
  // A hypothetical new query, based on what the search controls are currently set to
  const newQuery = {
    sort: currentSort,
    categories: currentCategories[0]==-1?'all':currentCategories[0]==-2?[]:currentCategories.join(','),
    tags: currentTags[0]==-1?'all':currentTags[0]==-2?[]:currentTags.join(','),
    edge: currentEdge,
    from: 0,
    filter: ''
  };
  
  useEffect(() => {
    if(JSON.stringify(query) != JSON.stringify(newQuery)) {
      console.log("Fetching memes...");
      // Memes are currently in an invalid state, invalidate them
      if(data.length)
        setData([]);
      const fetchData = async () => {
        const querystring = new URLSearchParams(newQuery).toString();
        const url = `/api/memes?${querystring}`;
        const response = await fetch(url);
        setQuery(newQuery);
        setData(await response.json());
      }
      fetchData();
    }
  });

  return <div className="page">
    <Panel type="toolbelt" title="Search Tools">
      <DropDown name={<><i className="icon-menu2"/> Sort</>} choices={sorts} value={currentSort} setter={setCurrentSort}/>
      <MultiDropDown name={<><i className="icon-folder"/> Categories</>} choices={categories} value={currentCategories} setter={setCurrentCategories} inclusivityeditor={true} inclusive={true}/>
      <MultiDropDown name={<><i className="icon-tags"/> Tags</>} choices={tags} value={currentTags} setter={setCurrentTags} inclusivityeditor={true} inclusive={true} displayname={(s) => '#'+s}/>
      <DropDown name={<><i className="icon-pepper"/> Edge</>} choices={edge} value={currentEdge} setter={setCurrentEdge} inclusive={false}/>
    </Panel>
    <MemeGrid data={data}/>
  </div>;
}

const MemeGrid = (props) => {
  const memes = props.data?.memes? props.data.memes: [];
  const matches = props.data?.matches? props.data.matches: 0;

  return <>
    <span className='memecount'>Found {matches} memes.</span>
    <div className='memegrid'>{memes.map((meme, i) =>
      <GridMeme key={i} meme={meme}/>
    )}</div>
  </>;
}

const GridMeme = (props) => {
  const meme = props.meme;

  let media;
  if(meme.type=='image')
    media = <img className='content' src={meme.thumbUrl} alt={meme.transcription?meme.transcription:'Meme number '+meme._id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='gif')
    media = <HoverImg className='content' imageSrc={meme.thumbUrl} gifSrc={meme.url} alt={meme.transcription?meme.transcription:'Meme number '+meme._id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='video')
    media = <VideoControl className='content' width={meme.width} height={meme.height} poster={meme.thumbUrl} preload='none'><source src={meme.url}></source></VideoControl>;
  else
    media = <p className='content' style={{color:'red'}}>Unsupported media type {meme.type}</p>

  let bio, biodetails;
  if(meme.description) {
    bio = meme.description;
    biodetails = "Description by " + meme.descriptionAuthor;
  }
  else if(meme.transcription) {
    bio = meme.transcription;
    biodetails = "Transcription by " + meme.transcriptionAuthor;
  }
  else if(meme.topTags) {
    bio = meme.topTags.map((tid) => tags[tid].name).join(', ');
    biodetails = "Top tags";
  }
  else if(meme.topCategories) {
    bio = meme.topCategories.map((cid) => categories[cid].name).join(', ');
    biodetails = "Top categories";
  }
  else {
    bio = 'Meme #'+meme._id;
    biodetails = "More information needed";
  }
  
  bio = bio.replaceAll('<br />', '');

  let contrast = getContrastYIQ(meme.color);
  return <div className={'meme ' + (contrast=='white'?'dark':'')} href={'/meme/'+meme._id} style={{'backgroundColor':meme.color}}>
    {media}
    <div className='info'>
      <p className='bio' title={bio}>{bio}</p>
      <p className='biotype'>{biodetails}</p>
    </div>
    <div className='dooter'>
      <button className='updoot'><i className='icon-arrow-up'></i></button>
      <div className='doots'>{meme.totalVotes}</div>
      <button className='downdoot'><i className='icon-arrow-down'></i></button>
    </div>
  </div>
}

// TODO: fullscreen meme view

const HoverImg = ({ className, imageSrc, gifSrc, width, height, alt }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <img
      className={className + ' ' + (isHovering ? '' : 'gif')}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      src={isHovering ? gifSrc : imageSrc}
      width={width}
      height={height}
      alt={alt}
    />
  );
};
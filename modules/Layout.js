import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Panel, dropdownFormat, DropDown, itemSearch, MultiDropDown, VideoControl } from './Control';
import { User, UserNav } from './User';
import { getContrastYIQ } from '../lib/colour.js';
import { sortModes, edgeLevels, Query, idIndex } from '../lib/memedb.js';

export const Header = (props) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const searchBar = useRef(null);
  const user = null;// new User('Yiays');

  return <header><nav>
    <div className={"navbutton navbutton-title-search"+(searchFocus?' searchfocus':'')}>
      <NavItem href="/">
        <img src="/img/icon.png" alt="MemeDB Icon"/>
        <h1>
          <span color='#fafafa'>Meme</span>
          <span className="accent">DB</span>
        </h1>
      </NavItem>
      <form target='/search' onSubmit={(e)=>{e.preventDefault();props.setFilter(searchBar.current.value)}}>
        <input 
          ref={searchBar} type="text" name="filter" placeholder="Search MemeDB" defaultValue={props.filter}
          minLength={3} maxLength={50}
          onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)}
        />
        <button type="submit" className="btn" value=""><i className='icon-search'/></button>
      </form>
    </div>
    <NavSpacer></NavSpacer>
    <UserNav user={user}/>
  </nav></header>;
}

export const Footer = (props) => {
  return <footer><nav>
    <NavItem href="https://yiays.com">Created by Yiays</NavItem>
    <NavSpacer/>
    <NavItem href="/terms">Terms</NavItem>
    <NavItem href="/report">Report Abuse</NavItem>
    <NavItem href="https://github.com/TeamMemeDB">GitHub</NavItem>
    <NavItem href="/dmca">DMCA</NavItem>
  </nav></footer>;
}

export const NavItem = (props) => {
  return <Link href={props.href} className={"btn navbutton" + (props.className?' '+props.className:'')}>
    {props.children}
  </Link>
}

export const NavSpacer = (props) => {
  return <span className='navspacer'/>
}

export const Browse = (props) => {
  // Page state
  const router = useRouter();
  const sorts = props.customSorts? props.customSorts: sortModes;
  const edge = props.customEdge? props.customEdge: edgeLevels;
  const tags = dropdownFormat(props.tags).sort((a,b) => b.count-a.count);
  const categories = dropdownFormat(props.categories);

  // DropDown state
  const query = new Query(props.query);
  const [nextSort, setNextSort] = useState(query.sort);
  const [nextCategories, setNextCategories] = useState(query.categories);
  const [nextTags, setNextTags] = useState(query.tags);
  const [nextEdge, setNextEdge] = useState(query.edge); // No support for multiple edge levels for now

  const [loading, setLoading] = useState(false);
  const navigate = () => {
    // Find the new url based on changes to state
    const nextQuery = new Query({
      sort: nextSort,
      categories: nextCategories,
      tags: nextTags,
      edge: nextEdge,
      from: 0,
      filter: props.filter
    });

    if(query.equals(nextQuery)) {
      setLoading(false);
    }else{
      router.push(nextQuery.toUrl());
      setLoading(true);
    }
  }
  useEffect(navigate, [props.query]);

  let filteredCategories, filteredTags;
  if(query.filter) {
    filteredCategories = categories.filter(c => itemSearch(c, query.filter));
    filteredTags = tags.filter(t => itemSearch(t, query.filter));
  }

  return <div className="browse">
    <Panel type="toolbelt" title="Search Tools">
      <DropDown name={<><i className="icon-menu2"/> Sort</>} choices={sorts} value={nextSort} setter={setNextSort}/>
      <MultiDropDown name={<><i className="icon-folder"/> Categories</>} choices={categories} value={nextCategories} setter={setNextCategories} inclusivityeditor={true} inclusive={true}/>
      <MultiDropDown name={<><i className="icon-tags"/> Tags</>} choices={tags} value={nextTags} setter={setNextTags} inclusivityeditor={true} inclusive={true} displayname={(s) => '#'+s}/>
      <DropDown name={<><i className="icon-pepper"/> Edge</>} choices={edge} value={nextEdge} setter={setNextEdge} inclusive={false}/>
      <button className='btn' onClick={navigate}>Update</button>
    </Panel>
    {(loading)?
      <p>Loading...</p>
    :<>
      {(query.filter)?
        <>
          <h2>Categories matching "{query.filter}"</h2>
          <p className='memecount'>Found {filteredCategories.length} categor{filteredCategories.length==1?'y':'ies'}.</p>
          <CategoryGrid categories={filteredCategories}/>
          <h2>Tags matching "{query.filter}"</h2>
          <p className='memecount'>Found {filteredTags.length} tag{filteredCategories.length==1?'':'s'}.</p>
          <TagGrid tags={filteredTags}/>
          <h2>Memes matching "{query.filter}"</h2>
        </>
        :<></>
      }
      {(query.categories.length==0)?
        <>
          <h2>Categories</h2>
          <CategoryGrid categories={categories}/>
        </>
        :<></>
      }
      {(query.tags.length==0)?
        <>
          <h2>Tags</h2>
          <TagGrid tags={tags}/>
        </>
        :<></>
      }
      {(props.data)?
        <>
          <p className='memecount'>Found {props.data.matches||0} meme{props.data.matches&&props.data.matches==1?'':'s'}.</p>
          <MemeGrid data={props.data} mappedCategories={idIndex(categories)} mappedTags={idIndex(tags)}/>
        </>
        :<></>
      }
    </>}
  </div>;
}

const MemeGrid = (props) => {
  const memes = props.data?.memes? props.data.memes: [];

  if(memes.length) {
    return <div className='item-grid'>{memes.map((meme, i) =>
      <GridMeme key={i} meme={meme} mappedCategories={props.mappedCategories} mappedTags={props.mappedTags}/>
    )}</div>;
  }else if(props.data.errorMessage) {
    return <p style={{color:'red'}}>{props.data.errorMessage}</p>;
  }else return <></>
}

const GridMeme = (props) => {
  const meme = props.meme;

  let media;
  if(meme.type=='image')
    media = <img key={meme.id} className='content' src={meme.thumbUrl} alt={meme.transcription?meme.transcription:'Meme number '+meme._id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='gif')
    media = <HoverImg key={meme.id} className='content' imageSrc={meme.thumbUrl} gifSrc={meme.url} alt={meme.transcription?meme.transcription:'Meme number '+meme._id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='video')
    media = <VideoControl key={meme.id} className='content' width={meme.width} height={meme.height} poster={meme.thumbUrl} preload='none' url={meme.url}/>;
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
  else if(meme.topTags.length) {
    bio = meme.topTags.map((tagId) => props.mappedTags[parseInt(tagId)]?.name||tagId).join(', ');
    biodetails = "Top tags";
  }
  else if(meme.topCategories.length) {
    bio = meme.topCategories.map((categoryId) => props.mappedCategories[parseInt(categoryId)]?.name||categoryId).join(', ');
    biodetails = "Top categories";
  }
  else {
    bio = 'Meme #'+meme._id;
    biodetails = "More information needed";
  }
  
  bio = bio.replaceAll('<br />', '');

  let contrast = getContrastYIQ(meme.color);
  return <div className={'meme' + (contrast=='white'?' dark':'') + (meme.flags.nsfw?' nsfw':'')} style={{'backgroundColor':meme.color}}>
    {media}
    <Link href={'/meme/'+meme._id} className='info'>
      <span className='bio' title={bio}>{bio}</span>
      <span className='biotype'>{biodetails}</span>
    </Link>
    <div className='dooter'>
      <button className='updoot'><i className='icon-arrow-up'></i></button>
      <div className='doots'>{meme.totalVotes}</div>
      <button className='downdoot'><i className='icon-arrow-down'></i></button>
    </div>
  </div>
}

const CategoryGrid = (props) => {
  return <div className='item-grid' style={{fontSize:'1.25em', 'margin':'0 1rem'}}>{props.categories.map(category => 
    <Link key={category.id} className='grid-item category' href={'/categories/'+category.id} title={category.description}>
      <span>{category.name} <i className="dim">({category.count})</i></span>
      <br/>
      <sub>{category.description}</sub>
    </Link>
  )}</div>
}

const TagGrid = (props) => {
  return <div className='item-grid' style={{fontSize:'0.8em', margin: '0 1rem'}}>{
    props.tags.filter(tag => tag.count > 0).map(tag => 
      <Link key={tag.id} className='grid-item' href={'/tags/'+tag.id}><span>#{tag.name} <i className="dim">({tag.count})</i></span></Link>
    )
  }</div>
}

// TODO: fullscreen meme view

const HoverImg = ({ key, className, imageSrc, gifSrc, width, height, alt }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <img
      key={key}
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
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Panel, dropdownFormat, DropDown, itemSearch, MultiDropDown, VideoControl } from './Control';
import { User, UserNav } from './User';
import { getContrastYIQ } from '../lib/colour';
import { sortModes, edgeLevels, Query, idIndex, Meme } from '../lib/memedb';

export const Header = (props:any) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const searchBar:React.MutableRefObject<HTMLInputElement|null> = useRef(null);
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
      <form target='/search' onSubmit={(e)=>{e.preventDefault();props.setFilter(searchBar.current?.value)}}>
        <input 
          ref={searchBar} type="text" name="filter" placeholder="Search MemeDB" defaultValue={props.filter}
          minLength={3} maxLength={50}
          onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)}
        />
        <button type="submit" className="btn" value=""><i className='icon-search'/></button>
      </form>
    </div>
    <NavSpacer></NavSpacer>
    {/*<UserNav user={user}/>*/}
  </nav></header>;
}

export const Footer = (props:any) => {
  return <footer><nav>
    <NavItem href="https://yiays.com">Created by Yiays</NavItem>
    <NavSpacer/>
    <NavItem href="/terms">Terms</NavItem>
    <NavItem href="/report">Report Abuse</NavItem>
    <NavItem href="https://github.com/TeamMemeDB">GitHub</NavItem>
    <NavItem href="/dmca">DMCA</NavItem>
  </nav></footer>;
}

export const NavItem = (props:any) => {
  return <Link href={props.href} className={"btn navbutton" + (props.className?' '+props.className:'')}>
    {props.children}
  </Link>
}

export const NavSpacer = (props:any) => {
  return <span className='navspacer'/>
}

export const Browse = (props:any) => {
  // Page state
  const router = useRouter();
  const sorts = props.customSorts? props.customSorts: sortModes;
  const edge = props.customEdge? props.customEdge: edgeLevels;
  const tags = dropdownFormat(props.tags).sort((a:any,b:any) => b.count-a.count);
  const categories = dropdownFormat(props.categories);

  // DropDown state
  const query = Query.create(props.query);
  const [nextSort, setNextSort] = useState(query.sort);
  const [nextCategories, setNextCategories] = useState(query.categories);
  const [nextTags, setNextTags] = useState(query.tags);
  const [nextEdge, setNextEdge] = useState(query.edge); // No support for multiple edge levels for now

  const [loading, setLoading] = useState(false);
  const navigate = () => {
    // Find the new url based on changes to state
    const nextQuery = Query.create({
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
    filteredCategories = categories.filter((c:any) => itemSearch(c, query.filter));
    filteredTags = tags.filter((t:any) => itemSearch(t, query.filter));
  }

  return <div className="browse">
    <Panel type="toolbelt" title="Search Tools">
      <DropDown name={<><i className="icon-menu2"/> Sort</>} choices={sorts} value={nextSort} setter={setNextSort}/>
      <MultiDropDown name={<><i className="icon-folder"/> Categories</>} choices={categories} value={nextCategories} setter={setNextCategories} inclusivityeditor={true} inclusive={true}/>
      <MultiDropDown name={<><i className="icon-tags"/> Tags</>} choices={tags} value={nextTags} setter={setNextTags} inclusivityeditor={true} inclusive={true} displayname={(s:any) => '#'+s}/>
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
          <MemeGrid data={props.data} categories={categories} tags={tags}/>
        </>
        :<></>
      }
    </>}
  </div>;
}

const MemeGrid = (props:any) => {
  const memes: Meme[] = props.data?.memes? props.data.memes.map((rawmeme:any) => Meme.create(rawmeme)): [];

  if(memes.length) {
    return <div className='item-grid'>{memes.map((meme, i) =>
      <GridMeme key={i} meme={meme} categories={props.categories} tags={props.tags}/>
    )}</div>;
  }else if(props.data.errorMessage) {
    return <p style={{color:'red'}}>{props.data.errorMessage}</p>;
  }else return <></>
}

function parseMeme(meme:Meme, mappedCategories:{[id:number]:any}, mappedTags:{[id:number]:any}) {
  const {description, descriptionAuthor} = meme.descriptionWithAuthor();
  const {transcription, transcriptionAuthor} = meme.transcriptionWithAuthor();
  const topTags = meme.topTags();
  const topCategories = meme.topCategories();

  let media:JSX.Element;
  if(meme.type=='image')
    media = <img key={meme.id} className='content' src={meme.thumbUrl} alt={transcription?transcription:'Meme number '+meme.id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='gif')
    media = <HoverImg key={meme.id} className='content' imageSrc={meme.thumbUrl} gifSrc={meme.url} alt={transcription?transcription:'Meme number '+meme.id} width={meme.width} height={meme.height}/>;
  else if(meme.type=='video')
    media = <VideoControl key={meme.id} className='content' width={meme.width} height={meme.height} poster={meme.thumbUrl} preload='none' url={meme.url}/>;
  else
    media = <p className='content' style={{color:'red'}}>Unsupported media type {meme.type}</p>

  let bio:string, biodetails:string;
  if(description) {
    bio = description;
    biodetails = "Description by " + descriptionAuthor;
  }
  else if(transcription) {
    bio = transcription;
    biodetails = "Transcription by " + transcriptionAuthor;
  }
  else if(topTags.length) {
    bio = topTags.map((tagId) => mappedTags[tagId]?.name||tagId).join(', ');
    biodetails = "Top tags";
  }
  else if(topCategories.length) {
    bio = topCategories.map((categoryId) => mappedCategories[categoryId]?.name||categoryId).join(', ');
    biodetails = "Top categories";
  }
  else {
    bio = 'Meme #'+meme.id;
    biodetails = "More information needed";
  }
  
  bio = bio.replaceAll('<br />', '');

  return {media, bio, biodetails};
}

const GridMeme = (props:any) => {
  const meme:Meme = props.meme;
  const mappedCategories = idIndex<any>(props.categories);
  const mappedTags = idIndex<any>(props.tags);
  const {media, bio, biodetails} = parseMeme(meme, mappedCategories, mappedTags);
  const contrast = getContrastYIQ(meme.color);

  return <div className={'meme' + (contrast=='white'?' dark':'') + (meme.flags.nsfw?' nsfw':'')} style={{'backgroundColor':meme.color}}>
    {media}
    <Link href={'/meme/'+meme.id} className='info'>
      <span className='bio' title={bio}>{bio}</span>
      <span className='biotype'>{biodetails}</span>
    </Link>
    <div className='dooter'>
      <button className='updoot'><i className='icon-arrow-up'></i></button>
      <div className='doots'>{meme.votes()}</div>
      <button className='downdoot'><i className='icon-arrow-down'></i></button>
    </div>
  </div>
}


const CategoryGrid = (props:any) => {
  return <div className='item-grid' style={{fontSize:'1.25em', 'margin':'0 1rem'}}>{props.categories.map((category:any) => 
    <Link key={category.id} className='grid-item category' href={'/categories/'+category.id} title={category.description}>
      <span>{category.name} <i className="dim">({category.count})</i></span>
      <br/>
      <sub>{category.description}</sub>
    </Link>
  )}</div>
}

const TagGrid = (props:any) => {
  return <div className='item-grid' style={{fontSize:'0.8em', margin: '0 1rem'}}>{
    props.tags.filter((tag:any) => tag.count > 0).map((tag:any) => 
      <Link key={tag.id} className='grid-item' href={'/tags/'+tag.id}><span>#{tag.name} <i className="dim">({tag.count})</i></span></Link>
    )
  }</div>
}

// TODO: fullscreen meme view

const HoverImg = ({ key, className, imageSrc, gifSrc, width, height, alt }:any) => {
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
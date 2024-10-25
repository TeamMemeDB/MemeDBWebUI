import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Panel, dropdownFormat, DropDown, itemSearch, MultiDropDown } from './Control';
import { User, UserNav } from './User';
import { getContrastYIQ } from '../lib/colour';
import { sortModes, edgeLevels, Query, idIndex, Meme, voters } from '../lib/memedb';

export const Header = (props:any) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const searchBar:React.MutableRefObject<HTMLInputElement|null> = useRef(null);
  const user = null;// new User('Yiays');

  function search(value:string) {
    let nextQuery = Query.clone(props.query);
    nextQuery.filter = value;
    props.setQuery(nextQuery);
  }

  return <header><nav>
    <div className={"navbutton navbutton-title-search"+(searchFocus?' searchfocus':'')}>
      <NavItem href="/">
        <img src="/img/icon.png" alt="MemeDB Icon"/>
        <h1>
          <span color='#fafafa'>Meme</span>
          <span className="accent">DB</span>
        </h1>
      </NavItem>
      <form target='/search' onSubmit={(e)=>{e.preventDefault();search(searchBar.current?.value || '')}}>
        <input 
          ref={searchBar} type="text" name="filter" placeholder="Search MemeDB" defaultValue={props.query.filter}
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
  const sorts = props.customSorts? props.customSorts: sortModes;
  const edge = props.customEdge? props.customEdge: edgeLevels;
  const tags = dropdownFormat(props.tags).sort((a:any,b:any) => b.count-a.count);
  const categories = dropdownFormat(props.categories);

  // DropDown state
  const [nextSort, setNextSort] = useState(props.query.sort);
  const [nextCategories, setNextCategories] = useState(props.query.categories);
  const [nextTags, setNextTags] = useState(props.query.tags);
  const [nextEdge, setNextEdge] = useState(props.query.edge); // No support for multiple edge levels for now

  function search() {
    // Find the new url based on changes to state
    props.setQuery(Query.create({
      sort: nextSort,
      categories: nextCategories,
      tags: nextTags,
      edge: nextEdge,
      from: 0,
      filter: props.filter
    }));
  }

  let filteredCategories, filteredTags;
  if(props.query.filter) {
    filteredCategories = categories.filter((c:any) => itemSearch(c, props.query.filter));
    filteredTags = tags.filter((t:any) => itemSearch(t, props.query.filter));
  }

  return <div className="browse">
    <Panel type="toolbelt" title="Search Tools">
      <DropDown name={<><i className="icon-menu2"/> Sort</>} choices={sorts} value={nextSort} setter={setNextSort}/>
      <MultiDropDown name={<><i className="icon-folder"/> Categories</>} choices={categories} value={nextCategories} setter={setNextCategories} inclusivityeditor={true} inclusive={true}/>
      <MultiDropDown name={<><i className="icon-tags"/> Tags</>} choices={tags} value={nextTags} setter={setNextTags} inclusivityeditor={true} inclusive={true} displayname={(s:any) => '#'+s}/>
      <DropDown name={<><i className="icon-pepper"/> Edge</>} choices={edge} value={nextEdge} setter={setNextEdge} inclusive={false}/>
      <button className='btn' onClick={search}>Update</button>
    </Panel>
    {(props.query.filter)?
      <>
        <h2>Categories matching "{props.query.filter}"</h2>
        <p className='memecount'>Found {filteredCategories.length} categor{filteredCategories.length==1?'y':'ies'}.</p>
        <CategoryGrid categories={filteredCategories}/>
        <h2>Tags matching "{props.query.filter}"</h2>
        <p className='memecount'>Found {filteredTags.length} tag{filteredCategories.length==1?'':'s'}.</p>
        <TagGrid tags={filteredTags}/>
        <h2>Memes matching "{props.query.filter}"</h2>
      </>
      :<></>
    }
    {(props.query.categories.length==0)?
      <>
        <h2>Categories</h2>
        <CategoryGrid categories={categories}/>
      </>
      :<></>
    }
    {(props.query.tags.length==0)?
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

const GridMeme = (props:any) => {
  const meme:Meme = props.meme;
  const mappedCategories = idIndex<any>(props.categories);
  const mappedTags = idIndex<any>(props.tags);
  const {bio, biodetails} = meme.bio(mappedCategories, mappedTags);
  const contrast = getContrastYIQ(meme.color);

  return <div className={'meme' + (contrast=='white'?' dark':'') + (meme.flags.nsfw?' nsfw':'')} style={{'backgroundColor':meme.color}}>
    {meme.media()}
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

function voteFormat(arr:any[], idKey:string, source:{[id: number]:any}) {
  return arr.map((vote) => {
    let item = source[vote[idKey]];
    item.count = vote.votes.length;
    return item;
  })
}

export const SingleMeme = (props:any) => {
  const meme:Meme = props.meme;
  const mappedCategories = idIndex<any>(dropdownFormat(props.categories));
  const mappedTags = idIndex<any>(dropdownFormat(props.tags));
  //const mappedUsers = idIndex<any>(props.users);
  const {bio, biodetails} = meme.bio(mappedCategories, mappedTags);
  const contrast = getContrastYIQ(meme.color);
  const {description, descriptionAuthor} = meme.descriptionWithAuthor();
  const {transcription, transcriptionAuthor} = meme.transcriptionWithAuthor();

  return <article className={'meme large' + (contrast=='white'?' dark':'')} style={{'backgroundColor':meme.color}}>
    <div className='head'>
      <h2>{bio}</h2>
      <sub>{biodetails}</sub>
    </div>
    {meme.media()}
    <div className="controls">
      <h3>Description</h3>
      <p>{description?.replaceAll('<br />', '')}</p>
      <sub>By {/*typeof descriptionAuthor == 'number'? mappedUsers[descriptionAuthor]?.name: */descriptionAuthor}</sub>
      <hr/>
      <h3>Transcription</h3>
      <p>{transcription?.replaceAll('<br />', '')}</p>
      <sub>By {/*typeof transcriptionAuthor == 'number'? mappedUsers[transcriptionAuthor]?.name: */transcriptionAuthor}</sub>
      <hr/>
      <h3>Categories</h3>
      <CategoryGrid categories={voteFormat(meme.categories, 'category', mappedCategories)}/>
      <hr/>
      <h3>Tags</h3>
      <TagGrid tags={voteFormat(meme.tags, 'tag', mappedTags)}/>
      <hr/>
      <h3>Edge Rating</h3>
      <p>{meme.edge().toString()}</p>
      <hr/>
      <h3>Flags</h3>
      <input type="checkbox" disabled name="hidden" id={meme.id+'_hidden'} value={meme.flags.hidden?'true':'false'}/>
      <label htmlFor={meme.id+'_hidden'}>Hidden</label>
      { meme.type == 'video'?
        <>
          <input type="checkbox" disabled name="silent" id={meme.id+'_silent'} value={meme.flags.silent?'true':'false'}/>
          <label htmlFor={meme.id+'_silent'}>Silent</label>
        </>
      :
        <></>
      }
      <input type="checkbox" disabled name="nsfw" id={meme.id+'_nsfw'} value={meme.flags.nsfw?'true':'false'}/>
      <label htmlFor={meme.id+'_nsfw'}>NSFW</label>
    </div>
  </article>
}

const CategoryGrid = (props:any) => {
  return <div className='item-grid categories'>{props.categories.map((category:any) => 
    <Link key={category.id} className='grid-item category' href={'/categories/'+category.id} title={category.description}>
      <span>{category.name} <i className="dim">({category.count})</i></span>
      <sub>{category.description}</sub>
    </Link>
  )}</div>
}

const TagGrid = (props:any) => {
  return <div className='item-grid tags'>{
    props.tags.filter((tag:any) => tag.count > 0).map((tag:any) => 
      <Link key={tag.id} className='grid-item' href={'/tags/'+tag.id}><span>#{tag.name} <i className="dim">({tag.count})</i></span></Link>
    )
  }</div>
}

import React from 'react'
// Common utilities for working with MemeDB API data

export const sortModes = [
  {id:'new', name:'newest first', displayname: <><i className='icon-sparkle pink'/> Newest</>, description:"Newest memes first"},
  {id:'old', name:'oldest first', displayname: <><i className='icon-calendar blue'/> Oldest</>, description:"Oldest memes first"},
  {id:'top', name:'top rated first', displayname: <><i className='icon-fire red'/> Top rated</>, description:"Most upvoted memes first"},
  {id:'bottom', name:'bottom rated first', displayname: <><i className='icon-bin'/> Bottom rated</>, description:"Least upvoted memes first"}
];

function Pepper(props){
  return <> {
    Array.from({length: props.count}, (_, i) => <i key={i} className='icon-pepper red' title={(props.count) + ' pepper(s)'}/>)
  } </>;
}

// List of available edge levels
export const edgeLevels = [
  {id:5, name: 'Unrated', displayname: <><i className='icon-notification'/></>, description: "Currently unclassified"},
  {id:0, name: 'Family friendly', displayname: <Pepper count={1}/>, description: "Regular content, safe for everyone"},
  {id:1, name: 'NSFW/Edgy', displayname: <Pepper count={2}/>, description: "NSFW or edgy, not for children"},
  {id:2, name: 'Turbo Edgy', displayname: <Pepper count={3}/>, description: "Very NSFW or politically edgy"},
  {id:3, name: 'NSFL/Banned', displayname: <Pepper count={4}/>, description: "Banned from this database"}
];

function tryInt(x) {
  // Convert category and tag ids to Numbers if possible
  let v=parseInt(x,10);
  return isNaN(v)?x:v;
}

type RawQuery = {
  sort?:string, categories?:string|('all'|number)[], tags?:string|('all'|number)[], edge?:string|number,
  from?:string|number, filter?:string, limit?:string|number
}
type sorts = 'new'|'old'|'top'|'bottom'

export class Query {
  sort:sorts;
  categories:('all'|number)[];
  tags:('all'|number)[];
  edge:number;
  from:number;
  filter:string;
  limit:number;

  // Represents a /api/memes database query
  static create(raw:Partial<RawQuery>):Query {
    let out = new Query();

    out.sort = raw.sort as sorts || 'new';

    if(typeof raw.categories == 'string' && raw.categories.includes(','))
      out.categories = raw.categories.split(',').map(tryInt);
    else if(raw.categories == 'all')
      out.categories = [raw.categories];
    else if(Array.isArray(raw.categories))
      out.categories = raw.categories;
    else out.categories = ['all'];
    
    if(typeof raw.tags == 'string' && raw.tags.includes(','))
      out.tags = raw.tags.split(',').map(tryInt);
    else if(raw.tags == 'all')
      out.tags = [raw.tags];
    else if(Array.isArray(raw.tags))
      out.tags = raw.tags;
    else out.tags = ['all'];

    out.edge = Number(raw.edge) || 0;
    out.from = Number(raw.from) || 0;
    out.filter = raw.filter || '';
    out.limit = Number(raw.limit) || 50;

    return out;
  }

  toJSON() {
    return {
      sort: this.sort,
      categories: this.categories,
      tags: this.tags,
      edge: this.edge,
      from: this.from,
      filter: this.filter,
      limit: this.limit
    }
  }

  difference(other:Query) {
    return {
      ...(this.sort!=other.sort?{sort: other.sort}:{}),
      ...(this.categories.sort().join(',')!=other.categories.sort().join(',')?{categories: other.categories}:{}),
      ...(this.tags.sort().join(',')!=other.tags.sort().join(',')?{tags: other.tags}:{}),
      ...(this.edge!=other.edge?{edge: other.edge}:{}),
      ...(this.from!=other.from?{from: other.from}:{}),
      ...(this.filter!=other.filter?{filter: other.filter}:{}),
      ...(this.limit!=other.limit?{limit: other.limit}:{}),
    };
  }

  equals(other:Query) {
    return Object.keys(this.difference(other)).length?false:true;
  }

  toUrl():string {
    const delta = Query.create({}).difference(this);
    const pageKeys = Object.keys(delta).filter(key => ['categories', 'tags', 'filter', 'edge', 'sort'].includes(key));
  
    if(pageKeys.length == 0) {
      return '/sort/new';
    }
    if(pageKeys.length == 1) {
      // Sort page
      if(pageKeys[0] == 'sort') {
        return `/sort/${this.sort}`;
      }

      // Categories page
      if(pageKeys[0] == 'categories') {
        if(this.categories.length==0) return '/categories/';
        if(this.categories.length==1) return `/categories/${this.categories[0]}`;
        // Pass on to advanced query builder
      }

      // Tags page
      else if(pageKeys[0] == 'tags') {
        if(this.tags.length==0) return '/tags/';
        if(this.tags.length==1) return `/tags/${this.tags[0]}`;
        // Pass on to advanced query builder
      }
    }
    // Advanced search
    const params = new URLSearchParams(Object(delta)).toString().replaceAll('%2C', ',');
    return `/search?${params}`;
  }

  apiUrl():string {
    let delta = Query.create({}).difference(this);
    const params = new URLSearchParams(Object(delta)).toString().replaceAll('%2C', ',');
    return `/api/memes${params?'?'+params:''}`;
  }
}

type DBMeme = {
  _id, type, url, thumbUrl, color, width, height, flags, totalVotes, votes, avgEdgeVotes, edgevotes,
  descriptions, topDescription, descriptionAuthor, transcriptions, topTranscription, transcriptionAuthor,
  tags, topTags, categories, topCategories
}
type memeTypes = 'image'|'video'|'gif'|'url'|'audio'|'text'|'unknown'
type voters = {user:number, value:number}[]

function sortByVotes<T extends {votes:voters}>(arr:T[]):T[] {
  // Sorts any array of objects with a votes.value key.
  return arr.sort((a, b) => {
    return b.votes.reduce((out, vote) => out+vote.value, 0) - a.votes.reduce((out, vote) => out+vote.value, 0)
  });
}

export class Meme {
  public id:number;
  type:memeTypes;
  url:string;
  thumbUrl:string;
  color:string;
  width:number;
  height:number;
  flags:{hidden:boolean, nsfw:boolean, silent:boolean}
  _votes:number
  voters:voters;
  _edge: number;
  edgeVoters:voters;
  descriptions:{_id:number, author:number, description:string, edit:number|null, votes:voters}[];
  _topDescription:string|null;
  _descriptionAuthor:number|null;
  transcriptions:{_id:number, author:number, transcription:string, edit:number|null, votes:voters}[];
  _topTranscription:string|null;
  _transcriptionAuthor:number|null;
  tags:{tag:number, votes:voters}[];
  _topTags:number[];
  categories:{category:number, votes:voters}[];
  _topCategories:number[];

  // Represents an individual meme from a /api/memes or /api/meme query
  static create(raw:Partial<DBMeme>):Meme {
    let out = new Meme();

    out.id = raw._id || 0;
    out.type = raw.type as memeTypes || 'unknown';
    out.url = raw.url || '';
    out.thumbUrl = raw.thumbUrl || '';
    out.color = raw.color || '000';
    out.width = raw.width || 0;
    out.height = raw.height || 0;

    const {hidden=false, nsfw=false, silent=false} = raw.flags;
    out.flags = {hidden, nsfw, silent}

    out._votes = raw.totalVotes;
    out.voters = raw.votes || [];

    out._edge = raw.avgEdgeVotes;
    out.edgeVoters = raw.edgevotes || [];

    out.descriptions = raw.descriptions;
    out._topDescription = raw.topDescription;
    out._descriptionAuthor = raw.descriptionAuthor;
    
    out.transcriptions = raw.transcriptions;
    out._topTranscription = raw.topTranscription;
    out._transcriptionAuthor = raw.transcriptionAuthor;

    out.tags = raw.tags;
    out._topTags = raw.topTags;

    out.categories = raw.categories;
    out._topCategories = raw.topCategories;

    return out;
  }

  votes():number {
    if(this.voters)
      return this.voters.reduce((v, item) => v+item.value, 0);
    return this._votes;
  }

  edge():number {
    if(this.edgeVoters)
      return this.edgeVoters.reduce((v, item) => v+item.value, 0) / this.edgeVoters.length;
    return this._edge;
  }

  descriptionWithAuthor():[string|null, number|null] {
    if(this.descriptions) {
      const {description, author: authorId} = sortByVotes(this.descriptions)[0];
      return [description, authorId];
    }
    if(this._descriptionAuthor === null)
      return [null, null];
    return [this._topDescription, this._descriptionAuthor];
  }
  
  transcriptionWithAuthor():[string|null, number|null] {
    if(this.transcriptions) {
      const {transcription, author: authorId} = sortByVotes(this.transcriptions)[0];
      return [transcription, authorId];
    }
    if(this._transcriptionAuthor === null)
      return [null, null];
    return [this._topTranscription, this._transcriptionAuthor];
  }

  topTags():number[] {
    if(this.tags) {
      return sortByVotes(this.tags)
      .filter(tag => tag.votes.reduce((out, tag) => out+tag.value, 0) > 0)
      .reduce<number[]>((out, tag) => {out.push(tag.tag); return out}, []);
    }
    return this._topTags;
  }

  topCategories():number[] {
    if(this.categories) {
      return sortByVotes(this.categories)
      .filter(cat => cat.votes.reduce((out, cat) => out+cat.value, 0) > 0)
      .reduce<number[]>((out, cat) => {out.push(cat.category); return out}, []);
    }
    return this._topCategories;
  }
}

export function idIndex<T extends {id:number|string}>(arr:T[]):{[id:number]:T} {
  // Map an item with an .id property to a dictionary with the id as key
  return arr.reduce((out, item) => {out[typeof item.id==='string'?parseInt(item.id):item.id] = item; return out}, {});
}

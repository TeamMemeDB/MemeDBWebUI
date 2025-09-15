import React, { type JSX } from 'react';
import { DropDownItem, HoverImg, Selection, VideoControl } from '@/modules/Control';
import Image from 'next/image';

// Common utilities for working with MemeDB API data

export const sortModes = [
  {id:'new', name:'newest first', displayname: <><i className='icon-sparkle pink'/> Newest</>, description:"Newest memes first"},
  {id:'old', name:'oldest first', displayname: <><i className='icon-calendar blue'/> Oldest</>, description:"Oldest memes first"},
  {id:'top', name:'top rated first', displayname: <><i className='icon-fire red'/> Top rated</>, description:"Most upvoted memes first"},
  {id:'bottom', name:'bottom rated first', displayname: <><i className='icon-bin'/> Bottom rated</>, description:"Least upvoted memes first"}
];

function Pepper(props: {count:number}){
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
] as DropDownItem<number>[];

function selectionCast(x:string): Selection {
  // Convert category and tag ids to Numbers if possible
  const v=parseInt(x, 10);
  return isNaN(v)?(x=='none'? 'none': 'all'):v;
}

export type RawQuery = {
  sort?:string, categories?:string, tags?:string, edge?:string|number,
  from?:string|number, filter?:string, limit?:string|number
}
type sorts = 'new'|'old'|'top'|'bottom'

export class Query {
  sort:sorts = 'new';
  categories:Selection[] = ['all'];
  tags:Selection[] = ['all'];
  edge:number|'all' = 0;
  from:number = 0;
  filter:string = '';
  limit:number = 50;

  // Represents a /api/memes database query
  static create(raw:Partial<RawQuery>):Query {
    const out = new Query();

    out.sort = raw.sort as sorts || 'new';

    if(typeof raw.categories == 'string') {
      if(raw.categories == 'all')
        out.categories = ['all'];
      else if(raw.categories.includes(','))
        out.categories = raw.categories.split(',').map(selectionCast);
      else
        out.categories = [selectionCast(raw.categories)];
    }
    else out.categories = ['all'];
    
    if(typeof raw.tags == 'string') {
      if(raw.tags == 'all')
        out.tags = ['all'];
      else if(raw.tags.includes(','))
        out.tags = raw.tags.split(',').map(selectionCast);
      else
        out.tags = [selectionCast(raw.tags)];
    }
    else out.tags = ['all'];

    if(raw.edge == 'all') out.edge = 'all';
    else out.edge = Number(raw.edge) || 0;
    
    out.from = Number(raw.from) || 0;
    out.filter = raw.filter || '';
    out.limit = raw.limit !== undefined? Number(raw.limit): 50;

    return out;
  }

  static clone(input:Query):Query {
    const out = new Query();

    out.sort = input.sort;
    out.categories = input.categories;
    out.tags = input.tags;
    out.edge = input.edge;
    out.from = input.from;
    out.filter = input.filter;
    out.limit = input.limit;

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
    const delta = Query.create({}).difference(this);
    const params = new URLSearchParams(Object(delta)).toString().replaceAll('%2C', ',');
    return `/api/memes${params?'?'+params:''}`;
  }
}

type memeTypes = 'image'|'video'|'gif'|'url'|'audio'|'text'|'unknown'

export type Voter = {user:number, value:number}

function sortByVotes<T extends {votes: Voter[]}>(arr:T[]):T[] {
  // Sorts any array of objects with a votes.value key.
  return arr.sort((a, b) => {
    return b.votes.reduce((out, vote) => out+vote.value, 0) - a.votes.reduce((out, vote) => out+vote.value, 0)
  });
}

interface MemeFlags {
  hidden:boolean, nsfw:boolean, silent:boolean
}

interface MemeXscription {
  _id:number, author:number, edit:number|null, votes: Voter[]
}

interface MemeDescription extends MemeXscription {
  description: string;
}

interface MemeTranscription extends MemeXscription {
  transcription: string;
}

interface MemeTag {
  tag:number;
  votes: Voter[];
}

interface MemeCategory {
  category:number;
  votes: Voter[];
}

export interface DBMeme {
  _id: number;
  type: string;
  url: string;
  thumbUrl: string;
  color: string;
  width: number;
  height: number;
  flags: MemeFlags;
  totalVotes: number;
  votes: Voter[];
  avgEdgeVotes: number;
  edgevotes: Voter[];
  descriptions: MemeDescription[];
  topDescription: string;
  descriptionAuthor: string;
  transcriptions: MemeTranscription[];
  topTranscription: string;
  transcriptionAuthor: string;
  tags: MemeTag[];
  topTags: number[];
  categories: MemeCategory[];
  topCategories: number[];
}

export interface DBError {
  errorMessage: string;
}

export class Meme {
  public id: number = -1;
  type: memeTypes = 'unknown';
  url: string = '';
  thumbUrl: string = '';
  color: string = '';
  width: number = 0;
  height: number = 0;
  flags: MemeFlags = {hidden:false, nsfw:false, silent:false};
  _votes: number = 0;
  voters: Voter[] = [];
  _edge: number = 0;
  edgeVoters: Voter[] = [];
  descriptions: MemeDescription[] = [];
  _topDescription?: string;
  _descriptionAuthor?: string;
  transcriptions: MemeTranscription[] = [];
  _topTranscription?: string;
  _transcriptionAuthor?: string;
  tags: MemeTag[] = [];
  _topTags: number[] = [];
  categories: MemeCategory[] = [];
  _topCategories: number[] = [];

  // Represents an individual meme from a /api/memes or /api/meme query
  static create(raw:Partial<DBMeme>):Meme {
    const out = new Meme();

    out.id = raw._id || 0;
    out.type = raw.type as memeTypes || 'unknown';
    out.url = raw.url || '';
    out.thumbUrl = raw.thumbUrl || '';
    out.color = raw.color || '000';
    out.width = raw.width || 0;
    out.height = raw.height || 0;

    const {hidden=false, nsfw=false, silent=false} = raw.flags || {};
    out.flags = {hidden, nsfw, silent};

    out._votes = raw.totalVotes || 0;
    out.voters = raw.votes || [];

    out._edge = raw.avgEdgeVotes || 0;
    out.edgeVoters = raw.edgevotes || [];

    out.descriptions = raw.descriptions || [];
    out._topDescription = raw.topDescription;
    out._descriptionAuthor = raw.descriptionAuthor;
    
    out.transcriptions = raw.transcriptions || [];
    out._topTranscription = raw.topTranscription;
    out._transcriptionAuthor = raw.transcriptionAuthor;

    out.tags = raw.tags || [];
    out._topTags = raw.topTags || [];

    out.categories = raw.categories || [];
    out._topCategories = raw.topCategories || [];

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

  descriptionWithAuthor(): {description?: string, descriptionAuthor?: number|string} {
    if(this.descriptions.length) {
      const {description, author: authorId} = sortByVotes(this.descriptions)[0];
      return {description, descriptionAuthor: authorId};
    }
    if(this._descriptionAuthor === null)
      return {};
    return {description: this._topDescription, descriptionAuthor: this._descriptionAuthor};
  }
  
  transcriptionWithAuthor():{transcription?: string, transcriptionAuthor? :number|string} {
    if(this.transcriptions.length) {
      const {transcription, author: authorId} = sortByVotes(this.transcriptions)[0];
      return {transcription, transcriptionAuthor: authorId};
    }
    if(this._transcriptionAuthor === null)
      return {};
    return {transcription: this._topTranscription, transcriptionAuthor: this._transcriptionAuthor};
  }

  topTags(): number[] {
    if(this.tags.length) {
      return sortByVotes(this.tags)
      .filter(tag => tag.votes.reduce((out, tag) => out+tag.value, 0) > 0)
      .reduce<number[]>((out, tag) => {out.push(tag.tag); return out}, []);
    }
    return this._topTags;
  }

  topCategories(): number[] {
    if(this.categories.length) {
      return sortByVotes(this.categories)
      .filter(cat => cat.votes.reduce((out, cat) => out+cat.value, 0) > 0)
      .reduce<number[]>((out, cat) => {out.push(cat.category); return out}, []);
    }
    return this._topCategories;
  }

  bio(mappedCategories: {[id: number]: DropDownItem<number>}, mappedTags: {[id: number]: DropDownItem<number>}): {bio:string, biodetails:string} {
    const { description, descriptionAuthor } = this.descriptionWithAuthor();
    const { transcription, transcriptionAuthor } = this.transcriptionWithAuthor();
    const topTags = this.topTags();
    const topCategories = this.topCategories();
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
      bio = 'Meme #'+this.id;
      biodetails = "More information needed";
    }
    
    bio = bio.replaceAll('<br />', '');
  
    return {bio, biodetails};
  }

  media() {
    const {transcription} = this.transcriptionWithAuthor();
  
    let media:JSX.Element;
    const commonProps = {
      className:'content', width:this.width, height:this.height, style:{'--content-height':this.height+'px'} as React.CSSProperties
    };
    const altText = transcription?transcription:'Meme number '+this.id;

    if(this.type=='image')
      media = <Image key={this.id} {...commonProps} src={this.thumbUrl} alt={altText}/>;
    else if(this.type=='gif')
      media = <HoverImg key={this.id} {...commonProps} imageSrc={this.thumbUrl} gifSrc={this.url} alt={altText}/>;
    else if(this.type=='video')
      media = <VideoControl key={this.id} {...commonProps} poster={this.thumbUrl} preload='none' url={this.url}/>;
    else
      media = <span className='content error'>Unsupported media type {this.type}</span>
  
    return media;
  }
}

export function idIndex<T extends {id:number|string}>(arr:T[]):{[id:number]:T} {
  // Map an item with an .id property to a dictionary with the id as key
  return arr.reduce(
    (out, item) => {
      out[typeof item.id==='string'?parseInt(item.id):item.id] = item;
      return out;
    },
    {} as {[id:number]:T}
  );
}

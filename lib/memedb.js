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

export class Query {
  // Represents a /api/memes database query
  constructor({sort='new', categories='all', tags='all', edge=0, from=0, filter='', limit=50}) {
    this.sort=sort;
    this.categories=categories.includes(',')?categories.split(','):typeof categories=='string'?[categories]:categories;
    this.tags=tags.includes(',')?tags.split(','):typeof tags=='string'?[tags]:tags;
    this.edge=edge;
    this.from=from;
    this.filter=filter;
    this.limit=limit;
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

  difference(other) {
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

  equals(other) {
    return Object.keys(this.difference(other)).length?false:true;
  }

  toUrl() {
    const delta = new Query({}).difference(this);
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
    const params = new URLSearchParams(delta).toString().replaceAll('%2C', ',');
    return `/search?${params}`;
  }

  apiUrl() {
    let delta = new Query({}).difference(this);
    const params = new URLSearchParams(delta).toString().replaceAll('%2C', ',');
    return `/api/memes${params?'?'+params:''}`;
  }
}

export function idIndex(arr) {
  // Map an item with an .id property to a dictionary with the id as key
  return arr.reduce((out, item) => {out[parseInt(item.id)] = item; return out}, {});
}
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

export const compareQuery = (A, B) => {
  // Determines if two queries are the same, even if values are unset
  const {sort:sortA='new', categories:categoriesA='all', tags:tagsA='all', edge:edgeA=0, from:fromA=0, filter:filterA='', limit:limitA=50} = A;
  const {sort:sortB='new', categories:categoriesB='all', tags:tagsB='all', edge:edgeB=0, from:fromB=0, filter:filterB='', limit:limitB=50} = B;
  return sortA==sortB && categoriesA==categoriesB && tagsA==tagsB && edgeA==edgeB && fromA==fromB && filterA==filterB && limitA==limitB;
}

export const idIndex = (out, item) => {
  // Map an item with an .id property to a dictionary with the id as key
  out[item.id] = item;
  return out;
}
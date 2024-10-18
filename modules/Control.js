import React, {useState, useRef, useEffect} from 'react';

export function Panel(props) {
  const [open, setOpen] = useState(props.closed ? false : true);

  return (
    <div className={"panel panel-" + props.type}>
      <h3>{props.title}</h3>
      <button
        className={"nobutton close-button " + (open? 'icon-circle-up' : 'icon-circle-down')}
        onClick={() => {setOpen(!open);}}
        style={{scale: "90%"}}
      >
        <span className="sr-only">Close</span>
      </button>
      {open ? (
        <>
          <hr />
          <div className="panel-content">{props.children}</div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export function dropdownFormat(arr) {
  return arr.map((item) => {
    if('_id' in item) {
      item['id'] = item['_id'];
      delete item['_id'];
    }
    if('memes' in item) {
      item['count'] = item['memes'];
      if(item['count'] == 0) item['hidden'] = true;
      delete item['memes'];
    }
    return item;
  });
}

export function DropDown(props) {
  let menu = [];
  for(let i in props.choices) {
    let item = props.choices[i];

    let selected = (props.value == item.id);
    let searched = false;

    let classes = ['btn'];
    if(item.hidden && !(selected || searched)) classes.push('hidden');
    else if(selected) classes.push('selected');

    classes = classes.join(' ');

    menu.push(<button onClick={() => props.setter(item.id)} key={item.id} className={classes} title={item.description}>
                {item.displayname}{item.count>=0?<>&nbsp;<i className="dim">({item.count})</i></>:''}
              </button>);
  }

  let selected = props.choices.filter((item) => item.id == props.value)[0];
  let stringrep = selected?.name[0].toUpperCase()+selected?.name.substring(1);

  return <div className="dropdown">
    <button className="dropbtn btn">{props.name}<br/><sub className="dim">{stringrep}</sub></button>
    <div className="dropdown-content">
      <div className="scroll">
        {menu}
      </div>
    </div>
  </div>
}

export function itemSearch(item, search) {
  return (
    item.name.toLowerCase().includes(search.toLowerCase())
    || item.description?.toLowerCase().includes(search.toLowerCase())
  )
}

export function MultiDropDown(props) {
  const minMaxlength = 50;
  const maxMaxlength = 1000;

  const [inclusive, setInclusive] = useState(props.inclusive);
  const [search, setSearch] = useState('');
  const [maxlength, setMaxlength] = useState(minMaxlength);

  function displayname(id) {
    if(props.displayname) return props.displayname(id);
    return id;
  }

  function select(id) {
    let newSelection;
    // Select all
    if(id === 'all') newSelection = ['all'];

    // Select none
    else if(id === 'none') newSelection = [];

    // Select custom
    else{
      if(inclusive) {
        // Inclusive mode select
        if(props.value[0] == 'all') newSelection = props.choices.map(item => item.id);
        else newSelection = props.value.map(a => a); // Clone object so that it can be changed
        // Add or remove id from selection
        const index = newSelection.indexOf(id);
        if(index > -1){
          newSelection.splice(index, 1);
        }else{
          newSelection.push(id);
        }
        // All items were selected manually
        if(newSelection.length == props.choices.length) {
          newSelection = ['all'];
        }
      }else{
        // Exclusive mode select
        if(props.value[0] == 'all') newSelection = props.choices.map(item => -item.id);
        else if(props.value.length == 0) newSelection = [];
        else newSelection = props.value.map(a => a); // Clone object so it can be changed
        // Add or remove id from selection
        const index = newSelection.indexOf(-id);
        if(index > -1) {
          newSelection.splice(index, 1);
        }else{
          newSelection.push(-id);
        }
        // All items were deselected manually
        if(newSelection.length == props.choices.length) {
          newSelection = ['all']
        }
      }
    }
    props.setter(newSelection);
    console.log('selected', newSelection);
  }

  function invertselection() {
    // Change values from a list of selected items to a list of unselected items and vice versa
    let newSelection = [];
    if(props.value.length == 0){
      // Nothing is selected
      newSelection = ['all']
    }else if(props.value[0]=='all'){
      // Everything is selected
      newSelection = []
    }
    else if(inclusive) {
      // Make a list of everything that wasn't previously excluded
      newSelection = props.choices.filter(item => props.value.indexOf(-item.id) == -1).map(item => item.id)
    }else{
      // Make a list of eveything that wasn't previously included
      newSelection = props.choices.filter(item => props.value.indexOf(item.id) == -1).map(item => -item.id);
    }
    props.setter(newSelection);
    console.log('inverted', newSelection);
  }
  
  let menu = [];
  let visiblecount = 0;
  for(let i in props.choices) {
    let item = props.choices[i];

    let classes = ['btn'];
    visiblecount++;

    if(
      (inclusive && props.value.includes(item.id) || props.value[0] == 'all')
      || (!inclusive && !props.value.includes(-item.id) && props.value[0] != 'all')
    ){
      classes.push('selected');
    }

    if(search.length > 0){
      if(itemSearch(item, search)){
        classes.push('searched');
      }else{
        classes.push('hidden');
        visiblecount--;
      }
    }else if(item.hidden){
      classes.push('hidden');
      visiblecount--;
    }else if(visiblecount >= maxlength){
      classes.push('hidden');
    }

    classes = classes.join(' ');

    menu.push(<button onClick={() => select(item.id)} key={item.id} className={classes} title={item.description||item.name}>
                {displayname(item.name)}{item.count>=0?<>&nbsp;<i className="dim">({item.count})</i></>:''}
              </button>);
  }

  if(visiblecount > 100) {
    if(maxlength > 100){
      menu.push(<button onClick={() => setMaxlength(minMaxlength)} key={-1} className='btn noselect'>Show less...</button>);
    }
    else if(visiblecount > maxlength){
      menu.push(<button onClick={() => setMaxlength(maxMaxlength)} key={-1} className='btn noselect'>Show all...</button>);
    }
  }

  let stringrep;
  if(props.value.length == 0) {
    stringrep = 'None';
  }else if(props.value[0] == 'all') {
    stringrep = 'All';
  }else{
    if(inclusive){
      // Inclusive mode
      let selected = props.choices.filter((item) => props.value.includes(item.id));

      let names = [];
      selected.some(option => {
        if(names.length == 5){
          names.push('...');
          return true;
        }
        names.push(option.name[0].toUpperCase()+option.name.substring(1));
        return false;
      });

      stringrep = names.join(', ');
    }else{
      // Exclusive mode
      if(props.choices.length - props.value.length <= 5){
        let selected = props.choices.filter(item => !props.value.includes(-item.id));

        let names = [];
        selected.forEach(option => {
          names.push(option.name[0].toUpperCase()+option.name.substring(1));
        });

        stringrep = "Only "+names.join(', ');
      }else{
        let unselected = props.choices.filter(item => props.value.includes(-item.id))

        let names = [];
        unselected.some(option => {
          if(names.length == 5){
            names.push('...');
            return true;
          }
          names.push(option.name[0].toUpperCase()+option.name.substring(1));
          return false;
        });

        stringrep = "All but "+names.join(', ');
      }
    }
  }

  return <div className="dropdown dropdown-multi">
    <button className="dropbtn btn">{props.name}<br/><sub className="dim">{stringrep}</sub></button>
    <div className="dropdown-content">
      {(props.choices.length > 10)?
        <input className="dropdown-search" type="text" onInput={(e) => setSearch(e.target.value)} placeholder="Search..."/>
      :
        <></>
      }
      <div className="scroll">
        {menu}
      </div>
      {(props.inclusivityeditor)?
        <div className="dropdown-content-toolbar">
          <button className="btn" title="Select all" onClick={() => select('all')}>
            <i className="icon-select-all"/>
            <br/>
            <sub className="dim">All</sub>
          </button>
          <button className="btn" title="Select none" onClick={() => select('none')}>
            <i className="icon-select-none"/>
            <br/>
            <sub className="dim">None</sub>
          </button>
          <button
            className={"btn"+(inclusive?' selected':'')} title="Results can have the selected properties"
            onClick={() => {setInclusive(true); invertselection()}}
          >
            <i className="icon-plus"/>
            <br/>
            <sub className="dim">Inclusive</sub>
          </button>
          <button
            className={"btn"+(inclusive?'':' selected')} title="Results must not have unselected properties"
            onClick={() => {setInclusive(false); invertselection()}}
          >
            <i className="icon-minus"/>
            <br/>
            <sub className="dim">Exclusive</sub>
          </button>
        </div>
      :
        <></>
      }
    </div>
  </div>
}

export function VideoControl(props) {
  // Simple video controller for videos in small places
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(true);
  const playPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  }
  const onEnded = () => {
    setPaused(true);
  }

  useEffect(() => {
    videoRef.current.addEventListener('ended', onEnded);
    videoRef.current.addEventListener('click', playPause);
    return () => {
      videoRef.current?.removeEventListener('ended', onEnded);
      videoRef.current?.removeEventListener('click', playPause);
    }
  }, []);

  return <div className={"video-control " + props.className || ''}>
    {(paused)?
      <button className="paused" title="Play video" onClick={playPause}><i className="icon-play"></i></button>
    :
      <></>
    }
    <video
      key={props.key} ref={videoRef} className={props.className} width={props.width} height={props.height}
      poster={props.poster} preload={props.preload} src={props.url}
    />
  </div>
}

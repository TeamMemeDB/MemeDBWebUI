import React, {useState, useRef, useEffect} from 'react';

export const Panel = (props) => {
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

export const DropDown = (props) => {
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

  let stringrep;
  if(props.value == -1) {
    stringrep = 'All';
  }
  else if(props.value == -2) {
    stringrep = 'None';
  }
  else {
    let selected = props.choices.filter((item) => item.id == props.value)[0];
    stringrep = selected?.name[0].toUpperCase()+selected?.name.substring(1);
  }

  return <div className="dropdown">
    <button className="dropbtn btn">{props.name}<br/><sub className="dim">{stringrep}</sub></button>
    <div className="dropdown-content">
      <div className="scroll">
        {menu}
      </div>
    </div>
  </div>
}

export const itemSearch = (item, search) => {
  return (
    item.name.toLowerCase().includes(search.toLowerCase())
    || item.description?.toLowerCase().includes(search.toLowerCase())
  )
}

export const MultiDropDown = (props) => {
  const minMaxlength = 50;
  const maxMaxlength = 1000;

  const [inclusive, setInclusive] = useState(props.inclusive);
  const [search, setSearch] = useState('');
  const [maxlength, setMaxlength] = useState(minMaxlength);

  const displayname = (id) => {
    if(props.displayname) return props.displayname(id);
    return id;
  }
  
  const find = (tids) => {
    if(tids[0] == -1) return props.choices;
    return props.choices.filter((item) => tids.indexOf(item.id) >= 0);
  }

  const select = (id) => {
    let newSelection;
    if(id === -1) newSelection = [-1];
    else if(id === -2) newSelection = [];
    else{
      if(props.value[0] == -1) newSelection = props.choices.map(item => item.id);
      else newSelection = props.value.map(a => a); // Clone object so that it can be changed

      const index = newSelection.indexOf(id);
      if(index > -1){
        newSelection.splice(index, 1);
      }else{
        newSelection.push(id);
      }
      if(newSelection.length == props.choices.length) {
        newSelection = [-1];
      }
    }
    props.setter(newSelection);
  }
  
  let menu = [];
  for(let i in props.choices) {
    let item = props.choices[i];

    let classes = ['btn'];

    if(props.value.indexOf(item.id) >= 0 || props.value[0] == -1){
      classes.push('selected');
    }

    if(search.length > 2){
      if(itemSearch(item, search)){
        classes.push('searched');
      }else{
        classes.push('hidden');
      }
    }else if(item.hidden){
      classes.push('hidden');
    }else if(menu.length >= maxlength){
      classes.push('hidden');
    }

    classes = classes.join(' ');

    menu.push(<button onClick={() => select(item.id)} key={item.id} className={classes} title={item.id/*item.description*/}>
                {displayname(item.name)}{item.count>=0?<>&nbsp;<i className="dim">({item.count})</i></>:''}
              </button>);
  }

  if(maxlength > 100){
    menu.push(<button onClick={() => setMaxlength(minMaxlength)} key={-1} className='btn noselect'>Show less...</button>);
  }
  else if(menu.length > maxlength){
    menu.push(<button onClick={() => setMaxlength(maxMaxlength)} key={-1} className='btn noselect'>Show all...</button>);
  }

  let stringrep;
  if(props.value.length >= 1) {
    if(props.value[0] == -1) {
      stringrep = 'All';
    }else{
      if(!inclusive){
        if(props.value.length <= 5){
          let selected = find(props.value);

          let names = [];
          selected.forEach(option => {
            names.push(option.name[0].toUpperCase()+option.name.substring(1));
          });

          stringrep = "Only "+names.join(', ');
        }else{
          let unselected = find(props.choices.filter(item => props.value.indexOf(item.id) == -1).map(item => item.id))

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
      }else{
        let selected = find(props.value);

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
      }
    }
  }
  else {
    stringrep = 'None';
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
          <button className="btn" title="Select all" onClick={() => select(-1)}>
            <i className="icon-select-all"/>
            <br/>
            <sub className="dim">All</sub>
          </button>
          <button className="btn" title="Select none" onClick={() => select(-2)}>
            <i className="icon-select-none"/>
            <br/>
            <sub className="dim">None</sub>
          </button>
          <button className={"btn"+(inclusive?' selected':'')} title="Results can have the selected properties" onClick={() => setInclusive(true)}>
            <i className="icon-plus"/>
            <br/>
            <sub className="dim">Inclusive</sub>
          </button>
          <button className={"btn"+(inclusive?'':' selected')} title="Results must not have unselected properties" onClick={() => setInclusive(false)}>
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

export const VideoControl = (props) => {
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
    <video ref={videoRef} className={props.className} width={props.width} height={props.height} poster={props.poster} preload={props.preload}>
      {props.children}
    </video>
  </div>
}

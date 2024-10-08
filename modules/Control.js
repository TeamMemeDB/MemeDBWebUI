import React, {useState} from 'react';

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
  const [selection, setSelection] = useState(props.default);

  let menu = [];
  for(let i in props.values) {
    let item = props.values[i];

    let selected = (selection == i);
    let searched = false;

    let classes = ['btn'];
    if(item.hidden && !(selected || searched)) classes.push('hidden');
    else if(selected) classes.push('selected');

    classes = classes.join(' ');

    menu.push(<button onClick={() => setSelection(i)} key={item.name} className={classes} title={item.description}>
                {item.displayname}{(item.counter!==undefined)?<>&nbsp;<i className="dim">({item.counter})</i></>:''}
              </button>);
  }

  let stringrep;
  if(selection >= 0) {
    let selected = props.values[selection];
    stringrep = selected?.name[0].toUpperCase()+selected?.name.substring(1);
  }
  else if(selection == -1) {
    stringrep = 'All';
  }
  else if(selection == -2) {
    stringrep = 'None';
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

export const MultiDropDown = (props) => {
  const minMaxlength = 50;
  const maxMaxlength = 1000;

  const [selection, setSelection] = useState(props.default);
  const [inclusive, setInclusive] = useState(props.inclusive);
  const [search, setSearch] = useState('');
  const [maxlength, setMaxlength] = useState(minMaxlength);

  const displayname = (id) => {
    if(props.displayname) return props.displayname(id);
    return id;
  }
  
  const find = (tids) => {
    if(tids[0] == -1) return props.values;
    return tids.map(i => props.values[i])
  }

  const select = (id) => {
    let newSelection;
    if(id === -1) newSelection = [-1];
    else if(id === -2) newSelection = [];
    else{
      if(selection[0] == -1) newSelection = Object.keys(props.values);
      else newSelection = selection.map((x) => x);

      const index = newSelection.indexOf(id);
      if(index > -1){
        newSelection.splice(index, 1);
      }else{
        newSelection.push(id);
      }
    }
    setSelection(newSelection);
  }
  
  let menu = [];
  for(let i in props.values) {
    let item = props.values[i];

    let classes = ['btn'];

    if(selection.indexOf(i) >= 0 || selection[0] == -1){
      classes.push('selected');
    }

    if(search.length > 2){
      if(item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase())){
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

    menu.push(<button onClick={() => select(i)} key={item.name} className={classes} title={item.description}>
                {displayname(item.name)}{(props.counter!==undefined)?<>&nbsp;<i className="dim">({props.counter(item)})</i></>:''}
              </button>);
  }

  if(maxlength > 100){
    menu.push(<button onClick={() => setMaxlength(minMaxlength)} key={-1} className='btn noselect'>Show less...</button>);
  }
  else if(menu.length > maxlength){
    menu.push(<button onClick={() => setMaxlength(maxMaxlength)} key={-1} className='btn noselect'>Show all...</button>);
  }

  let stringrep;
  if(selection.length >= 1) {
    if(selection[0] == -1 || selection.length == props.values.length) {
      stringrep = 'All';
    }else{
      if(!inclusive){
        if(selection.length <= 5){
          let selected = find(selection);

          let names = [];
          for(let i in selected){
            let selection = selected[i];
            names.push(selection.name[0].toUpperCase()+selection.name.substring(1));
          }

          stringrep = "Only "+names.join(', ');
        }else{
          let j = 0;
          let unselected = find(Object.keys(props.values).filter((i) => selection.indexOf(i) == -1))

          let names = [];
          for(let i in unselected){
            if(names.length == 5){
              names.push('...');
              break;
            }
            let selection = unselected[i];
            names.push(selection.name[0].toUpperCase()+selection.name.substring(1));
          }

          stringrep = "All but "+names.join(', ');
        }
      }else{
        let selected = find(selection);

        let names = [];
        for(let i in selected){
          if(names.length == 5){
            names.push('...');
            break;
          }

          let selection = selected[i];
          names.push(selection.name[0].toUpperCase()+selection.name.substring(1));
        }

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
      {(props.values.length > 10)?
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
          <button className={"btn"+(inclusive?' selected':'')} title="Inclusive" onClick={() => setInclusive(true)}>
            <i className="icon-plus"/>
            <br/>
            <sub className="dim">Inclusive</sub>
          </button>
          <button className={"btn"+(inclusive?'':' selected')} title="Exclusive" onClick={() => setInclusive(false)}>
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
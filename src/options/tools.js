/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2011 Jesse Lentz
 *
 * This file is part of GameWeasel.
 *
 * GameWeasel is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * GameWeasel is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GameWeasel.  If not, see <http://www.gnu.org/licenses/>.
 */

function newElement(nodeName, properties)
{
  var node = document.createElement(nodeName);
  for (var i in properties)
    node[i] = properties[i];
  return node;
}

HTMLElement.prototype.newChild = function(nodeName, properties) {
  return this.appendChild(
    newElement(nodeName, properties));
};

HTMLElement.prototype.mergeChild = function(node) {
  if (node instanceof HTMLElement)
    this.appendChild(node);
  else if (node instanceof Array)
    for (var i = 0; i < node.length; i ++)
      this.mergeChild(node[i]);
  else
    this.appendChild(document.createTextNode(node));
};

HTMLUListElement.prototype.add = function() {
  for (var i = 0; i < arguments.length; i ++)
    this.newChild('li').mergeChild(arguments[i]);
  return this;
};

HTMLTableElement.prototype.makeRow = function() {
  var row = this.insertRow(-1);
  for (var i = 0; i < arguments.length; i ++)
    row.insertCell(-1).mergeChild(arguments[i]);
  return row;
};

function table()
{
  var table = document.createElement('table');
  for (var i = 0; i < arguments.length; i ++)
    table.makeRow.apply(table, arguments[i]);
  return table;
}

String.prototype.span = function(cl) {
  return newElement('span', {
    className: cl,
    textContent: this
  });
};

function _(id, desc, opts, map)
{
  var box, type, property, obj;

  if (id.search(/\.\d+\./) == -1)
  {
    type = typeof bg.prefs[id];
  }
  else
  {
    obj = id.split('.');
    type = typeof bg.prefs[obj[0]][obj[1]][obj[2]];
  }

  if (desc == 'AREA')
  {
    type = 'area';
    desc = null;
  }

  switch (type)
  {
    case 'boolean':
    case 'object':
      box = document.createElement('input');
      box.type = 'checkbox';
      property = 'checked';
      break;
    case 'string':
      box = document.createElement('input');
      box.type = (desc == 'Password') ? 'password' : 'text';
      property = 'value';
      break;
    case 'area':
      box = document.createElement('textarea');
      property = 'value';
      break;
    case 'number':
      box = document.createElement('select');
      property = 'selectedIndex';
      for (var i = 0; i < opts.length; i ++)
        box.newChild('option', {textContent: opts[i]});
  }
  try{
	box.id = id;
  } catch (e) {
    console.log(box);
  }

  if (map)
  {
    box.selectedIndex = map.indexOf(bg.prefs[id]);
    box.onchange = function() {
      bg.setPref(id, map[box.selectedIndex]);
    };
  }
  else if (obj)
  {
    if (type == 'object')
    {
      box.checked = (bg.prefs[obj[0]][obj[1]][obj[2]].indexOf(obj[3]) != -1);
      box.onchange = function() {
        if (this.checked)
          bg.prefs[obj[0]][obj[1]][obj[2]].push(obj[3]);
        else
          bg.prefs[obj[0]][obj[1]][obj[2]].
            splice(bg.prefs[obj[0]][obj[1]][obj[2]].indexOf(obj[3]), 1);
        bg.setPref();
      };
    }
    else
    {
      box[property] = bg.prefs[obj[0]][obj[1]][obj[2]];
      box.onchange = function() {
        bg.prefs[obj[0]][obj[1]][obj[2]] = box[property];
        bg.setPref();
      };
    }
  }
  else
  {
    box[property] = bg.prefs[id];
    box.onchange = function() {
      bg.setPref(id, box[property]);
    };
  }

  if (desc)
  {
    var label = newElement('label', {
      htmlFor: id,
      textContent: desc
    });

    if (type == 'boolean' || type == 'object')
    {
      return [box, label];
    }
    else
    {
      label.textContent += ': ';
      return [label, box];
    }
  }
  return box;
}

function css(file, name, desc, author)
{
  var box = document.createElement('input'),
      label = document.createElement('label'),
      div = document.createElement('div');

  box.type = 'checkbox';
  box.id = file;
  box.checked = (bg.prefs.styles.indexOf(file) != -1);
  box.onchange = function() {
    if (this.checked)
      bg.prefs.styles.push(this.id);
    else
      bg.prefs.styles.splice(bg.prefs.styles.indexOf(this.id), 1);
  };

  label.htmlFor = file;
  label.textContent = name;

  if (author)
    label.textContent += ' - By ' + author;

  div.className = 'css_desc';
  div.innerHTML = desc;

  return [box, label, div];
}

function submenu(par, child)
{
  if (!(child instanceof HTMLUListElement))
    child = document.createElement('ul').add(child);
  child.className = 'submenu';
  return [par, child];
}

function panelReload()
{
  while (panel.hasChildNodes())
    panel.removeChild(panel.firstChild);
  prefPanels[document.getElementsByClassName('selected')[0].textContent]();
}

function button(label, action)
{
  var node = newElement('button', {textContent: label});
  node.addEventListener('click', action, true);
  node.addEventListener('click', panelReload, false);
  return node;
}

function panelLink(label, action)
{
  var node = newElement('a', {
    href: '#',
    textContent: label
  });

  node.addEventListener('click', action, true);
  node.addEventListener('click', panelReload, false);

  return (label != 'Delete' ? node : [' [', node, ']']);
}

function rm(type, n)
{
  return function() {
    bg.prefs[type].splice(n, 1);
    bg.setPref();

    if (type == 'userlists')
      chrome.contextMenus.removeAll(bg.buildContextMenu);
  };
}

function dateTable()
{
  var now = new Date(),
      labels = {topic: 'Topic Lists', message: 'Message Lists', clock: 'Clock'},
      table = document.createElement('table');

  function getPrefix(id, c)
  {
    return id.substr(0, id.lastIndexOf(c));
  }

  function setCustom()
  {
    document.getElementById(getPrefix(this.id, 'P') + 'Custom').disabled =
      (this.selectedIndex != this.lastChild.index);
  }

  function previewCustom()
  {
    var customOpt = document.getElementById(getPrefix(this.id, 'C') + 'Preset').lastChild;
    customOpt.textContent = customOpt.textContent.substr(0, 6);

    if (this.value.length > 0)
      customOpt.textContent += ' - ' + now.strftime(this.value);
  }

  for (var type in labels)
  {
    var preset = _('date.' + type + 'Preset', labels[type],
          now.formats[type].map(now.strftime, now).concat('Custom'),
          now.formats[type].map(function(val, i) {
            return i;
          }).concat(-1)),
        custom = _('date.' + type + 'Custom');

    if (preset[1].selectedIndex != preset[1].lastChild.index)
      custom.disabled = true;

    if (custom.value.length > 0)
      preset[1].lastChild.textContent += ' - ' + now.strftime(custom.value);

    preset[1].addEventListener('change', setCustom, false);
    custom.addEventListener('change', previewCustom, false);

    table.makeRow(preset[0], preset[1], [custom, ' ', newElement('a', {href: 'strftime.html', textContent: '?'})]);
  }
  return table;
}

function importSig()
{
    this.disabled = true;

    var request = new XMLHttpRequest();
    var box = this.parentNode.previousSibling.firstChild;
    request.open('GET', 'http://www.gamefaqs.com/boards/sigquote.php');
    request.onreadystatechange = function()
    {
      if (request.readyState == 4)
      {
        if (request.responseText.indexOf('>Signature and Quote</h2>') == -1)
        {
          alert('Your signature could not be imported. Check that you are logged in to GameFAQs and try again.');
          this.disabled = false;
          return;
        }

        var sig = request.responseText.match(/<textarea\b[^>]+?\bname="sig"[^>]*>([^<]*)<\/textarea>/i);
        if (!sig)
        {
          alert('Your signature could not be imported. Maybe you have one of those really old signatures that displays bold and italics on the profile page?');
          this.disabled = false;
          return;
        }

        box.value = bg.gamefox_utils.convertNewlines(bg.gamefox_utils.specialCharsDecode(sig[1]));
        box.onchange();

        alert('Your signature has been imported into GameWeasel.');
        panelReload();
      }
    };

    request.send(null);
}

function exportSig()
{
    this.disabled = true;

    var request = new XMLHttpRequest();
    request.open('GET', 'http://www.gamefaqs.com/boards/sigquote.php');
    request.onreadystatechange = function()
    {
      if (request.readyState == 4)
      {
        if (request.responseText.indexOf('>Signature and Quote</h2>') == -1)
        {
          alert('Your signature could not be exported. Check that you are logged in to GameFAQs.');
          this.disabled = false;
          return;
        }

        var action = request.responseText.match(/<form\b[^>]+?\bid="add"[^>]+?\baction="([^"]*)">/);
        if (!action)
        {
          alert('Your signature could not be exported. (no userid)');
          this.disabled = false;
          return;
        }
        action = action[1];

        var postRequest = new XMLHttpRequest();
        var sigText = this.parentNode.previousSibling.firstChild.value;
        postRequest.open('POST', 'http://www.gamefaqs.com' + action);
        postRequest.onreadystatechange = function()
        {
          if (postRequest.readyState == 4)
          {
            if (postRequest.responseText.indexOf('<p>Signature/quote updated</p>') == -1)
            {
              if (postRequest.responseText.indexOf('<p>Your signature contains') != -1)
                alert('Your signature is too long and could not be exported.');
              else
                alert('Your signature could not be exported. (unexpected response)');
            }
            else
              alert('Your signature has been exported to GameFAQs.');

            this.disabled = false;
          }
        };

        var quoteText = request.responseText.match(/<textarea\b[^>]+?\bname="quote"[^>]*>([^<]*)<\/textarea>/i)[1];
        quoteText = bg.gamefox_utils.specialCharsDecode(quoteText);
        var key = request.responseText.match(/<input\b[^>]+?\bname="key"[^>]+?\bvalue="([^"]*)"[^>]*>/i)[1];

        postRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        postRequest.send(
            'sig=' + bg.gamefox_utils.URLEncode(sigText) + '&' +
            'quote=' + bg.gamefox_utils.URLEncode(quoteText) + '&' +
            'key=' + key + '&' +
            'submit=1'
        );
      }
    };

    request.send(null);
}

HTMLElement.prototype.pos = function() {
  var ret = {x: 0, y: 0},
      obj = this;

  do
  {
    ret.x += obj.offsetLeft;
    ret.y += obj.offsetTop;
  }
  while (obj = obj.offsetParent);
  return ret;
};

function colorInit(box, par)
{
  var picker, ptr, sliderDiv, slider, hue, lightness,
      pos = box.pos();

  box.className = 'color';
  box.onclick = function(event) {
    picker.style.display = 'inline-block';
    sliderDiv.style.display = 'inline-block';
    ptr.style.display = 'inline';

    event.stopPropagation();
  };

  picker = par.newChild('div', {
    className: 'hue',
    onclick: function(event) {
      var pickerPos = this.pos();
      hue = event.pageX - pickerPos.x -6;
      lightness = 100 - (event.pageY - pickerPos.y) +13;

      update();
      event.stopPropagation();
    }});

  picker.newChild('div', {className: 'lightness'});

  ptr = picker.newChild('span', {
    textContent: 'x',
    className: 'colorPtr'
  });

  sliderDiv = par.newChild('div', {
    className: 'saturation',
    onclick: function(event) { event.stopPropagation(); }
  });

  slider = sliderDiv.newChild('input', {
    type: 'range',
    min: '0',
    max: '100',
    onchange: update
  });

  function update()
  {
    box.style.backgroundColor = 'hsl('+hue+','+slider.value+'%,'+lightness+'%)';
    box.style.color = (lightness > 70) ? '#000' : '#fff';
    box.value = '#' + box.style.backgroundColor.match(/\d+/g).map(function(base10) {
      return pad(parseInt(base10).toString(16), 2);
    }).join('').toUpperCase();
    box.onchange();

    sliderDiv.style.background = '-webkit-gradient(linear, left bottom, right bottom,'
      +'from(hsl('+hue+',0%,'+lightness+'%)),'
      +'to(hsl('+hue+',100%,'+lightness+'%)))';

    var pickerPos = picker.pos();
    ptr.style.left = hue;
    ptr.style.top = (100 - lightness);
  }

  function readRGB() // http://en.wikipedia.org/wiki/HSL_and_HSV
  {
    var rgb = /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(box.value);
    if (!rgb || rgb.length != 4)
      rgb = [null, 'cc', 'ff', 'ff'];

    var r = parseInt(rgb[1], 16) / 255,
        g = parseInt(rgb[2], 16) / 255,
        b = parseInt(rgb[3], 16) / 255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        chroma = max - min;

    lightness = (max + min)/2;
    slider.value = 50 * chroma / (lightness < .5 ? lightness : 1 - lightness);

    if (chroma == 0)
      hue = 0;
    else if (max == r)
      hue = (g - b)/chroma;
    else if (max == g)
      hue = (b - r)/chroma + 2;
    else if (max == b)
      hue = (r - g)/chroma + 4;

    lightness *= 100;
    hue *= 60;

    if (hue < 0)
      hue += 360;

    update();
  }

  box.addEventListener('change', readRGB, false);
  readRGB();

  function blur()
  {
    picker.style.display = 'none';
    sliderDiv.style.display = 'none';
    ptr.style.display = 'none';
  }

  document.body.addEventListener('click', blur, false);
  blur();
}

function importPrefs()
{
  try {
    var prefsNew = JSON.parse(this.result);
  }
  catch (e) {
    alert('Error: Invalid preference file');
    return;
  }

  if ('version' in prefsNew)
    delete prefsNew['version'];

  if ('favorites.serialized' in prefsNew)
  {
    var favObj = JSON.parse(prefsNew['favorites.serialized']);
    bg.prefs.favorites = [];

    for (var bid in favObj)
      bg.prefs.favorites.push([bid, favObj[bid].name]);
  }

  if ('signature.serialized' in prefsNew)
    bg.prefs.sigs = JSON.parse(prefsNew['signature.serialized']);

  if ('userlist.serialized' in prefsNew)
  {
    bg.prefs.userlists = JSON.parse(prefsNew['userlist.serialized']);

    for (var i = 0; i < bg.prefs.userlists.length; i ++)
      for (var item in bg.prefs.userlists[i])
        if ((item == 'type' || item == 'topics' || item == 'messages')
            && typeof bg.prefs.userlists[i][item] == 'string')
          bg.prefs.userlists[i][item] = function() {
            switch (bg.prefs.userlists[i][item])
            {
              case 'users':         return 0;
              case 'titleContains': return 1;
              case 'postContains':  return 2;
              case 'highlight':     return 0;
              case 'remove':        return 1;
              case 'nothing':       return (item == 'topics' ? 2 : 3);
              case 'collapse':      return 2;

              default:              return 0;
            }
          }();
  }

  for (var i in prefsNew)
    if (i in bg.prefs && typeof bg.prefs[i] == typeof prefsNew[i])
      bg.prefs[i] = prefsNew[i];

  bg.setPref();
  alert('Your preferences have been imported.');
  panelReload();
}

function exportPrefs()
{
  if (!window.WebKitBlobBuilder)
  {
    alert('Error: Preference exporting is not supported in this version of Weasel.');
    return;
  }

  var output = JSON.parse(localStorage.prefs),
      builder = new WebKitBlobBuilder();

  var favObj = {};
  output.favorites.forEach(
    function(fav) {
      favObj[fav[0]] = {name: fav[1]};
    });

  for (var i = 0; i < output.userlists.length; i ++)
  {
    output.userlists[i].type = function() {
      switch(output.userlists[i].type)
      {
        case 0: return 'users';
        case 1: return 'titleContains';
        case 2: return 'postContains';
      }
    }();
    output.userlists[i].topics = function() {
      switch(output.userlists[i].topics)
      {
        case 0: return 'highlight';
        case 1: return 'remove';
        case 2: return 'nothing';
      }
    }();
    output.userlists[i].messages = function() {
      switch(output.userlists[i].messages)
      {
        case 0: return 'highlight';
        case 1: return 'remove';
        case 2: return 'collapse';
        case 3: return 'nothing';
      }
    }();
  }

  delete output.accounts
  delete output.usercss;

  output['favorites.serialized'] = JSON.stringify(favObj);
  delete output.favorites;

  output['signature.serialized'] = JSON.stringify(output.sigs);
  delete output.sigs;

  output['userlist.serialized'] = JSON.stringify(output.userlists);
  delete output.userlists;

  builder.append(JSON.stringify(output));
  document.location.href = webkitURL.createObjectURL(builder.getBlob());
}

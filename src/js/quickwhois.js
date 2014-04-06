/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2008 Brian Marshall, Michael Ryan
 *
 * This file is part of GameFOX.
 *
 * GameFOX is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * GameFOX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GameFOX.  If not, see <http://www.gnu.org/licenses/>.
 */

/*\
 * How the quickwhois works on universal profiles:
 * 1- The boards and the contact info requests are created, but not sent.
 * 2- The boards request is sent. The regex is generic, I'll explain it later.
 *   2.1- The breq adds the info to profileFieldsHTML, but does not update the
 *        div with the data yet.
 * 3- At the end of the breq handling function, it sends the second request.
 *    This is done like this due to inherent problems with threading, if this
 *    was done any other way there's no way to ensure the boards request
 *    finishes first.
 *   3.1- It parses, adds to profileFieldsHTML and finally updates the div 
 *        with the data.
 *
 * New regexp:
 * '<td><b>' + what + '<\/b><\/td>(\\s)*<td>([^\\0]*?)<\/td>'
 *
 * The (\\s)* is only needed for the contact info, as the HTML in that page 
 * has whitespace, while the board profile does not. The rest is fairly obvious
 * except for the ([^\\0]*?), which I have no idea on what it does. >_>
\*/
var gamefox_quickwhois =
{
  quickWhois: function(event)
  {
    getSelection().removeAllRanges();

    var node = this;
    try
    {
      while (node.nodeName.toLowerCase() != 'td')
        node = node.parentNode;
    }
    catch (e) { return; }

    var div = document.evaluate('./div[@class="gamefox-quickwhois"]',
        node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // offsets are for stylesheets that put a border on <html>
    if (div)
    {
      div.style.display = div.style.display == 'none' ? '' : 'none';
      div.style.top = scrollY + event.clientY + document.body.parentNode.offsetTop + 'px';
      div.style.left = scrollX + event.clientX + document.body.parentNode.offsetLeft + 'px';
      return;
    }

    div = document.createElement('div');
    div.className = 'gamefox-quickwhois';
    div.style.top = window.pageYOffset + event.clientY + document.body.parentNode.offsetTop + 'px';
    div.style.left = window.pageXOffset + event.clientX + document.body.parentNode.offsetLeft + 'px';
    div.innerHTML = 'Loading QuickWhois...';
    node.appendChild(div);

    var profileFieldsHTML = ''; //This needs to be "global" so we can add both the contact info and the profile info
	var boardRequest = new XMLHttpRequest();
    boardRequest.open('GET', node.querySelector('a.name').href);
    boardRequest.onreadystatechange = function()
    {
      if (boardRequest.readyState == 4)
      {
        var profileFields = [
            'User ID', 'User ID',
            'Board User Level', 'User Level',
            'Account Created', 'Created At',
            'Last Visit', 'Last Visit',
            'Signature', 'Signature',
            'Karma', 'Karma'
        ];
        for (var i = 0; i < profileFields.length; i += 2)
        {
          if ((profileField = gamefox_quickwhois.findInfo(profileFields[i], boardRequest.responseText)) != '')
          {
            if (profileFields[i] == 'Board User Level')
              profileField = profileField.split(/<br\s*\/?>/i)[0].replace(/<\/?b>/gi, '');
            profileFieldsHTML += '<b>' + profileFields[i+1] + ':</b> ' +
              profileField.replace(/<br\s*\/?>/gi, '<br/>') + '<br/>';
          }
        }
		contactsRequest.send(null); // By sending this here, there's no problem with multithreading
      }
    };
	
	var contactsRequest = new XMLHttpRequest();
    contactsRequest.open('GET', node.querySelector('a.name').href.replace('/boards', ''));
    contactsRequest.onreadystatechange = function()
    {
      if (contactsRequest.readyState == 4)
      {
        var contactInformation = [
			'About Me', 'About Me',
			'Also Known As', 'Also Known As',
			'E-Mail', 'Email',
            'Web Site', 'Website',
            'AIM \\(Username\\)', 'AIM Username',
            'AIM \\(E-Mail\\)', 'AIM Email',
            'Yahoo IM', 'Yahoo IM',
            'Windows Live \\(MSN\\)', 'MSN',
            'Google Talk', 'Google Talk',
            'ICQ', 'ICQ',
            'Xbox Live', 'Xbox Live',
            'PlayStation Network', 'PlayStation Network',
            'DS Friend Code', 'DS Friend Code',
            'Wii Number', 'Wii Number',
            'Wii Friend Code', 'Wii Friend Code',
            'Skype', 'Skype',
            'Steam', 'Steam',
            'xfire', 'Xfire',
            'Twitter', 'Twitter'
		];
        for (var i = 0; i < contactInformation.length; i += 2)
        {
          if ((profileField = gamefox_quickwhois.findInfo(contactInformation[i], contactsRequest.responseText)) != '')
          {
            profileFieldsHTML += '<b>' + contactInformation[i+1] + ':</b> ' +
              profileField.replace(/<br\s*\/?>/gi, '<br/>') + '<br/>';
          }
        }
		
        div.innerHTML = profileFieldsHTML.replace(/<br\/>$/, '');
      }
    };
	boardRequest.send(null);
  },

  findInfo: function(what, where)
  {
    var pattern = new RegExp('<td><b>' + what + '<\/b><\/td>(\\s)*<td>([^\\0]*?)<\/td>', 'gi');
    var matches = pattern.exec(where);

    if (matches){
      return matches[2].trim();
	}

    return '';
  }
};
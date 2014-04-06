/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2008, 2009, 2010 Brian Marshall, Andrianto Effendy, Michael Ryan
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

var gamefox_quote =
{
  quote: function(event)
  {
    if (event)
      event.preventDefault();

    var quickpost = document.querySelector('textarea[name="messagetext"]');
    var msgComponents = gamefox_utils.getMsgComponents(this);

    if (!quickpost || !msgComponents)
      return;

    var quoteMsg = msgComponents.body.innerHTML;
    var postUser, postDate, postNum;

    // postUser
    postUser = msgComponents.header.querySelector('a.name');
    postUser = postUser ? postUser.textContent : '???';

    // postDate
    postDate = msgComponents.header.getAttribute('gfdate');

    // postNum
    postNum = msgComponents.header.id.substr(1);

    // selection quoting
    var selection = document.getSelection();
    // only use the selection if it's inside the clicked message and this
    // function is not triggered by a double-click
    if (this.nodeName == 'A' && /\S/.test(selection.toString()) &&
        selection.containsNode(msgComponents.body, true))
    {
      quoteMsg = gamefox_utils.convertNewlines(gamefox_utils.specialCharsEncode(selection.toString()));
    }

    // Remove "gamefox-no-quote" elements, replace with their alt text
    var noquote = msgComponents.body.getElementsByClassName('gamefox-no-quote');
    for (var i = 0; i < noquote.length; i ++)
      quoteMsg = quoteMsg.replace(noquote[i].outerHTML, noquote[i].getAttribute('alt') || '');

    gamefox_quote.format(this, quickpost, quoteMsg, postUser, postDate, postNum);
  },

  format: function(target, quickpost, quoteMsg, postUser, postDate, postNum)
  {
    /* Parse message body */
	
	/* Original author: Corrupt_Power 
	 * Intention: Fix spoiler tags removed from post when quoting the message
	 * Original comment: "this while block added by Corrupt_Power to fix quoting breaking spoiler tags"
	 */
	 // TODO: Check how GameFOX fixed this and decide which code is better
    var body = quoteMsg.replace(/<br\s*\/?>/gi, '\n').replace(/<img\b[^<>]+\bsrc="([^"]*)"[^<>]*>/gi, '$1');

    var spoilerStart = '<span class="fspoiler">';
    var spoilerEnd = '</span>';
    while (body.indexOf(spoilerStart) != -1)
    {
      var startIndex = body.indexOf(spoilerStart);
      var endIndex = body.indexOf(spoilerEnd, startIndex) + spoilerEnd.length;
	  var fullSpoiler = body.substring(startIndex, endIndex);
	  var textStartIndex = startIndex + spoilerStart.length;
	  var textEndIndex = endIndex - spoilerEnd.length;
	  var text = body.substring(textStartIndex, textEndIndex);
	  body = body.replace(fullSpoiler, '<spoiler>' + text + '</spoiler>');
    }

    body = body.replace(/<\/?(img|a|font|span|div|table|tbody|th|tr|td|wbr|u|embed)\b[^<>]*\/?>/gi, '').trim();
	/*
	 * END OF Corrupt_Power'S PATCH
	 */

    // Get rid of signature
    if (prefs['quote.removesignature'])
      body = body.replace(/(^|\n) *--- *(\n.*){0,2}$/, '');

    // Break escaped tags
    body = gamefox_utils.breakTags(body);

    bodyDOM = document.createElement('td');
    bodyDOM.innerHTML = body;

    // Remove nested quotes
    var quotes = document.evaluate('i/p', bodyDOM, null, XPathResult.
        ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0; i < quotes.snapshotLength; i++)
    {
      if (quotes.snapshotLength == 1 && quotes.snapshotItem(i).parentNode
          .previousSibling == null)
        bodyDOM.removeChild(quotes.snapshotItem(i).parentNode);
      else
      {
         bodyDOM.insertBefore(document.createTextNode('\n'),
             quotes.snapshotItem(i).parentNode.nextSibling);
         quotes.snapshotItem(i).parentNode.replaceChild(
             document.createTextNode('[quoted text]'), quotes.snapshotItem(i));
      }
    }

    // Remove p tags which break GFCode
    var p = document.evaluate('p', bodyDOM, null, XPathResult.
        ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0; i < p.snapshotLength; i++)
    {
      bodyDOM.insertBefore(document.createTextNode('\n' + p.snapshotItem(i).textContent),
          p.snapshotItem(i));
      bodyDOM.removeChild(p.snapshotItem(i));
    }

    body = gamefox_utils.specialCharsDecode(bodyDOM.innerHTML.trim());

    /* Prepare quote header */
    var qhead = '';
    if (prefs['quote.header.username'])
      qhead += 'From: ' + postUser;
    if (prefs['quote.header.date'])
      qhead += (qhead.length ? ' | ' : '') + 'Posted: ' + postDate;
    if (prefs['quote.header.messagenum'])
      qhead += (qhead.length ? ' | ' : '') + '#' + postNum;

    if (qhead.length && prefs['quote.style'] == 1)
    {
      if (prefs['quote.header.italic']) qhead = '<i>' + qhead + '</i>';
      if (prefs['quote.header.bold']) qhead = '<b>' + qhead + '</b>';
      qhead += '\n';
    }

    // If the header is already in the message, don't repeat it
    // Useful for quoting multiple selections
    if (quickpost.value.indexOf(qhead) != -1)
      qhead = '';

    var qbody, quote;
    switch (prefs['quote.style'])
    {
      case 1:
        qbody = body;
        if (prefs['quote.message.italic']) qbody = '<i>' + qbody + '</i>';
        if (prefs['quote.message.bold']) qbody = '<b>' + qbody + '</b>';

        quote = qhead + qbody + '\n';
        break;

      default: // gfcode
        if (qhead.length)
          qhead = '<cite>' + qhead + '</cite>\n';

        quote = qhead + '<quote>' + body + '</quote>';
        break;
    }

    // try to insert at the cursor position, but only if the cursor isn't in
    // a stupid place like after the signature separator
    var sigStart = quickpost.value.search(/---(\n.*){0,2}$/);

    if (sigStart != -1 && quickpost.selectionStart > sigStart) // insert at beginning
    {
      quickpost.value = quote + '\n' + quickpost.value;
      var endPosition = quote.length + 1;
    }
    else // insert at cursor
    {
      var endPosition = quickpost.selectionStart + quote.length + 1;
      quickpost.value = quickpost.value.substr(0, quickpost.selectionStart)
        + quote + '\n' + quickpost.value.substr(quickpost.selectionEnd);
    }

    // update the character count
    gamefox_messages.updateMessageCount();

    if (prefs['quote.focusQuickPost'])
      quickpost.focus();
    else
      target.blur();
    // Move the caret to the end of the last quote
    quickpost.setSelectionRange(endPosition, endPosition);
  }
};

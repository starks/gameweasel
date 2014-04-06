/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2008, 2009, 2010 Brian Marshall, Michael Ryan, Andrianto Effendy
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

var gamefox_quickpost =
{
  drag: { startX: 0, startY: 0, offsetX: 0, offsetY: 0, dragging: false },

  appendForm: function(div, newTopic)
  {
    var charCounts = gamefox_lib.getPref('elements.charcounts');
    var accesskeyPrefix = 'alt-';

    var form = document.createElement('form');
    form.id = 'gamefox-quickpost-form';
    var boardId = gamefox_utils.getBoardId(document.location.pathname);
    var topicId = gamefox_utils.getTopicId(document.location.pathname);
    // TODO: preview button for new topics broken if user just deleted a topic
    form.action = '/boards/post.php?board=' + boardId
        + (topicId != 0 ? '&topic=' + topicId : '');
    form.method = 'post';
    form.addEventListener('submit', gamefox_quickpost.removeGFCodeWhitespaceListener,
        false);
    form.addEventListener('submit', gamefox_quickpost.cleanSig, false);
    div.appendChild(form);

    // Key
    var key = document.createElement('input');
    key.type = 'hidden';
    key.name = 'key';
    key.value = localStorage['postkey:'+accountName];
    form.appendChild(key);

    if (newTopic)
    {
      var topictitle = document.createElement('input');
      topictitle.id = 'gamefox-topic';
      topictitle.type = 'text';
      topictitle.name = 'topictitle';
      topictitle.size = 60;
      topictitle.maxlength = 80;
      topictitle.tabIndex = 1;
      form.appendChild(topictitle);
      topictitle.focus();

      if (charCounts)
      {
        var titlecount = document.createElement('span');
        titlecount.id = 'gamefox-title-count';
        topictitle.addEventListener('input', gamefox_messages.delayedUpdateTitleCount,
            false);
        form.appendChild(titlecount);
        gamefox_messages.updateTitleCount();
      }

      form.appendChild(document.createElement('br'));
    }

    // HTML buttons
    if (gamefox_quickpost.createHTMLButtonsPref())
    {
      form.appendChild(gamefox_quickpost.createHTMLButtons());
      form.appendChild(document.createElement('br'));
    }

    // Message
    var message = document.createElement('textarea');
    message.id = 'gamefox-message';
    message.name = 'messagetext';
    message.wrap = 'virtual';
    message.rows = 16;
    message.cols = 60;
    message.tabIndex = 2;
    form.appendChild(message);
    form.appendChild(document.createElement('br'));

    // Signature
    if (prefs['signature.applyeverywhere'])
      form.appendChild(gamefox_quickpost.createSigBox());
	
	if (gamefox_lib.getPref('elements.quickpost.postwithoutpreviewbutton'))
    {
      var postWithoutPreviewbutton = document.createElement('input');
      postWithoutPreviewbutton.type = 'submit';
      postWithoutPreviewbutton.name = 'post';
      postWithoutPreviewbutton.value = 'Post without Preview';
      postWithoutPreviewbutton.title = 'Post without Preview [' + accesskeyPrefix + 'n]';
      postWithoutPreviewbutton.accessKey = 'n';
      postWithoutPreviewbutton.tabIndex = 3;
      postWithoutPreviewbutton.className = "btn btn_primary";
      form.appendChild(postWithoutPreviewbutton);
    }
	
	if (gamefox_lib.getPref('elements.quickpost.button'))
    {
      var postbutton = document.createElement('input');
      postbutton.id = 'gamefox-quickpost-btn';
      postbutton.type = 'button';
      postbutton.name = 'quickpost';
      postbutton.value = 'Post Message';
      postbutton.title = 'Post Message [' + accesskeyPrefix + 'z]';
      postbutton.accessKey = 'z';
      postbutton.tabIndex = 3;
      postbutton.className = "btn btn_primary";
      postbutton.addEventListener('click', gamefox_quickpost.post, false);
	  form.appendChild(document.createTextNode(' '));
      form.appendChild(postbutton);
    }

    if (gamefox_lib.getPref('elements.quickpost.otherbuttons'))
    {
      var previewbutton = document.createElement('input');
      previewbutton.type = 'submit';
      previewbutton.name = 'post';
      previewbutton.value = 'Preview Message';
      previewbutton.title = 'Preview Message [' + accesskeyPrefix + 'x]';
      previewbutton.accessKey = 'x';
      previewbutton.tabIndex = 3;
      previewbutton.className = "btn";
      form.appendChild(document.createTextNode(' '));
      form.appendChild(previewbutton);

      var spellchkbutton = document.createElement('input');
      spellchkbutton.type = 'submit';
      spellchkbutton.name = 'post';
      spellchkbutton.value = 'Preview and Spellcheck Message';
      spellchkbutton.title = 'Preview and Spellcheck Message [' + accesskeyPrefix + 'c]';
      spellchkbutton.accessKey = 'c';
      spellchkbutton.tabIndex = 3;
      spellchkbutton.className = "btn";
      form.appendChild(document.createTextNode(' '));
      form.appendChild(spellchkbutton);

      var resetbutton = document.createElement('input');
      resetbutton.type = 'reset';
      resetbutton.value = 'Reset';
      resetbutton.title = 'Reset [' + accesskeyPrefix + 'v]';
      resetbutton.accessKey = 'v';
      resetbutton.addEventListener('click', gamefox_quickpost.resetPost, false);
      resetbutton.tabIndex = 3;
      resetbutton.className = "btn";
      form.appendChild(document.createTextNode(' '));
      form.appendChild(resetbutton);
    }

    if (newTopic)
    {
      var hidebutton = document.createElement('input');
      hidebutton.id = 'gamefox-quickpost-hide';
      hidebutton.type = 'button';
      hidebutton.value = 'Hide';
      hidebutton.tabIndex = 3;
      hidebutton.addEventListener('click', gamefox_quickpost.toggleVisibility, false);
      form.appendChild(document.createTextNode(' '));
      form.appendChild(hidebutton);
    }

    if (charCounts)
    {
      var messagecount = document.createElement('span');
      messagecount.id = 'gamefox-message-count';
      message.addEventListener('input', gamefox_messages.delayedUpdateMessageCount,
          false);
      form.appendChild(messagecount);
      gamefox_messages.updateMessageCount();
    }

    if (prefs['elements.clock'])
      gamefox_page.addClock(form);

    // Dragging for floating QuickPost
    if (newTopic)
    {
      // Set these manually here instead of in CSS for the drag script
      div.style.left = (innerWidth - div.clientWidth) / 2 + 'px';
      div.style.top = innerHeight / 1.7 - div.clientHeight / 2 + 'px';

      // Make the box draggable
      document.addEventListener('mousedown', gamefox_quickpost.onMouseDown, false);
      document.addEventListener('mouseup', gamefox_quickpost.onMouseUp, false);
    }
  },

  onMouseDown: function(event)
  {
    if (!event.target)
      return false;

    var node = event.target;

    if (node.nodeName == 'INPUT'
        || node.nodeName == 'TEXTAREA' // allow text selection in inputs
        || node.nodeName == 'A'
        || node.nodeName == 'TD'
        || node.id && node.id == 'gamefox-character-map')
      return false;

    // get the right element
    while (node.id != 'gamefox-quickpost-afloat')
    {
      node = node.parentNode;
      if (!node)
        return false;
    }

    var drag = gamefox_quickpost.drag;
    if (event.button == 0 // left click
        && node.id == 'gamefox-quickpost-afloat')
    {
      // grab the mouse position
      drag.startX = event.clientX;
      drag.startY = event.clientY;

      // grab the clicked element's position
      drag.offsetX = parseInt(node.style.left);
      drag.offsetY = parseInt(node.style.top);

      drag.dragging = true;

      // prevent selection
      document.body.style.WebkitUserSelect = 'none'; 
      node.style.WebkitUserSelect = 'none';

      document.body.focus();

      // start moving
      document.addEventListener('mousemove', gamefox_quickpost.onMouseMove, false);

      // this is also supposed to prevent selection but it doesn't work for me
      return false;
    }
  },

  onMouseMove: function(event)
  {
    var element = document.getElementById('gamefox-quickpost-afloat');
    var drag = gamefox_quickpost.drag;

    element.style.left = (drag.offsetX + event.clientX - drag.startX) + 'px';
    element.style.top = (drag.offsetY + event.clientY - drag.startY) + 'px';
  },

  onMouseUp: function(event)
  {
    // stop dragging
    var drag = gamefox_quickpost.drag;
    var element = document.getElementById('gamefox-quickpost-afloat');
    if (drag.dragging)
    {
      // Clean up
      document.removeEventListener('mousemove', gamefox_quickpost.onMouseMove, false);
      document.body.style.WebkitUserSelect = 'text';
      element.style.WebkitUserSelect = 'text';
      drag.dragging = false;

      // Restore position if it's outside the window
      var left = parseInt(element.style.left);
      if (left + element.offsetWidth < 50)
        element.style.left = (50 - element.offsetWidth) + 'px';
      else if (left > innerWidth - 50)
        element.style.left = (innerWidth - 50) + 'px';

      var top = parseInt(element.style.top);
      if (top + element.offsetHeight < 50)
        element.style.top = (50 - element.offsetHeight) + 'px';
      else if (top > innerHeight - 50)
        element.style.top = (innerHeight - 50) + 'px';
    }
  },

  toggleVisibility: function(event)
  {
    event.preventDefault();

    var qpDiv = document.getElementById('gamefox-quickpost-afloat');
    if (qpDiv)
    {
      qpDiv.style.display = qpDiv.style.display == 'none' ? '' : 'none';
      return;
    }

    qpDiv = document.createElement('div');
    qpDiv.id = 'gamefox-quickpost-afloat';

    document.querySelector('#content .board_wrap').appendChild(qpDiv);
    gamefox_quickpost.appendForm(qpDiv, true);
  },

  post: function(event)
  {
    event.target.disabled = true;
    event.target.blur();
	
	var queryObj = gamefox_utils.parseQueryString(document.location.search);
	var strbundle = document.getElementById('overlay-strings');

	// post.php still uses the traditional query parameters
	var boardId = queryObj['board'] || gamefox_utils.getBoardId(document.location.pathname);
	var topicId = queryObj['topic'] || gamefox_utils.getTopicId(document.location.pathname);

	var topicTitle = document.getElementsByName('topictitle')[0];
	var postMessageUrl = document.querySelector('form[action*="/boards/post.php"]').action; // This needs to be *= due to how edit works
	var message = gamefox_quickpost.removeGFCodeWhitespace(document.getElementsByName('messagetext')[0].value);
	var sig = document.getElementsByName('custom_sig');
	var key = document.getElementsByName('key')[0];

	var previewRequest = new XMLHttpRequest();
	previewRequest.open('POST', postMessageUrl);

	previewRequest.onreadystatechange = function()
	{
	  if (previewRequest.readyState == 4)
	  {
		var text = previewRequest.responseText;
		var postId = text.match(/<input\b[^>]+?\bname="post_id"[^>]+?\bvalue="([^"]*)"/);
		var responseKey = text.match(/<input\b[^>]+?\bname="key"[^>]+?\bvalue="([^"]+)"/);
    console.log(text);
    console.log(text.match(/<input\b[^>]+?\bname="post_id"[^>]+?\bvalue="([^"]*)"/));
    console.log(text.match(/<input\b[^>]+?\bname="key"[^>]+?\bvalue="([^"]+)"/));

		if (!postId)
		{ // error
		  if (!/\S/.test(text))
			alert('Request timed out. Check your network connection and try again.');
		  else
		  {
			var badWord = text.match(/<p>Banned word found: <b>([^<]+)<\/b>/i);
			var tooBig = text.match(/4096 characters\. Your message is ([0-9]+) characters/);
			var titleLength = text.indexOf('Topic titles must be between 5 and 80 characters') != -1;
			var allCapsTitle = text.indexOf('Topic titles cannot be in all uppercase') != -1;
			var allCapsMessage = text.indexOf('Messages cannot be in all uppercase') != -1;
			var noTopics = text.indexOf('You are not authorized to create topics on this board') != -1;
			var noMessages = text.indexOf('You are not authorized to post messages on this board') != -1;
			var longWordInTitle = text.indexOf('Your topic title contains a single word over 25 characters') != -1;
			var longWordInMessage = text.indexOf('Your message contains a single word over 80 characters') != -1;
			var blankMessage = text.indexOf('Your post was blank') != -1;
			var badHTML = text.indexOf('Your HTML is not well-formed') != -1;
			var nonASCIITitle = text.indexOf('Topic titles cannot contain non-ASCII characters') != -1;
			var closedTopic = text.indexOf('This topic is closed') != -1;
			var deletedTopic = text.indexOf('This topic is no longer available') != -1;
			var maintenance = previewRequest.status == 503;

			if (badWord)
			  alert('GameFAQs has found a banned word in your post:\n' + badWord[1]);
			else if (tooBig)
			  alert('Your post is too big! A message can only contain 4096 characters, ' +
				  'but yours has ' + tooBig[1] + '.');
			else if (titleLength)
			  alert('Your topic title must be between 5 and 80 characters in length.');
			else if (allCapsTitle)
			  alert('Turn off your caps lock and try typing your topic title again.');
			else if (allCapsMessage)
			  alert('Turn off your caps lock and try typing your message again.');
			else if (noTopics)
			  alert('You are not allowed to post topics here.');
			else if (noMessages)
			  alert('You are not allowed to post messages here.');
			else if (longWordInTitle)
			  alert('Your topic title contains a word over 25 characters in length. ' +
				  'This makes CJayC unhappy because it stretches his 640x480 resolution ' +
				  'screen, so he doesn\'t allow it.');
			else if (longWordInMessage)
			  alert('Your message contains a word over 80 characters in length. ' +
				  'This makes CJayC unhappy because it stretches his 640x480 resolution ' +
				  'screen, so he doesn\'t allow it.');
			else if (blankMessage)
			  alert('Maybe you should actually type something...');
			else if (badHTML)
			  alert('Your HTML is not well-formed. Check for mismatched tags.');
			else if (nonASCIITitle)
			  alert('Topic titles cannot contain non-ASCII characters.');
			else if (closedTopic)
			  alert('The topic was closed while you were typing your message. ' +
				  'Type faster next time!');
			else if (deletedTopic)
			  alert('The topic is gone! Damn moderators...');
			else if (maintenance)
			  alert('The site is temporarily down for maintenance.');
			else if (!key || !responseKey)
			  alert('An error has occurred: cannot find key');
			else if (key.value != responseKey[1])
			{
			  localStorage['postkey:'+accountName] = responseKey[1];
			  key.value = responseKey[1];

			  alert('An error has occurred: '
				  + (!key.value ? 'missing key' : 'key mismatch') + '\n\n'
				  + 'Retrying may fix this issue.');
			}
			else
			  alert('Whoops! Something unexpected happened while previewing the message. ' +
				  'This probably means that your message was not posted ' +
				  '(but it\'s possible it was). Please visit the Blood ' +
				  'Money board if you continue to get this error.');
		  }
		  event.target.removeAttribute('disabled');
		  return;
		}
		else
		{
		  if (text.indexOf('<div class="head"><h2 class="title">Post Warning</h2></div>') != -1)
		  {
			var warning = text.match(/message:<\/b><\/p>(.*)You may go ahead/);
			warning = warning ? warning[1].replace(/<P>/g, '\n\n').trim() :
			  'Your post contains a word that may be bad.';
			if (!confirm(warning + '\n\nSubmit this post?'))
			{
			  event.target.removeAttribute('disabled');
			  return;
			}
		  }

		  var postRequest = new XMLHttpRequest();
		  postRequest.open('POST', postMessageUrl);
		  postRequest.onreadystatechange = function()
		  {
			if (postRequest.readyState == 4)
			{
			  var text = postRequest.responseText;
        console.log(text.indexOf('summary="Message listing"'));

			  if (text.indexOf('<div class="head"><h2 class="title">Message Posted</h2></div>') == -1
				  && text.indexOf('summary="Message listing"') == -1 // this is for users set to return to the topic after posting, and uses the new HTML5 stuff
				  && text.indexOf('No messages are available on this board') == -1)
			  { // error
				if (!/\S/.test(text))
				  alert('Request timed out. Check your network connection and try again.');
				else
				{
				  var flooding = text.indexOf('Please wait and try your post again') != -1;
				  var closedTopic = text.indexOf('This topic is closed') != -1;
				  var deletedTopic = text.indexOf('This topic is no longer available') != -1;
				  var dupeTitle = text.indexOf('A topic with this title already exists') != -1;

				  if (flooding)
					alert('You have hit one of the time-based posting limits (e.g., 2 posts per minute).');
				  else if (closedTopic)
					alert('The topic was closed while you were typing your message. Type faster next time!');
				  else if (deletedTopic)
					alert('The topic is gone! Damn moderators...');
				  else if (dupeTitle)
					alert('A topic with this title already exists. Choose another title.');
				  else
				  {
					alert('Whoops! Something unexpected ' +
						'happened while posting the message. This probably means that your message ' +
						'was not posted (but it\'s possible it was). Please ' +
						'visit the Blood Money board if you continue to get ' +
						'this error.');
				  }
				}
				event.target.removeAttribute('disabled');
				return;
			  }

			  event.target.removeAttribute('disabled');
			  if (topicTitle) // new topic
			  {
				var topicLink = text.match(/\/boards\/[^\/]+\/(\d+)/);
				localStorage[topicLink[1]] = 1;

				switch (gamefox_lib.getPref('elements.quickpost.aftertopic'))
				{
				  case 0: // go to topic
					document.location = gamefox_utils.newURI(boardId, topicLink[1],
						null, null, null, topicLink[0]);
					break;

				  case 1: // go to board
					document.location = gamefox_utils.newURI(boardId, null, null,
						null, null, topicLink[0]);
					break;
				}
			  }
			  else // new message
			  {
				if (localStorage[topicId])
				  localStorage[topicId] = parseInt(localStorage[topicId]) + 1;

				switch (gamefox_lib.getPref('elements.quickpost.aftermessage'))
				{
				  case 0: // go to last page/post
					var msgsPerPage = gamefox_lib.getPref('msgsPerPage');
					var params = {};

					if (document.gamefox.pages * msgsPerPage == document.gamefox.msgnum)
					  params['page'] = document.gamefox.pages; // next page
					else if (document.gamefox.pages > 1)
					  params['page'] = document.gamefox.pages - 1; // last page
					// else first page

					if (params['page'])
					  params['tc'] = document.gamefox.tc;

					if (document.gamefox.msgnum > (document.gamefox.pages - 1) * msgsPerPage &&
						document.gamefox.pages * msgsPerPage != document.gamefox.msgnum)
					{ // on last page
					  params['post'] = (document.gamefox.msgnum + 1).toString();
					}
					else
					  params['post'] = 'last';

					document.location = gamefox_utils.newURI(boardId, topicId,
						params['page'], params['tc'], params['post'],
						document.location.pathname);

					if ((queryObj['page'] == (document.gamefox.pages - 1) || document.gamefox.pages == 1)
						&& document.location.hash.length)
					  document.location.reload(); // hash changes don't reload the page
					break;

				  case 1: // go back to same page
					document.location = gamefox_utils.newURI(boardId, topicId,
						queryObj['page'], queryObj['page'] ? document.gamefox.tc :
						null, null, document.location.pathname);
					break;

				  case 2: // go to first page
					document.location = gamefox_utils.newURI(boardId, topicId,
						null, null, null, document.location.pathname);
					break;

				  case 3: // go to board
					document.location = gamefox_utils.newURI(boardId, null, null,
						null, null, document.location.pathname);
					break;
				}
			  }
			}
		  };

		  postRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		  postRequest.send(
			  'post_id=' + postId[1] +
			  '&key=' + key.value +
			  '&uid=' + text.match(/<input\b[^>]+?\bname="uid"[^>]+?\bvalue="([^"]*)"/)[1] +
			  '&post=Post+Message'
			  );
		}
	  }
	};

	previewRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	previewRequest.send(
		(topicTitle ? 'topictitle=' + gamefox_utils.URLEncode(topicTitle.value) + '&' : '') +
		'messagetext=' + gamefox_utils.URLEncode(message) +
		'&custom_sig=' + (sig.length ? gamefox_utils.URLEncode(sig[0].value) : '') +
		'&key=' + key.value +
		'&post=Preview+Message'
		);
  },

  resetPost: function(event)
  {
    event.preventDefault();

    if (gamefox_lib.getPref('elements.quickpost.resetconfirm') &&
        !confirm('Are you sure? This will clear your entire post so far.'))
      return;

    document.getElementsByName('messagetext')[0].value = '';

    if (gamefox_lib.getPref('elements.quickpost.resetnewsig'))
      document.getElementsByName('custom_sig')[0].value = gamefox_sig.format();

    if (prefs['elements.charcounts'])
      gamefox_messages.updateMessageCount();
    if (document.getElementById('gamefox-topic'))
    {
      document.getElementById('gamefox-topic').value = '';
      if (prefs['elements.charcounts'])
        gamefox_messages.updateTitleCount();
    }
  },

  formatTag: function(tag, end)
  {
    tag = tag.split(',');
    var str = '';

    if (!end)
    {
      for (var i = 0; i < tag.length; i++)
      {
        str += '<' + tag[i] + '>';
      }
    }
    else
    {
      for (var i = (tag.length - 1); i >= 0; i--)
        str += '</' + tag[i] + '>';
    }

    return str;
  },

  insertTag: function(event)
  {
    event.preventDefault();

    var quickpost = document.getElementsByName('messagetext')[0];
    var scrollTop = quickpost.scrollTop;
    var tagStrStart = gamefox_quickpost.formatTag(this.name, false);
    var tagStrEnd = gamefox_quickpost.formatTag(this.name, true);

    if (quickpost.selectionStart == quickpost.selectionEnd)
    {
      var endPosition = quickpost.selectionEnd + tagStrStart.length;

      quickpost.value = quickpost.value.substr(0, quickpost.selectionStart)
        + tagStrStart + (this.name != 'br' ? tagStrEnd : '')
        + quickpost.value.substr(quickpost.selectionEnd);
    }
    else if (this.name != 'br')
    {
      // encapsulate selected text
      var endPosition = quickpost.selectionEnd + tagStrStart.length +
        tagStrEnd.length;

      quickpost.value = quickpost.value.substr(0, quickpost.selectionStart)
        + tagStrStart + quickpost.value.substring(quickpost.selectionStart,
            quickpost.selectionEnd) + tagStrEnd +
        quickpost.value.substr(quickpost.selectionEnd);
    }

    quickpost.setSelectionRange(endPosition, endPosition);
    quickpost.focus();
    quickpost.scrollTop = scrollTop;

    if (gamefox_lib.getPref('elements.charcounts'))
      gamefox_messages.updateMessageCount();
  },

  createHTMLButtons: function()
  {
    var span = document.createElement('span');
    span.id = 'gamefox-html-buttons';

    var tags = [];
    // Standard
    if (gamefox_lib.getPref('elements.quickpost.htmlbuttons'))
      tags.push(
          'b', 'Bold', 'b',
          'i', 'Italics', 'i');
    // Extended
    if (gamefox_lib.getPref('elements.quickpost.htmlbuttons.extended'))
      tags.push(
          'em', 'Emphasis', 'E',
          'strong', 'Strong Emphasis', 's');
    // quoting
    if (gamefox_lib.getPref('elements.quickpost.htmlbuttons.gfcode'))
      tags.push(
          'qu', 'Quote', 'q',
          'cite', 'Cite', 'D');
	// spoilers and code
	if (gamefox_lib.getPref('elements.quickpost.htmlbuttons.spoilcode'))
	  tags.push(
		  'sp', 'Spoiler', 'S',
		  'code', 'Code', 'c');

    var accesskeyPrefix = 'alt-';
    var button;

    for (var i = 0; i < tags.length; i += 3)
    {
      if (i != 0)
        span.appendChild(document.createTextNode(' '));

      button = document.createElement('input');
      button.type = 'submit';
      button.value = tags[i + 1];
      button.name = tags[i];
      button.title = '<' + tags[i].replace(/,/g, '><') +
        (tags[i] == 'br' ? ' /' : '') + '> [' + accesskeyPrefix + tags[i + 2] + ']';
      button.accessKey = tags[i + 2];
      button.tabIndex = 4;
      button.addEventListener('click', gamefox_quickpost.insertTag, false);
      button.className = "btn btn_mini";

      span.appendChild(button);
    }

    // Break tags
    if (gamefox_lib.getPref('elements.quickpost.htmlbuttons.breaktags'))
    {
      if (span.hasChildNodes())
        span.appendChild(document.createTextNode(' | '));

      button = document.createElement('input');
      button.type = 'submit';
      button.value = 'Break HTML';
      button.title = 'Break HTML tags in selection [' + accesskeyPrefix + 'r]';
      button.accessKey = 'r';
      button.tabIndex = 4;
      button.className = "btn btn_mini";
      button.addEventListener('click', gamefox_quickpost.breakTagsFromButton, false);

      span.appendChild(button);
    }

    // Character map
    if (gamefox_lib.getPref('elements.charmap'))
    {
      if (span.hasChildNodes())
        span.appendChild(document.createTextNode(' | '));

      button = document.createElement('input');
      button.type = 'submit';
      button.value = 'Character Map';
      button.tabIndex = 4;
      button.className = "btn btn_mini";
      button.addEventListener('click', gamefox_quickpost.toggleCharacterMap, false);

      span.appendChild(button);
    }

    return span;
  },

  removeGFCodeWhitespace: function(str)
  {
    return gamefox_lib.getPref('quote.controlwhitespace') ?
      str.replace(/<\/p>\s*<\/(i|em)>\n{2}(?!\n)/g, '</p></$1>\n') : str;
  },

  removeGFCodeWhitespaceListener: function(event)
  {
    var message = event.target.elements.namedItem('messagetext');
    message.value = gamefox_quickpost.removeGFCodeWhitespace(message.value);
  },

  breakTags: function(msg)
  {
    var brokenStr = gamefox_utils.specialCharsDecode(gamefox_utils.breakTags(
          gamefox_utils.specialCharsEncode(msg.value.substring(msg.selectionStart,
              msg.selectionEnd))));

    var endPosition = msg.selectionStart + brokenStr.length;
    msg.value = msg.value.substr(0, msg.selectionStart)
      + brokenStr
      + msg.value.substr(msg.selectionEnd);

    msg.setSelectionRange(endPosition, endPosition);
  },

  breakTagsFromButton: function(event)
  {
    if (event)
      event.preventDefault();

    var msg = document.getElementsByName('messagetext')[0];
    if (msg.selectionStart == msg.selectionEnd)
    {
      alert('You need to select some text containing HTML first.');
      return;
    }

    gamefox_quickpost.breakTags(msg);
    msg.focus();

    if (gamefox_lib.getPref('elements.charcounts'))
      gamefox_messages.updateMessageCount();
  },

  createHTMLButtonsPref: function()
  {
    return gamefox_lib.getPref('elements.quickpost.htmlbuttons')
      || gamefox_lib.getPref('elements.charmap')
      || gamefox_lib.getPref('elements.quickpost.htmlbuttons.extended')
      || gamefox_lib.getPref('elements.quickpost.htmlbuttons.gfcode')
      || gamefox_lib.getPref('elements.quickpost.htmlbuttons.breaktags')
      || gamefox_lib.getPref('elements.quickpost.removenativebuttons');
  },

  toggleCharacterMap: function(event)
  {
    event.preventDefault();

    var map = document.getElementById('gamefox-character-map');
    if (map)
    {
      map.style.display = map.style.display == 'none' ? '' : 'none';
      map.style.top = event.target.offsetTop
        + document.body.parentNode.offsetTop - map.offsetHeight + 'px';
      map.style.left = event.target.offsetLeft + event.target.clientWidth
        + document.body.parentNode.offsetLeft + 'px';
    }
    else
    {
      map = document.createElement('div');
      map.id = 'gamefox-character-map';
      map.style.top = event.target.offsetTop
        + document.body.parentNode.offsetTop - 200 + 'px';
      map.style.left = event.target.offsetLeft + event.target.clientWidth
        + document.body.parentNode.offsetLeft + 'px';
      var table = document.createElement('table');
      map.appendChild(table);
      var tbody = document.createElement('tbody');
      table.appendChild(tbody);

      var characters = [
        ' !"#$%&\'()*+,-./',
        '0123456789:;<=>?',
        '@ABCDEFGHIJKLMNO',
        'PQRSTUVWXYZ[\\]^_',
        '`abcdefghijklmno',
        'pqrstuvwxyz{|}~ ',
        '\u20AC \u201A\u0192\u201E\u2026\u2020\u2021'
          + '\u02C6\u2030\u0160\u2039\u0152 \u017D ',
        ' \u2018\u2019\u201C\u201D\u2022\u2013\u2014'
          + '\u02DC\u2122\u0161\u203A\u0153 \u017E\u0178',
        ' \xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC \xAE\xAF',
        '\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF',
        '\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF',
        '\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF',
        '\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF',
        '\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE\xFF'
      ];

      for (var i = 0; i < characters.length; i++)
      {
        var tr = document.createElement('tr');
        for (var j = 0; j < characters[i].length; j++)
        {
          var td = document.createElement('td');
          var character = characters[i].charAt(j);
          if (character != ' ')
          {
            var a = document.createElement('a');
            a.appendChild(document.createTextNode(character));
            a.href = '#';
            a.addEventListener('click', gamefox_quickpost.addCharacter, false);
            td.appendChild(a);
          }
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }

      var button = event.target;
      button.parentNode.parentNode.insertBefore(map,
          button.parentNode.nextSibling.nextSibling);
    }
  },

  addCharacter: function(event)
  {
    event.preventDefault();

    var character = event.target.textContent;

    var msg = document.getElementsByName('messagetext')[0];
    var endPosition = msg.selectionEnd + character.length;
    msg.value = msg.value.substr(0, msg.selectionEnd)
      + character
      + msg.value.substr(msg.selectionEnd);
    msg.setSelectionRange(endPosition, endPosition);
    msg.focus();

    if (gamefox_lib.getPref('elements.charcounts'))
      gamefox_messages.updateMessageCount();
  },

  createSigBox: function(postPage)
  {
    var sigBox = document.createElement('span');
    sigBox.id = postPage ? 'gamefox-post-signature' :
      'gamefox-quickpost-signature';

    var separator = document.createElement('span');
    separator.textContent = '---';
    sigBox.appendChild(separator);

    sigBox.appendChild(document.createElement('br'));

    var sigText = document.createElement('textarea');
    sigText.name = 'custom_sig';
    sigText.rows = 2;
    sigText.cols = 100;
    sigText.value = gamefox_sig.format();
    sigText.tabIndex = 5;

    sigBox.appendChild(sigText);
    sigBox.appendChild(document.createElement('br'));

    return sigBox;
  },

  cleanSig: function()
  {
    var sig = this.elements.namedItem('custom_sig');
	if ((sig !== undefined) || (sig !== null)){
		sig.value = gamefox_sig.format(sig.value);
	}
  },
   
  getPostWithoutPreviewButton: function(){
	var buttons = document.getElementsByName("post");
	for(var i=0; i < buttons.length; i++){
	  if(buttons[i].value == 'Post without Preview'){
	    return buttons[i];
	  }
	}
	return null;
  }
};

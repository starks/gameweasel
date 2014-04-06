/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2005, 2006, 2007, 2008, 2009, 2010
 * Abdullah A, Toad King, Andrianto Effendy, Brian Marshall, Michael Ryan
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

var gamefox_page =
{
  process: function()
  {
    // Prevent page from being processed multiple times
    if (document.lastChild.nodeType == Node.COMMENT_NODE &&
        document.lastChild.nodeValue == 'gamechrome')
      return;
    document.appendChild(document.createComment('gamechrome'));

    // Block ads
    var blockAds = (prefs.styles.indexOf('gamefox-ads.css') != -1);
    if (blockAds)
    {
      var styles = document.head.getElementsByTagName('style');
      for (var i = 0; i < styles.length; i++)
        if (styles[i].className != 'gamechrome-css')
          styles[i].disabled = true;

      // Skinned home page
      document.body.className = '';

      // Poll of the Day
      var poll = document.evaluate('//div[@class="body poll"]', document, null,
          XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (poll)
      {
        if (poll.style.background.indexOf('promo') != -1)
        {
          poll.style.background = '';
          poll.removeChild(poll.firstChild);
        }

        if (poll.parentNode.getElementsByTagName('h2').length == 0)
        {
          var pollHead = document.createElement('div');
          pollHead.className = 'head';

          var pollTitle = document.createElement('h2');
          pollTitle.className = 'title';
          pollTitle.appendChild(document.createTextNode('Poll of the Day'));
          pollHead.appendChild(pollTitle);

          poll.parentNode.insertBefore(pollHead, poll);
        }
      }
    }

    // Add favorites
    if (gamefox_lib.getPref('elements.favorites'))
    {
      div = document.getElementById('mast_jump') || document.getElementById('sys');
      if (div)                     /* V12 */                          /* V11 */
      {
	    div.style.width = 'auto';

        var favMenu = document.createElement('select');
        favMenu.id = 'gamefox-favorites-menu';
        favMenu.style.width = div.getElementsByTagName('select')[0].offsetWidth + 'px';
        favMenu.addEventListener('change', function() {
          if (this.value != 0)
            document.location.href = gamefox_utils.createBoardLink(
              this.value, this.options[this.selectedIndex].textContent);
        }, false);
        div.insertBefore(favMenu, div.firstChild);

        var item = document.createElement('option');
        item.value = 0;
        item.textContent = 'Favorite Boards';
        favMenu.appendChild(item);

        prefs.favorites.forEach(
          function(fav) {
            item = document.createElement('option');
            item.value = fav[0];
            item.textContent = fav[1];
            favMenu.appendChild(item);
          });
      }
    }

    // Add clock
    if (prefs['elements.clock'])
    {
      var div, node;

      if (div = document.getElementById('loginbox'))
        if (node = document.evaluate('./div[@class="msg"]', div, null,
              XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue)
          gamefox_page.addClock(node);
    }

    // Save logged-in account name
    accountName = gamefox_utils.getAccountName();
    gamefox_lib.setPref('accounts.current', accountName);

    // Update last visit time
    gamefox_lib.setPref('lastVisit', Math.floor(Date.now() / 1000));

    // Get account key for QuickPost
    if (accountName)
    {
      var keyElem = document.querySelector('input[name="key"]');

      if (keyElem)
        localStorage['postkey:'+accountName] = keyElem.value;
      else if (!localStorage['postkey:'+accountName])
      {
        var keyreq = new XMLHttpRequest();
        keyreq.open('GET', gamefox_utils.domain + gamefox_utils.path + 'post.php?board=2');
        keyreq.onreadystatechange = function() {
          if (keyreq.readyState == 4)
          {
            var key = /<input type="hidden" name="key" value="(\w+)">/
                .exec(keyreq.responseText);

            if (key)
            {
              localStorage['postkey:'+accountName] = key[1];

              // QuickPost form may have already been created
              if (keyElem = document.querySelector('input[name="key"]'))
                keyElem.value = key[1];
            }
          }
        };
        keyreq.send();
      }
    }

    // Highlight PM inbox link
    if (prefs['pm.highlight'])
    {
      var pmLink = document.querySelector('a[href="/pm/"]');
	  
      if (pmLink && pmLink.textContent != 'Inbox') //I'm sure this can be optimized, but Donald Knuth
        pmLink.style.setProperty('color', prefs['pm.color'], 'important');
    }

    // Apply classes to PM inbox rows
    if (document.location.pathname == '/pm/' ||
        document.location.pathname == '/pm/sent')
    {
      var rows = document.getElementsByTagName('tr');
      for (var i = 1; i < rows.length; i ++)
        rows[i].className += 'gamefox-' + (rows[i].firstChild.firstChild
            .alt.toLowerCase() || 'old') + '-pm';
    }

    if (!/^\/boards(\/|$|\?)/.test(document.location.pathname))
      return;

    document.gamefox = {};

    // TODO: myposts and some other pages are now missing this
    //   Admin says board_wrap is "depreciated", so we should use something else
    var boardWrap = document.querySelector('.pod.board_wrap');

    // Apply classes to existing elements
    if (boardWrap)
    {
      var element = document.querySelector('a[href*="usernote.php"]');
      if (element)
        element.parentNode.className += ' gamefox-usernote';

      element = document.evaluate('./div[@class="body"]/p/a[contains(@href, "ignorelist")]',
          boardWrap, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (element)
        element.parentNode.className += ' gamefox-ignorelist';
    }

    /* sigquote.php */
    if (gamefox_lib.onPage('sigquote'))
    {
      var button = document.createElement('input');
      button.type = 'button';
      button.value = 'Update GameWeasel Signature';
      button.addEventListener('click', gamefox_sig.updateFromGameFAQs, false);

      var element = document.getElementById('add').getElementsByTagName('input')[1]
        .parentNode;
      element.appendChild(document.createTextNode(' '));
      element.appendChild(button);
    }

    /* Index (index.php) */
    else if (gamefox_lib.onPage('index'))
    {
      gamefox_lib.setTitle('Message Boards');

      // Get favorites
      if (gamefox_lib.getPref('favorites.enabled') && boardWrap)
      {
        var i, boardId, favorites = [], favLinks = [];
        var favResult = document.evaluate('./table[1]/tbody/tr/td[1]/a',
            boardWrap, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (i = 0; i < favResult.snapshotLength; i++)
          favLinks[i] = favResult.snapshotItem(i);

        // skip MBA
        for (i = 1; i < favLinks.length; i++)
        {
          boardId = gamefox_utils.getBoardId(favLinks[i].pathname);
          if (boardId != 0)
            favorites.push([boardId, favLinks[i].textContent]);
        }

        gamefox_lib.setPref('favorites', favorites);
      }

      // Date format board loop
      // TODO: merge this with favorites loop
      if (gamefox_lib.getPref('date.enableFormat'))
      {
        var rows = document.getElementsByTagName('tr');

        for (var i = 1; i < rows.length; i++)
          if (rows[i].cells[3])
            rows[i].cells[3].textContent = rows[i].cells[3].textContent.strtotime().userFormat('topic');
      }
    }

    /* Board Manager (bman.php) */
    else if (gamefox_lib.onPage('bman'))
    {
      var rows = document.getElementsByTagName('tr');

      for (var i = 1; i < rows.length; i++)
        if (rows[i].cells[3])
          rows[i].cells[3].textContent = rows[i].cells[3].textContent.strtotime().userFormat('topic');
    }

    /* Board List (boardlist.php) */
    else if (gamefox_lib.onPage('boardlist'))
    {
      var rows = document.getElementsByTagName('tr');

      for (var i = 1; i < rows.length; i++)
        if (rows[i].cells[3])
          rows[i].cells[3].textContent = rows[i].cells[3].textContent.strtotime().userFormat('topic');
    }

    /* Active Messages (myposts.php) */
    else if (gamefox_lib.onPage('myposts'))
    {
      var topicsTable = document.querySelector('#main_col table.board.topics');
      var rows;

      if (topicsTable)
      {
        // Topic rows
        rows = topicsTable.getElementsByTagName('tr');

        // Page jumper
        if (gamefox_lib.getPref('elements.aml.pagejumper'))
        {
          var pageJumperTop = document.querySelector('#main_col div.board_nav > div.body > div.pages');
          if (pageJumperTop)
          {
            var pageMatches = pageJumperTop.textContent.match(/Page ([0-9]+) of ([0-9]+)/);
            if (pageMatches)
            {
              var currentPage = pageMatches[1] - 1;
              var lastPage = pageMatches[2] - 1;
              var query = gamefox_utils.parseQueryString(document.location.search);
              query = '/boards/myposts.php?' +
                 (query['board'] ? 'board=' + query['board'] + '&' : '') +
                 (query['topic'] ? 'topic=' + query['topic'] + '&' : '') +
                 (query['user'] ? 'user=' + query['user'] + '&' : '') +
				 (query['lp'] ? 'lp=' + query['lp'] + '&' : '');

              var pageJumper = document.createElement('div');
              pageJumper.className = 'pod pagejumper';

              var pageUL = document.createElement('ul');
              var pageLI, pageA;
              for (var i = 0; i <= lastPage; i++)
              {
                pageLI = document.createElement('li');
                if (i == 0)
                {
                  pageLI.className = 'first';
                  pageLI.appendChild(document.createTextNode('Jump to Page: '));
                }
                if (i == currentPage)
                {
                  pageLI.appendChild(document.createTextNode(i + 1));
                }
                else
                {
                  pageA = document.createElement('a');
                  pageA.href = query + 'page=' + i;
                  pageA.appendChild(document.createTextNode(i + 1));
                  pageLI.appendChild(pageA);
                }
                pageUL.appendChild(pageLI);
              }

              pageJumper.appendChild(pageUL);
              topicsTable.parentNode.parentNode.appendChild(pageJumper);
            }
          }
        }
      }
      else
      {
        // No topics
        rows = [];
      }

      gamefox_highlighting.loadGroups();
      var skipNext = false;

      // Topic row loop
      for (var i = 1; i < rows.length; i++)
      {
        // Double click action
        if (prefs['myposts.dblclick'])
          rows[i].addEventListener('dblclick', gamefox_page.topicDblclick('myposts'), false);

        // Date format
        if (gamefox_lib.getPref('date.enableFormat'))
        {
          rows[i].cells[3].textContent = rows[i].cells[3].textContent.strtotime().userFormat('topic');
          rows[i].cells[4].textContent = rows[i].cells[4].textContent.strtotime().userFormat('topic');
        }

        var topicId = gamefox_utils.getTopicId(rows[i].cells[1]
            .getElementsByTagName('a')[0].href);

        // Highlighting
        var title = rows[i].cells[1].textContent.trim();
        var hlinfo;

        if ((hlinfo = gamefox_highlighting.searchTopic('-', topicId,
                title, '')) != false)
        {
          if (hlinfo[3] == 1) // remove topic
          {
            rows[i].style.setProperty('display', 'none', null);
            alternateColor = !alternateColor;
          }
          else if (hlinfo[3] == 0) // highlight topic
          {
            rows[i].className += ' ' + gamefox_highlighting.highlightClassName;
            rows[i].style.setProperty('background-color', hlinfo[1], 'important');
          }
        }

        // Last post link
        if (gamefox_lib.getPref('elements.topics.lastpostlink'))
          gamefox_utils.lastPostLink(rows[i].cells[1], rows[i].cells[3], rows[i].cells[2].textContent, topicId);

        // Label topics with messages after your last post
        if (gamefox_lib.getPref('elements.aml.marknewposts'))
        {
          var newPosts = (!localStorage[topicId] || parseInt(rows[i].cells[2].textContent) > parseInt(localStorage[topicId]));
          var span = document.createElement('span');
              span.className = (newPosts ? 'gamefox-new-posts' : 'gamefox-no-new-posts');
              span.style.setProperty('font-weight', 'bold', null);

          if (newPosts)
            span.appendChild(document.createTextNode('(N)'));

          rows[i].cells[1].insertBefore(span, rows[i].cells[1].firstChild);
          rows[i].cells[1].insertBefore(document.createTextNode(' '), span.nextSibling);
        }

        // Pagination
        if (gamefox_lib.getPref('paging.auto'))
        {
          var pageList = gamefox_page.formatPagination(
              document,
              rows[i].cells[1].getElementsByTagName('a')[0].href,
              Math.ceil(rows[i].cells[2].textContent), '');

          if (pageList) // multiple pages
          {
            var pageListParent;
            if (gamefox_lib.getPref('paging.location') == 0)
            {
              pageListParent = document.createElement('tr');
              pageListParent.setAttribute('class', 'gamefox-pagelist');
            }
            else
            {
              pageListParent = rows[i].cells[1];
            }

            pageListParent.appendChild(pageList);

            if (gamefox_lib.getPref('paging.location') == 0)
            {
              rows[i].parentNode.insertBefore(pageListParent, rows[i].nextSibling);
              skipNext = true;
            }
          }
        }

        // for added page rows
        if (skipNext)
        {
          ++i;
          skipNext = false;
        }
      }
    }

    /* Posting and Preview (post.php) */
    else if (gamefox_lib.onPage('post'))
    {
	  // Fixes the blank space to the right of the posting screen, since you can't use @moz-document url-prefix on chrome
	  if (blockAds){
      var sideAd = document.getElementsByClassName("span4")[0]; //storing it as not to seek for it twice in the next line
		  sideAd.parentNode.removeChild(sideAd); //just go to hell pls and save us some ram
      document.getElementsByClassName("span8")[0].style.width="100%"; //stretches the header
      document.getElementsByName("messagetext")[0].style.width="100%";//stretches the post box
	  }
	  
      var message = document.getElementsByName('messagetext')[0];
      if (!message) // "Message Posted" page
      {
        var tid = document.evaluate('//a[text()="here"]', boardWrap, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.href.split('/');
        tid = tid[tid.length - 1];
        localStorage[tid] = localStorage[tid] ? parseInt(localStorage[tid]) + 1 : 1;
        return;
      }
      var form = message.form;
      var topictitle = form.elements.namedItem('topictitle');
      var detailsDiv = message.parentNode.parentNode;
      var previewBtn = form.querySelector('input[name="post"]');

      // Titles
      if (topictitle) // new topic
      {
        gamefox_lib.setTitle(gamefox_utils.getBoardName(), 'CT');
      }
      else // new post
      {
        gamefox_lib.setTitle(detailsDiv.getElementsByTagName('a')[0]
            .textContent.trim(), 'PM');
      }

      // Signature
      if (gamefox_lib.getPref('signature.applyeverywhere')
          && !/\b(Posted)<\/h2>/.test(document.body.innerHTML)
          && !gamefox_utils.parseQueryString(document.location.search)['message'])
      {
        detailsDiv.removeChild(form.querySelector('input[name="custom_sig"]'));

        // Do this twice to remove the signature info text and the <br>
        message.parentNode.parentNode.removeChild(message.parentNode
            .nextSibling);
        message.parentNode.parentNode.removeChild(message.parentNode
            .nextSibling);

        previewBtn.parentNode.insertBefore(
            gamefox_quickpost.createSigBox(true), previewBtn);
      }

      message.setSelectionRange(0, 0);
		
      // HTML buttons
      if (gamefox_quickpost.createHTMLButtonsPref())
      {
		if(gamefox_lib.getPref('elements.quickpost.removenativebuttons')){
		  gamefaqsInputs = detailsDiv.getElementsByTagName("input");
		
		  for(i=0; i<gamefaqsInputs.length; i++){
		    if(gamefaqsInputs[i].type == "button"){
		      gamefaqsInputs[i].style.display = "none"; // You could remove the node, I guess
		    }
		  }
		}
		
        detailsDiv.insertBefore(gamefox_quickpost.createHTMLButtons(), message.parentNode);
        detailsDiv.insertBefore(document.createElement('br'), message.parentNode);
      }

      // Character count
      if (gamefox_lib.getPref('elements.charcounts'))
      {
        // title count
        if (topictitle)
        {
          var titlecount = document.createElement('span');
          titlecount.id = 'gamefox-title-count';
          topictitle.parentNode.insertBefore(titlecount,
              topictitle.nextSibling);
          topictitle.parentNode.insertBefore(document.createTextNode(' '),
              topictitle.nextSibling);

          gamefox_messages.updateTitleCount();

          topictitle.addEventListener('input',
              gamefox_messages.delayedUpdateTitleCount, false);
        }

        // message count
        var msgcount = document.createElement('span');
        msgcount.id = 'gamefox-message-count';
        detailsDiv.appendChild(document.createTextNode(' '));
        detailsDiv.appendChild(msgcount);

        gamefox_messages.updateMessageCount();

        message.addEventListener('input',
            gamefox_messages.delayedUpdateMessageCount, false);
      }

      // "Post Message" button
      if (gamefox_lib.getPref('elements.quickpost.button'))
      {
        var button = document.createElement('input');
        button.id = 'gamefox-quickpost-btn';
        button.type = 'button';
        button.value = 'Post Message';
        button.title = 'Post Message [alt-z]';
        button.accessKey = 'z';
        button.className = "btn btn_primary";
        button.addEventListener('click', gamefox_quickpost.post, false);

        previewBtn.parentNode.insertBefore(button, previewBtn);
        previewBtn.parentNode.insertBefore(document.createTextNode(' '), previewBtn);
      }

      // Access keys for standard buttons
      [ ['Preview Message', 'x'],
        ['Preview and Spellcheck Message', 'c'],
        ['Reset', 'v']
      ].forEach(function(stuff) {
        var button = document.querySelector('input[value="'+stuff[0]+'"]');
        if (button)
        {
          button.title = stuff[0]+' [alt-'+stuff[1]+']';
          button.accessKey = stuff[1];
        }
      });

      // Replace default reset action
      document.getElementsByName('reset')[0].onclick = gamefox_quickpost.resetPost;

      // GFCode whitespace control
      form.addEventListener('submit',
          gamefox_quickpost.removeGFCodeWhitespaceListener, false);

      // TTI for message preview
      if (gamefox_lib.getPref('elements.tti'))
      {
        var preview = document.getElementsByTagName('td');
        if (preview.length)
          tti.process(preview[0]);
      }
    }

    /* User Information (user.php) */
    else if (gamefox_lib.onPage('user'))
    {
      var username = document.getElementsByTagName('td')[0];
      if (username)
        gamefox_lib.setTitle(username.textContent.trim(), 'U');
    }

    /* Topic Lists */
    else if (gamefox_lib.onPage('topics'))
    {
      var userPanel = document.evaluate('//div[@class="user_panel"]', document, null,
          XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      var userNav = document.evaluate('//div[@class="board_nav"]' +
          '/div[@class="body"]/div[@class="user"]', boardWrap, null,
          XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      gamefox_highlighting.loadGroups();

      var onTracked = gamefox_lib.onPage('tracked');

      // Title
      gamefox_lib.setTitle(gamefox_utils.getBoardName(), 'T');

      // Topic "QuickPost" link
      var newTopicLink;
      if (!onTracked && gamefox_lib.getPref('elements.quickpost.link')
          && (newTopicLink = document.evaluate('//a[contains(@href, "post.php")]',
              userNav || userPanel, null,
              XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue))
      {
        var anchor = document.createElement('a');
            anchor.id = 'gamefox-quickpost-link';
            anchor.href = '#';
            anchor.appendChild(document.createTextNode(gamefox_lib.
                  getPref('elements.quickpost.link.title')));
            anchor.addEventListener('click', gamefox_quickpost.toggleVisibility, false);

        if (userPanel)
        {
          newTopicLink.parentNode.appendChild(document.createTextNode(' ('));
          newTopicLink.parentNode.appendChild(anchor);
          newTopicLink.parentNode.appendChild(document.createTextNode(')'));
        }
        else
        {
          userNav.insertBefore(anchor, newTopicLink.nextSibling);
          userNav.insertBefore(document.createTextNode(' | '), newTopicLink
              .nextSibling);
        }
      }

      var topicsTable = document.evaluate('./div[@class="body"]/table[@class="board topics"]',
          boardWrap, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      var rows;

      if (topicsTable)
      {
        // Topic rows
        rows = topicsTable.getElementsByTagName('tr');
      }
      else
      {
        // No topics
        rows = [];
      }

      var skipNext = false;
      var alternateColor = false;

      // Topic row loop
      for (var i = 1; i < rows.length; i++)
      {
        // XXX Lots of references to rows[i].cells[n], including repeated calls
        // to getElementsByTagName('a'). Would be nice to abstract the cell
        // numbers to their purpose (like cells.username or cells.lastPost or
        // something). (bm 2010-08)

        if (rows[i].cells.length == 1)
        {
          // this is an ad row
          if (blockAds)
          {
            rows[i].parentNode.removeChild(rows[i]);
            i--;
          }
          continue;
        }

        // Double click action
        if (prefs['topic.dblclick'])
          rows[i].addEventListener('dblclick', gamefox_page.topicDblclick('topic'), false);

        // Status spans

        // TODO: add a class to some element on message lists so they can be
        //   identified properly

        var tid = rows[i].cells[1].getElementsByTagName('a')[0].href;
            tid = tid.substr(tid.lastIndexOf('/') + 1);

        var statusType = rows[i].cells[0].getElementsByTagName('img')[0].src
            .match(/\/images\/default\/([^\.]+)\.gif/)[1];

        if (statusType == 'topic')
          statusType = 'gamefox-' + (!localStorage[tid] ||
            parseInt(rows[i].cells[3].textContent) > parseInt(localStorage[tid])
            ? 'new-posts' : 'no-new-posts') + ' topic';

        var statusSpan = document.createElement('span');
        statusSpan.className = statusType + '-end gamefox-status';
        rows[i].cells[1].insertBefore(statusSpan, rows[i].cells[1].firstChild.nextSibling);
        statusSpan = document.createElement('span');
        statusSpan.className = statusType + '-start gamefox-status';
        rows[i].cells[1].insertBefore(statusSpan, rows[i].cells[1].firstChild);

        // Date format
        if (gamefox_lib.getPref('date.enableFormat'))
          rows[i].cells[4].textContent = rows[i].cells[4].textContent.strtotime().userFormat('topic');

        // Last post link
        if (gamefox_lib.getPref('elements.topics.lastpostlink'))
          gamefox_utils.lastPostLink(rows[i].cells[1], rows[i].cells[4], rows[i].cells[3].textContent, tid, onTracked ? null : rows[i].cells[2].textContent);

        // Pagination
        if (gamefox_lib.getPref('paging.auto'))
        {
          var pageList = gamefox_page.formatPagination(
              document,
              rows[i].cells[1].getElementsByTagName('a')[0].href,
              Math.ceil(rows[i].cells[3].textContent),
              onTracked ? '' : rows[i].cells[2].textContent);

          if (pageList) // multiple pages
          {
            var pageListParent;
            if (gamefox_lib.getPref('paging.location') == 0)
            {
              pageListParent = document.createElement('tr');
              pageListParent.setAttribute('class', 'gamefox-pagelist');
            }
            else
            {
              pageListParent = rows[i].cells[1];
            }

            pageListParent.appendChild(pageList);

            if (gamefox_lib.getPref('paging.location') == 0)
            {
              rows[i].parentNode.insertBefore(pageListParent, rows[i].nextSibling);
              skipNext = true;
            }
          }
        }

        // tracked.php
        if (onTracked)
        {
          // Board linkification
          if (gamefox_lib.getPref('elements.tracked.boardlink'))
          {
            var topicLink = rows[i].cells[1].getElementsByTagName('a')[0]
              .getAttribute('href');
            var topicParams = gamefox_utils.parseBoardLink(topicLink);

            rows[i].cells[2].innerHTML = '<a href="' + gamefox_utils
              .newURI(topicParams['board'], null, null, null, null,
                  topicLink) + '">' + rows[i].cells[2].textContent.trim()
                    + '</a>';
          }
        }

        // gentopic.php
        else
        {
          // Highlighting
          var username = gamefox_utils
            .cleanUsername(rows[i].cells[2].textContent.trim());
          var userStatus = rows[i].cells[2].textContent.replace(username,
              '').trim();
          var title = rows[i].cells[1].textContent.trim();
          var topicId = gamefox_utils.getTopicId(rows[i].cells[1]
              .getElementsByTagName('a')[0].href);
          var hlinfo;

          if ((hlinfo = gamefox_highlighting.searchTopic(username, topicId,
                  title, userStatus)) != false)
          {
            // list of groups
            if (gamefox_lib.getPref('userlist.topics.showgroupnames') &&
                hlinfo[0].length)
            {
              var groupname = document.createElement('span');
              groupname.className = gamefox_highlighting.groupClassName;
              groupname.appendChild(document.createTextNode('(' + hlinfo[0] + ')'));
              rows[i].cells[2].appendChild(document.createTextNode(' '));
              rows[i].cells[2].appendChild(groupname);
            }

            if (hlinfo[3] == 1) // remove topic
            {
              rows[i].style.setProperty('display', 'none', null);
              alternateColor = !alternateColor;
            }
            else if (hlinfo[3] == 0) // highlight topic
            {
              rows[i].className += ' ' + gamefox_highlighting.highlightClassName;
              rows[i].style.setProperty('background-color', hlinfo[1], 'important');

              // Hack for SpotFAQs and RetroClassic - For some reason, this
              // doesn't work unless it's done in JavaScript
              var tds = rows[i].getElementsByTagName('td');
              for (var j = 0; j < tds.length; j ++)
                tds[j].style.setProperty('background-color', 'transparent', 'important');
            }
          }

          // for removed topics
          if (alternateColor)
          {
            if (/\beven\b/.test(rows[i].className))
              rows[i].className = rows[i].className.replace(/\beven\b/, '');
            else
              rows[i].className += ' even';
          }
        }

        // for added page rows
        if (skipNext)
        {
          ++i;
          skipNext = false;
        }
      }
    }

    /* Message Lists */
    else if (gamefox_lib.onPage('messages'))
    {
      var userPanel = document.evaluate('//a[@href="/user/"]', document, null,
          XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      var userNav = document.getElementsByClassName("paginate user")[0].firstChild.firstChild;
      var pageJumper = document.evaluate('//div[@class="pod pagejumper"]',
          boardWrap, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        .singleNodeValue;
      if (pageJumper)
      {
        var pageJumperItems = pageJumper.getElementsByTagName('li');
        document.gamefox.pages = parseInt(pageJumperItems[pageJumperItems.length - 1].textContent);
      }
      else
      {
        document.gamefox.pages = 1;
      }
      gamefox_highlighting.loadGroups();

      var boardId = gamefox_utils.getBoardId(document.location.pathname);
      var topicId = gamefox_utils.getTopicId(document.location.pathname);
      var topicParams = gamefox_utils.parseQueryString(document.location.search);
      var pagenum = Math.max(parseInt(topicParams.page), 0) || 0;
      var leftMsgData = gamefox_utils.getMsgDataDisplay();
      var onArchive = gamefox_lib.onPage('archive');
      var onDetail = gamefox_lib.onPage('detail');
      var gfQP = document.querySelector('form[action^="/boards/post.php"]');

      document.gamefox.thisPage = pagenum;

      // Title
      gamefox_lib.setTitle(gamefox_utils.getBoardWrapHeader(),
          'M' + (onDetail ? 'D' : ''),
          (pagenum ? (pagenum + 1) : null));

      // Message numbering and highlighting
      /*var messageTable = document.evaluate('//div[@class="body"]/table[@class="board message msg"]',
          boardWrap, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;*/
      var messageTable = document.querySelector('.board.message.msg') || document.querySelector('.board.message');
      var tdResult = document.evaluate('./tbody/tr/td', messageTable, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      var td = [];
      for (var i = 0; i < tdResult.snapshotLength; i++)
        td[i] = tdResult.snapshotItem(i);

      var ignoreMsg = document.evaluate('./div[@class="body"]/p', boardWrap, null,
          XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      var ignoreCount = 0;
      if (ignoreMsg)
      {
        var ignoreMatch = ignoreMsg.textContent.match(/([0-9]+) message/);
        if (ignoreMatch)
          ignoreCount = parseInt(ignoreMatch[1]);
      }

      var alternateColor = false;
      var msgnum = pagenum * gamefox_lib.getPref('msgsPerPage');
      var msgnumCond = !onDetail && gamefox_lib.getPref('elements.msgnum')
        && td[0].textContent[0] != '#';
      var msgnumStyle = gamefox_lib.getPref('elements.msgnum.style');

      var tcMarkerCond = !onDetail && gamefox_lib.getPref('elements.marktc');
      var tcMarker = '\xA0' + gamefox_lib.getPref('elements.marktc.marker');
      var tc = document.location.search.match(/\btc=([^&<>"]+)/);
      if (tc)
        tc = tc[1].replace(/\+/g, ' ');

      var deletelinkCond = gamefox_lib.getPref('elements.deletelink');
      var loggedInAs = userNav.textContent;
      var loggedInUser = loggedInAs.substr(0, loggedInAs.indexOf('(') - 1);
      var loggedInLevel = loggedInAs.substr(loggedInAs.indexOf(')') - 2, 2);

      // if you can post, it's obviously open; And yes, that space IS needed.
      var topicOpen = (document.getElementsByClassName("paginate user")[0].lastChild.textContent === " Post New Message");

      var canQuickPost = (topicOpen || loggedInLevel >= 50) && !onDetail
        && !onArchive && prefs['elements.quickpost.form'];
      var filterCond = gamefox_lib.getPref('elements.filterlink') && !onDetail;
      var quotelinkCond = gamefox_lib.getPref('elements.quotelink') && (canQuickPost || gfQP);
      var sigCond = gamefox_lib.getPref('elements.sigspans');


      var editCond = prefs['elements.editlink'] && loggedInLevel >= 30;

      for (var i = 0; i < td.length; i += 2)
      {
        if (/\bad\b/.test(td[i].firstChild.className))
        {
          // this is an ad row
          if (blockAds)
            td[i].parentNode.parentNode.removeChild(td[i].parentNode);
          i--;
          continue;
        }

        ++msgnum;
        var msgnumString = '000'.substring(msgnum.toString().length) + msgnum;
        td[i].id = 'p' + msgnumString;

        var profileLink = td[i].querySelector(onArchive ? 'b' : 'a.name');

        var username = profileLink.textContent;
        if (leftMsgData) {
          var msgStats = profileLink.parentNode.parentNode;
        } else{
          var msgStats = profileLink.parentNode;
        };
        var detailLink = msgStats.getElementsByTagName('a')[2];
        var postBody = td[i + 1].textContent;

        // Double click
        if (prefs['message.header.dblclick'])
          td[i].addEventListener('dblclick', gamefox_page.msglistDblclick(), false);

        if (prefs['message.dblclick'])
          td[i + 1].addEventListener('dblclick', gamefox_quote.quote, false);

        // Native quotes to GFCode
        if (prefs['elements.stylenative'])
        {
          var quotes = td[i + 1].querySelectorAll('b > i');
          for (var j = 0; j < quotes.length; j ++)
          {
            try {
              var nameLen = quotes[j].textContent.length - 10;
              var bTag = quotes[j].parentNode;
              var brTag = bTag.nextSibling;
              var iBody = brTag.nextSibling;

              if (quotes[j].textContent.substr(nameLen) != ' posted...' ||
                  brTag.nodeName != 'BR' || iBody.nodeName != 'I')
                continue;
            }
            catch (e) {
              continue;
            }

            bTag.parentNode.removeChild(bTag);
            brTag.parentNode.removeChild(brTag);

            var newP = document.createElement('p');
            newP.appendChild(document.createElement('strong')).textContent =
                'From: ' + quotes[j].textContent.substr(0, nameLen);
            newP.appendChild(brTag);

            while (iBody.hasChildNodes())
              newP.appendChild(iBody.removeChild(iBody.firstChild));

            iBody.appendChild(newP);
          }
        }

        // Image link thumbnails
        if (gamefox_lib.getPref('elements.tti'))
          tti.process(td[i + 1]);

        for (var j = 0; j < msgStats.childNodes.length; j++)
        {
          // check if this is the post date node
          if (msgStats.childNodes[j].textContent.indexOf('Posted') != -1
              && /Posted:? [0-9\/\: ]+\u00a0(A|P)M/.test(msgStats.childNodes[j]
                .textContent))
          {
            var postDate = /Posted:? [0-9\/\: ]+\u00a0(A|P)M/.exec(msgStats.childNodes[j].textContent)[0];
            break;
          }
        }

        td[i].setAttribute('gfdate', postDate); // for quoting

        // Mod/Admin/VIP tag
        var userStatus = /\([AMV]\w+\)/.exec(td[i].textContent);
        userStatus = userStatus ? userStatus[0] : '';

        // Topic creator
        if (msgnum == 1)
          tc = username;

        // Element for sigs
        if (sigCond)
        {
          var msgNode = td[i + 1], dividerIndex = -1, brCount = 0;
          for (var j = msgNode.childNodes.length - 1; j >= 0; j--)
          {
            var childNode = msgNode.childNodes[j];
            if (childNode.nodeName == '#text')
            {
              if (childNode.data.trim() == '---')
                dividerIndex = j;
            }
            else if (childNode.nodeName == 'BR')
            {
              ++brCount;
            }
            else if (childNode.nodeName == 'DIV')
            { // msg_body
              msgNode = childNode;
              j = msgNode.childNodes.length - 1;
              dividerIndex = -1;
              brCount = 0;
            }
            else if (childNode.nodeType == Node.ELEMENT_NODE)
            {
              brCount += childNode.getElementsByTagName('br').length;
            }
            if (brCount > 2)
              break;
          }
          if (dividerIndex != -1)
          {
            var span = document.createElement('span');
            span.className = 'gamefox-signature';
            while (dividerIndex < msgNode.childNodes.length)
              span.appendChild(msgNode.childNodes[dividerIndex]);
            msgNode.appendChild(span);
          }
        }

        // Title for detail link (useful with message-link-icons.css)
        if (detailLink)
          detailLink.title = 'Detail';

        // Element for GameFOX links
        var msgLinks = document.createElement('span');
        msgLinks.className = 'gamefox-message-links';

        // Message highlighting
        var hlinfo, groupname;
        if ((hlinfo = gamefox_highlighting.searchPost(username, postBody,
                tc == username && !onDetail, userStatus)) != false)
        {
          // add group names before post date
          if (gamefox_lib.getPref('userlist.messages.showgroupnames') &&
              hlinfo[0].length)
          {
            if (leftMsgData)
              msgStats.appendChild(document.createElement('br'));
            else
              msgStats.appendChild(document.createTextNode(' | '));

            groupname = document.createElement('span');
            groupname.className = gamefox_highlighting.groupClassName;
            groupname.appendChild(document.createTextNode(hlinfo[0]));

            msgStats.appendChild(groupname);
          }

          if (hlinfo[2] == 0)
          {
            td[i].className += ' ' + gamefox_highlighting.highlightClassName;
            td[i].style.setProperty('background-color', hlinfo[1], 'important');
          }
          else if (hlinfo[2] == 2) // Collapse post
          {
            td[i + 1].style.setProperty('font-size', '0pt', 'important');
            td[i + 1].style.setProperty('display', 'none', 'important');

            var a = document.createElement('a');
            a.appendChild(document.createTextNode('show'));
            a.title = 'Show';
            a.className = 'gamefox-show-post-link';
            a.href = '#';
            a.addEventListener('click', gamefox_highlighting.showPost, false);

            if (!leftMsgData)
              msgLinks.appendChild(document.createTextNode(' | '));
            else if (!onArchive)
              msgLinks.appendChild(document.createElement('br'));
            msgLinks.appendChild(a);
          }
          else if (hlinfo[2] == 1) // remove post
          {
            td[i].parentNode.className += ' gamefox-removed';
            td[i].parentNode.style.setProperty('display', 'none', null);
            if (leftMsgData)
              alternateColor = !alternateColor;
            else
              td[i + 1].parentNode.style.setProperty('display', 'none', null);
          }
        }

        // for removed posts
        if (alternateColor)
        {
          var tr = td[i].parentNode;
          if (/\beven\b/.test(tr.className))
            tr.className = tr.className.replace(/\beven\b/, '');
          else
            tr.className += ' even';
        }

        // Distinguish posts from the topic creator
        if (tcMarkerCond && tc == username)
        {
          var span = document.createElement('span');
          span.className = 'gamefox-tc-label';
          span.appendChild(document.createTextNode(tcMarker));
          msgStats.insertBefore(span, profileLink.nextSibling);
        }

        // Add delete and edit links
        if (loggedInUser == username && !onArchive && !onDetail &&
            ((msgnum == 1 && topicOpen) || msgnum != 1) &&
            postBody.trim() != '[This message was deleted at ' +
            'the request of the original poster]' &&
            postBody.trim() != '[This message was deleted at ' +
            'the request of a moderator or administrator]')
        {
          // Edit
          if (editCond && Date.parse(postDate) > new Date().getTime() - 1000*60*60)
          {
            var editlink = document.createElement('a');
            editlink.href = '#';
            editlink.textContent = 'edit';
            editlink.title = 'Edit';
            editlink.className = 'gamefox-edit-link';
            editlink.addEventListener('click', gamefox_messages.editPost, false);

            msgLinks.appendChild((leftMsgData && !msgLinks.hasChildNodes()) ?
                document.createElement('br') : document.createTextNode(' | '));
            msgLinks.appendChild(editlink);
          }

          // Delete/close
          var deleteType = [];

          if (msgnum == 1 && td.length >= 4 && topicOpen)
            deleteType = ['close', 'close'];
          else if (msgnum == 1 && td.length < 4)
            deleteType = ['deletetopic', 'delete'];
          else if (msgnum != 1)
            deleteType = ['deletepost', 'delete'];

          if (deleteType.length)
          {
            td[i].setAttribute('gfdeletetype', deleteType[0]);

            if (deletelinkCond)
            {
              var link = document.createElement('a');
              link.className = 'gamefox-delete-link';
              link.href = '#';
              link.appendChild(document.createTextNode(deleteType[1]));
              link.title = deleteType[1].charAt(0).toUpperCase()
                + deleteType[1].slice(1);
              link.addEventListener('click', gamefox_messages.deletePost,
                  false);

              msgLinks.appendChild((leftMsgData && !msgLinks.hasChildNodes()) ?
                  document.createElement('br') : document.createTextNode(' | '));
              msgLinks.appendChild(link);
            }
          }
        }

        // Filtering
        if (filterCond)
        {
          var a = document.createElement('a');
          a.appendChild(document.createTextNode('filter'));
          a.title = 'Filter';
          a.className = 'gamefox-filter-link';
          a.href = '#';
          a.addEventListener('click', gamefox_page.toggleFilter, false);

          if (!leftMsgData || msgLinks.hasChildNodes())
            msgLinks.appendChild(document.createTextNode(' | '));
          else if (!onArchive)
            msgLinks.appendChild(document.createElement('br'));
          msgLinks.appendChild(a);
        }

        // Message numbering
        if (msgnumCond)
        {
          switch (msgnumStyle)
          {
            case 1: // #001 | [message detail]
              var element = onArchive ? msgLinks : detailLink;
              msgStats.insertBefore(document.createTextNode((!leftMsgData &&
                  onArchive ? ' | ' : '') + '#' + msgnumString + (!leftMsgData
                  && !onArchive ? ' | ' : '')), element);
              if (leftMsgData && msgLinks.hasChildNodes())
                msgStats.insertBefore(document.createElement('br'), element);
              break;

            case 2: // [#001]
              if (onArchive)
              {
                if (!leftMsgData)
                  msgStats.insertBefore(document.createTextNode(' | '), msgLinks);
                var numElement = document.createElement(leftMsgData ? 'span' : 'b');
                numElement.appendChild(document.createTextNode('#' + msgnumString));
                msgStats.insertBefore(numElement, msgLinks);
                if (leftMsgData && msgLinks.hasChildNodes())
                  msgStats.insertBefore(document.createElement('br'), msgLinks);
              }
              else
              {
                detailLink.className = 'gamefox-message-detail-number';
                detailLink.innerHTML = '#' + msgnumString;
              }
              break;

            case 3: // [message #001]
              if (onArchive)
              {
                if (!leftMsgData)
                  msgStats.insertBefore(document.createTextNode(' | '), msgLinks);
                var numElement = document.createElement(leftMsgData ? 'span' : 'b');
                numElement.appendChild(document.createTextNode('message #' + msgnumString));
                msgStats.insertBefore(numElement, msgLinks);
                if (leftMsgData && msgLinks.hasChildNodes())
                  msgStats.insertBefore(document.createElement('br'), msgLinks);
              }
              else
              {
                detailLink.className = 'gamefox-message-detail-number';
                detailLink.innerHTML = 'message #' + msgnumString;
              }
              break;

            default:
            case 0: // [message detail] | #001
              if (leftMsgData)
              {
                if (!onArchive || msgLinks.hasChildNodes())
                  msgStats.appendChild(document.createElement('br'));
                msgStats.appendChild(document.createTextNode('#' + msgnumString));
              }
              else
                msgStats.appendChild(document.createTextNode(' | #' + msgnumString));
              break;
          }
        }
      }

      document.gamefox.tc = tc;
      document.gamefox.msgnum = msgnum;

      if (!localStorage[topicId] || msgnum + ignoreCount > parseInt(localStorage[topicId]))
        localStorage[topicId] = msgnum + ignoreCount;

      // Add TC to page links
      if (pageJumper)
      {
        var tcParam = gamefox_utils.tcParam(tc);
        if (tcParam)
        {
          var pageJumperTop;
          if (userPanel)
            pageJumperTop = document.evaluate('./div[@class="u_pagenav"]', userPanel,
                null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
              .singleNodeValue;
          else
            pageJumperTop = document.evaluate('./div[@class="pages"]',
                userNav.parentNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE,
                null).singleNodeValue;

          var links = gamefox_utils.mergeArray(
              pageJumperTop ? pageJumperTop.getElementsByTagName('a') : [],
              pageJumper.getElementsByTagName('a'));
          for (var i = 0; i < links.length; i++)
          {
            if (links[i].search.indexOf('page') != -1)
              links[i].search += tcParam;
          }
        }
      }

      // Link post nums in quotes
      // Based on barbarianbob's initial code.
      // http://www.gamefaqs.com/boards/genmessage.php?board=565885&topic=52347416
      if (gamefox_lib.getPref('elements.postidQuoteLinks'))
      {
        var quotes = document.evaluate('//table[contains(@class, "board")]//i/p/strong', document,
            null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        var quote;
        for (var i = 0; i < quotes.snapshotLength; i++)
        {
          quote = quotes.snapshotItem(i);
          quote.innerHTML = quote.innerHTML.replace(/#([0-9]+)/, function(z, num){
              return '<a href="' + gamefox_utils.newURI(boardId, topicId,
                  Math.floor((num - 1) /
                    gamefox_lib.getPref('msgsPerPage')),
                  tc, num, document.location.pathname)
                + '">#' + num + '</a>';
              });
        }
      }

      // QuickPost
      if (canQuickPost)
      {
        if (gfQP)
          gfQP.parentNode.removeChild(gfQP);
          //gfQP.style.display = "none";

        var qpDiv = document.createElement('div');
            qpDiv.id = 'gamefox-quickpost-normal';

        boardWrap.parentNode.appendChild(qpDiv);
        gamefox_quickpost.appendForm(qpDiv, false);
      }

      // post ids are generated after the page is loaded
      // this is at the bottom because firefox 2 doesn't re-center the page after
      // QuickPost is added
      if (document.location.hash.length)
      {
        if (document.location.hash == '#last-post'
            || (document.location.hash.substr(2) > msgnumString
              && /#p[0-9]{3}/.test(document.location.hash)))
          document.location.hash = '#p' + msgnumString;
        else
          document.location.hash = document.location.hash;
      }
    }
  },

  msglistDblclick: function()
  {
    switch(prefs['message.header.dblclick'])
    {
      case 1:
        if (gamefox_lib.onPage('archive'))
          return undefined;
        return gamefox_quickwhois.quickWhois;
      case 2:
        return gamefox_quote.quote;
      case 3:
        return gamefox_page.toggleFilter;
    }
  },

  topicDblclick: function(type)
  {
    switch (prefs[type + '.dblclick'])
    {
      case 1:
        return gamefox_page.showPages;
      case 2:
        return function(event) {
          gamefox_page.gotoLastPage.call(this, event, true);
        };
      case 4:
        return gamefox_page.gotoLastPage;
    }
  },

  gotoLastPage: function(event, gotoLastPost)
  {
    event.preventDefault();
    getSelection().removeAllRanges();

    var cell = this.cells[gamefox_lib.onPage('myposts') ? 2 : 3];

    var lastPost = gamefox_utils.getLastPost(cell.textContent,
        (gamefox_lib.onPage('tracked') || gamefox_lib.onPage('myposts')) ? ''
          : this.cells[2].firstChild.textContent);

    document.location.href = this.cells[1].getElementsByTagName('a')[0].href +
      lastPost[0] + (gotoLastPost ? lastPost[1] : '');
  },

  showPages: function(event)
  {
    getSelection().removeAllRanges();
    var node = event.target;
    var topiclink, posts, tc, pageList;

    try
    {
      while (node.nodeName.toLowerCase() != 'td')
        node = node.parentNode;
      node = node.parentNode; // topic row

      topiclink = node.cells[1].getElementsByTagName('a')[0].href;
      posts = node.cells[gamefox_lib.onPage('myposts') ? 2 : 3].textContent;
      tc = gamefox_lib.onPage('tracked') || gamefox_lib.onPage('myposts')
          ? '' : node.cells[2].firstChild.textContent.trim();
    }
    catch (e)
    {
      return;
    }

    var loc = gamefox_lib.getPref('paging.location');
    node = node.cells[1];

    if (loc == 0)
    {
      if (node.parentNode.nextSibling
          && node.parentNode.nextSibling.className == 'gamefox-pagelist')
        pageList = node.parentNode.nextSibling;
    }
    else
    {
      pageList = document.evaluate('./span[@class="gamefox-pagelist"]',
          node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    if (pageList)
    {
      pageList.style.display = pageList.style.display == 'none' ? '' : 'none';
    }
    else
    {
      pageList = gamefox_page.formatPagination(document, topiclink, posts, tc);

      if (pageList) // multiple pages
      {
        var pageListParent;
        if (loc == 0)
        {
          pageListParent = document.createElement('tr');
          pageListParent.setAttribute('class', 'gamefox-pagelist');
        }
        else
        {
          pageListParent = node;
        }

        pageListParent.appendChild(pageList);

        if (loc == 0)
          node.parentNode.parentNode.insertBefore(pageListParent, node.parentNode.nextSibling);
      }
    }
  },

  formatPagination: function(document, topiclink, posts, tc)
  {
    var pages = Math.ceil(posts / gamefox_lib.getPref('msgsPerPage'));
    if (pages == 1)
      return false;

    var loc = gamefox_lib.getPref('paging.location');
    var prefix = gamefox_lib.getPref('paging.prefix');
    var sep = gamefox_lib.getPref('paging.separator');
    var suffix = gamefox_lib.getPref('paging.suffix');

    var prefixHTML = document.createElement('span');
    if (loc == 2)
      prefixHTML.appendChild(document.createElement('br'));
    prefixHTML.appendChild(document.createTextNode(' ' + prefix.replace(/\s/g, '\xA0')));

    var suffixHTML = document.createElement('span');
    suffixHTML.appendChild(document.createTextNode(suffix.replace(/\s/g, '\xA0')));

    var pageHTML;
    if (loc == 0)
    {
      pageHTML = document.createElement('td');
      pageHTML.setAttribute('colspan', '0');
    }
    else
    {
      pageHTML = document.createElement('span');
      pageHTML.setAttribute('class', 'gamefox-pagelist');
    }

    pageHTML.appendChild(prefixHTML);

    var tcParam = gamefox_utils.tcParam(tc);
    var a;
    for (var i = 0; i < pages; i++)
    {
      a = document.createElement('a');
      a.href = topiclink + (i ? '?page=' + i + tcParam : '');
      a.appendChild(document.createTextNode(i + 1));

      pageHTML.appendChild(a);

      if (i < pages - 1)
        pageHTML.appendChild(document.createTextNode(sep));
    }

    pageHTML.appendChild(suffixHTML);

    return pageHTML;
  },

  toggleFilter: function(event)
  {
    if (event)
      event.preventDefault();

    getSelection().removeAllRanges();

    var boardWrap = document.querySelector('#content .board_wrap');
    var tdResult = document.evaluate('//div[@class="body"]/'
        + 'table[@class="board message"]/tbody/tr/td', boardWrap, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var td = [];
    for (var i = 0; i < tdResult.snapshotLength; i++)
      td[i] = tdResult.snapshotItem(i);
    var leftMsgData = gamefox_utils.getMsgDataDisplay();
    var selector = gamefox_lib.onPage('archive') ? 'b' : 'a.name';
    var newText, newTitle, newFocus;

    var msgComponents = gamefox_utils.getMsgComponents(this);
    if (!msgComponents)
      return;

    if (!window.msgsFiltered)
    {
      var username = msgComponents.header.
          querySelector(selector).textContent;

      for (var i = 0; i < td.length; i += 2)
      {
        if (td[i].querySelector(selector).textContent == username)
        {
          if (!newFocus)
            newFocus = td[i];
        }
        else
        {
          td[i].parentNode.style.display = 'none';
          if (!leftMsgData)
            td[i + 1].parentNode.style.display = 'none';
        }
      }

      newText = 'unfilter';
      newTitle = 'Unfilter';
      msgsFiltered = true;
    }
    else
    {
      for (var i = 0; i < td.length; i += 2)
      {
        if (!/\bgamefox-removed\b/.test(td[i].parentNode.className))
        {
          td[i].parentNode.style.display = '';
          if (!leftMsgData)
            td[i + 1].parentNode.style.display = '';
        }
      }

      newText = 'filter';
      newTitle = 'Filter';
      delete msgsFiltered;
    }

    var filterResult = document.evaluate('.//a[@class="gamefox-filter-link"]',
        boardWrap, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0; i < filterResult.snapshotLength; i++)
    {
      filterResult.snapshotItem(i).textContent = newText;
      filterResult.snapshotItem(i).title = newTitle;
    }

    scrollTo(0, gamefox_utils.getTopOffset(newFocus || msgComponents.header));
  },

  addClock: function(par)
  {
    var dateNode = document.createElement('span');
    dateNode.className = 'gamefox-clock';
    par.appendChild(dateNode);

    setTimeout(function() {
      setInterval(function() {
        dateNode.textContent = ' | ' + new Date().userFormat('clock');
      }, 1000);
    }, 1000 - new Date().getMilliseconds());
  },

  insertCSS: function(style)
  {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.extension.getURL('css/' + style);
    link.className = 'gamechrome-css';
    document.head.appendChild(link);
  },

  afterloadCSS: function()
  {
    document.removeEventListener('DOMNodeInserted', gamefox_page.afterloadCSS, false);
    var links = document.head.getElementsByTagName('link');

    if (prefs['theme.disablegamefaqscss'])
    {
      for (var i = 0; i < links.length; i ++)
        if (links[i].rel == 'stylesheet' && links[i].className != 'gamechrome-css')
          links[i].disabled = true;
    }
    else if (prefs['theme.extras'])
    {
      // Order is sensitive!
      ['gamefax', 'retroclassic', 'ninestalgia_pink', 'ninestalgia', 'spotfaqslight', 'spotfaqsdark'].
        some(
          function(theme) {
            for (var i = 0; i < links.length; i ++)
              if (links[i].rel == 'stylesheet' && links[i].className != 'gamechrome-css' &&
                  links[i].href.indexOf(theme) != -1)
              {
                gamefox_page.insertCSS('extras/' + theme + '.css');
                return true;
              }
            return false;
          });
    }
  }
};

chrome.extension.sendRequest('prefs',
  function(prefs) {
    window.prefs = prefs;

    prefs.styles.forEach(gamefox_page.insertCSS);

    for (var i = 0; i < prefs.usercss.length; i ++)
    {
      if (!prefs.usercss[i][1])
        continue;

      var style = document.createElement('style');
      style.type = 'text/css';
      style.className = 'gamechrome-css';
      style.appendChild(document.createTextNode(prefs.usercss[i][2]));
      document.head.appendChild(style);
    }

    if (document.readyState == 'loading')
    {
      document.addEventListener('DOMNodeInserted', gamefox_page.afterloadCSS, false);
      document.addEventListener('DOMContentLoaded', gamefox_page.process, false);
    }
    else
    {
      gamefox_page.afterloadCSS();
      gamefox_page.process();
    }
  });

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    function link(href)
    {
      return document.querySelector('a[href="' + href.substr(23) + '"]');
    }

    if (request == 'reload')
      document.location.reload();

    if (request == 'breaktags')
      gamefox_quickpost.breakTagsFromButton();

    if (typeof request == 'object')
    {

      if ('quote' in request)
        gamefox_quote.quote.call(link(request.quote));

      if ('filter' in request)
        gamefox_page.toggleFilter.call(link(request.filter));

      if ('userlist' in request)
        sendResponse(link(request.userlist).textContent);
    }
  });

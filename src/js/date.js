/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2010, 2011 Jesse Lentz, Daniel Rench, Brian Marshall
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

function pad(str, n)
{
  str = str.toString();
  while (str.length < n)
    str = '0' + str;
  return str;
};

Date.prototype.strftime = function(fmt) {
  this.strftime_f = function(char) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    var days = ['Sunday', 'Monday', 'Tuesday',
        'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var dpm = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    switch (char)
    {
      case 'a': return days[this.getDay()].substring(0,3);
      case 'A': return days[this.getDay()];
      case 'b': return months[this.getMonth()].substring(0,3);
      case 'B': return months[this.getMonth()];
      case 'c': return this.toString();
      case 'C': return Math.floor(this.getFullYear()/100);
      case 'd': return pad(this.getDate(), 2);
      case 'D': return this.strftime_f('m') + '/' + this.strftime_f('d') + '/' + this.strftime_f('y');
      case 'e': return this.getDate();
      case 'F': return this.strftime_f('Y') + '-' + this.strftime_f('m') + '-' + this.strftime_f('d');
      case 'H': return pad(this.getHours(), 2);
      case 'i': return this.getHours() % 12 || 12;
      case 'I': return pad(this.getHours() % 12 || 12, 2);
      case 'j':
        var t = this.getDate();
        var m = this.getMonth() - 1;
        if (m > 1) {
          var y = this.getYear();
          if (((y % 100) == 0) && ((y % 400) == 0)) ++t;
          else if ((y % 4) == 0) ++t;
        }
        while (m > -1) t += dpm[m--];
        return pad(t, 3);
      case 'k': return this.getHours();
      case 'l': return ((this.getHours() % 12 || 12));
      case 'm': return pad(this.getMonth() + 1, 2);
      case 'M': return pad(this.getMinutes(), 2);
      case 'n': return (this.getMonth()+1);
      case 'p': return (this.getHours() > 11) ? 'PM' : 'AM';
      case 'r': return this.strftime_f('I') + ':' + this.strftime_f('M') + ':' + this.strftime_f('S') + ' ' + this.strftime_f('p');
      case 'R': return this.strftime_f('H') + ':' + this.strftime_f('M');
      case 's': return Math.floor(this.getTime()/1000);
      case 'S': return pad(this.getSeconds(), 2);
      case 'T': return this.strftime_f('H') + ':' + this.strftime_f('M') + ':' + this.strftime_f('S');
      case 'u': return(this.getDay() || 7);
  /*		U: function (d) { return false }, */
      case 'v': return this.strftime_f('e') + '-' + this.strftime_f('b') + '-' + this.strftime_f('Y');
  /*		V: function (d) { return false }, */
      case 'w': return this.getDay();
  /*		W: function (d) { return false }, */
      case 'x': return this.toDateString(); // wrong?
      case 'X': return this.toTimeString(); // wrong?
      case 'y': return pad(this.getYear() % 100, 2);
      case 'Y': return this.getFullYear();
      case 'Z': return this.toString().match(/\((.+)\)$/)[1];
      case '%': return '%';
    }
    return '';
  };

  var sub, i = 0;
  while (i < fmt.length - 1)
  {
    if (fmt[i] == '%')
    {
      sub = this.strftime_f(fmt[i + 1]).toString();
      fmt = fmt.substr(0, i) + sub + fmt.substr(i + 2);
      i += sub.length;
    }
    else
      i ++;
  }
  return fmt;
};

Date.prototype.formats = {
  topic:   ['%n/%e %i:%M%p',
            '%m/%d %I:%M%p',
            '%m/%d %H:%M',
            '%d/%m %I:%M%p',
            '%d/%m %H:%M'],
  message: ['%n/%e/%Y %i:%M:%S %p',
            '%m/%d/%Y %I:%M:%S %p',
            '%m/%d/%Y %H:%M:%S',
            '%d/%m/%Y %I:%M:%S %p',
            '%d/%m/%Y %H:%M:%S',
            '%Y-%m-%d %I:%M:%S %p',
            '%Y-%m-%d %H:%M:%S'],
  clock:   ['%n/%e/%Y %i:%M:%S %p',
            '%m/%d/%Y %I:%M:%S %p',
            '%m/%d/%Y %H:%M:%S',
            '%d/%m/%Y %I:%M:%S %p',
            '%d/%m/%Y %H:%M:%S',
            '%Y-%m-%d %I:%M:%S %p',
            '%Y-%m-%d %H:%M:%S']
};

Date.prototype.userFormat = function(type) {
  return this.strftime(
    this.formats[type][prefs['date.' + type + 'Preset']] || prefs['date.' + type + 'Custom']
  );
};

String.prototype.strtotime = function() {
  var time = this.split(/(\/| |:|AM|PM)/);

  // Convert to 24-hour scale
  if (time[7] == 'PM' && time[4] < 12)
    time[4] = parseInt(time[4]) + 12;
  if (time[7] == 'AM' && time[4] == 12)
    time[4] = 0;

  return new Date(new Date().getFullYear(), time[0] - 1, time[2], time[4], time[6]);
};

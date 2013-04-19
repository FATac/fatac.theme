var fatbooks = fatbooks || {};

/**
 * @fileoverview Provides hogan compiled templates
 *               ready to render.
 */


fatbooks.templates = function() {



var NOTE = '\
<div class="note">\
    <p>{{text}}</p>\
</div>\
';

var THUMB = '\
<div class="thumb {{selected}}">\
    <img src="{{image}}" title="{{title}}"/>\
</div>\
';

var DETAIL = '\
<div class="detail">\
  <img src="{{url}}"/>\
  <span>{{title}}</span>\
</div>\
';

var COMMENT = '\
<div class="comment clearfix">\
    <p>{{text}}</p>\
    <span class="pull-right">{{author}}</span>\
</div>\
';


var templates = {

       notes: Hogan.compile(NOTE),
       thumb: Hogan.compile(THUMB),
     details: Hogan.compile(DETAIL),
    comments: Hogan.compile(COMMENT),

  }

  return templates
}
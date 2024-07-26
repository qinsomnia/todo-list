(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function clearChildNodes(root) {
  while (root.hasChildNodes()) {
    // or root.firstChild or root.lastChild
    root.removeChild(root.firstChild);
  }
  // or root.innerHTML = ''
}

exports.default = clearChildNodes;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addEventsGenerator = require('../dbGeneral/addEventsGenerator');

var _addEventsGenerator2 = _interopRequireDefault(_addEventsGenerator);

var _eventsHandler = require('../dbFail/eventsHandler');

var _eventsHandler2 = _interopRequireDefault(_eventsHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addEvents() {
  window.alert('Your browser doesn\'t support a stable version of IndexedDB. We will offer you the without indexedDB mode');
  (0, _addEventsGenerator2.default)(_eventsHandler2.default);
}

exports.default = addEvents;

},{"../dbFail/eventsHandler":3,"../dbGeneral/addEventsGenerator":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _refresh = require('../dbFail/refresh');

var _refresh2 = _interopRequireDefault(_refresh);

var _eventsHandlerGeneral = require('../dbGeneral/eventsHandlerGeneral');

var _eventsHandlerGeneral2 = _interopRequireDefault(_eventsHandlerGeneral);

var _itemGenerator = require('../templete/itemGenerator');

var _itemGenerator2 = _interopRequireDefault(_itemGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _id = 0; // so the first item's id is 1

function add() {
  var inputValue = document.querySelector('#input').value;

  if (inputValue === '') {
    window.alert('please input a real data~');
  } else {
    addHandler(inputValue);
  }
}

function addHandler(inputValue) {
  var list = document.querySelector('#list');

  _removeRandom(list);
  _id += 1;
  var newData = _eventsHandlerGeneral2.default.dataGenerator(_id, inputValue);
  list.insertBefore((0, _itemGenerator2.default)(newData), list.firstChild); // push newLi to first
  _eventsHandlerGeneral2.default.resetInput();
}

function _removeRandom(list) {
  var listItems = list.childNodes;

  [].concat(_toConsumableArray(listItems)).forEach(function (item) {
    if (item.classList.contains('aphorism')) {
      list.removeChild(item);
    }
  });
}
// or use for...in
// for (const index in listItems) {
//   if (listItems.hasOwnProperty(index)) {
//     if (listItems[index].classList.contains('aphorism')) {
//       list.removeChild(listItems[index]);
//     }
//   }
// }

function enterAdd(e) {
  if (e.keyCode === 13) {
    add();
  }
}

function showAll() {
  var list = document.querySelector('#list');
  var listItems = list.childNodes;

  [].concat(_toConsumableArray(listItems)).forEach(function (item) {
    _whetherAppear(item, true);
    if (item.classList.contains('finished')) {
      list.removeChild(item);
      list.appendChild(item); // PUNCHLINE: drop done item
    }
  });
}

/* eslint-disable no-param-reassign  */
function _whetherAppear(element, whether) {
  element.style.display = whether ? 'block' : 'none'; // FIXME: eslint error
}
/* eslint-enable no-param-reassign  */

function clickLi(_ref) {
  var target = _ref.target;

  // use event delegation
  if (target.getAttribute('data-id')) {
    target.classList.toggle('finished');
    showAll();
  }
}

// li's [x]'s delete
function removeLi(_ref2) {
  var target = _ref2.target;

  if (target.className === 'close') {
    // use event delegation
    _removeLiHandler(target);
    _addRandom();
  }
}

function _removeLiHandler(element) {
  // use previously stored data
  var list = document.querySelector('#list');
  var listItems = list.childNodes;
  var id = element.parentNode.getAttribute('data-id');

  try {
    [].concat(_toConsumableArray(listItems)).forEach(function (item) {
      if (item.getAttribute('data-id') === id) {
        list.removeChild(item);
      }
    });
  } catch (error) {
    console.log('Wrong id, not found in DOM tree');
    throw new Error(error);
  }
}

function _addRandom() {
  var list = document.querySelector('#list');

  if (!list.hasChildNodes() || _allDisappear(list)) {
    _refresh2.default.random();
  }
}

function _allDisappear(list) {
  var listItems = list.childNodes;

  return Array.prototype.every.call(listItems, function (item) {
    return item.style.display === 'none';
  });
}

function showInit() {
  _refresh2.default.init();
}

function showDone() {
  _showWhetherDone(true);
}

function showTodo() {
  _showWhetherDone(false);
}

function _showWhetherDone(whetherDone) {
  var list = document.querySelector('#list');
  var listItems = list.childNodes;

  _removeRandom(list);
  [].concat(_toConsumableArray(listItems)).forEach(function (item) {
    // FIXME: eslint error
    item.classList.contains('finished') ? _whetherAppear(item, whetherDone) : _whetherAppear(item, !whetherDone);
  });
  _addRandom();
}

function showClearDone() {
  var list = document.querySelector('#list');
  var listItems = list.childNodes;

  _removeRandom(list);
  [].concat(_toConsumableArray(listItems)).forEach(function (item) {
    if (item.classList.contains('finished')) {
      list.removeChild(item);
    }
  });
  _addRandom();
}

function showClear() {
  _refresh2.default.clear(); // clear nodes visually
  _refresh2.default.random();
}

exports.default = {
  add: add,
  enterAdd: enterAdd,
  clickLi: clickLi,
  removeLi: removeLi,
  showInit: showInit,
  showAll: showAll,
  showDone: showDone,
  showTodo: showTodo,
  showClearDone: showClearDone,
  showClear: showClear
};

},{"../dbFail/refresh":4,"../dbGeneral/eventsHandlerGeneral":6,"../templete/itemGenerator":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _refreshGeneral = require('../dbGeneral/refreshGeneral');

var _refreshGeneral2 = _interopRequireDefault(_refreshGeneral);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function randomAphorism() {
  var aphorisms = ['Yesterday You Said Tomorrow', 'Why are we here?', 'All in, or nothing', 'You Never Try, You Never Know', 'The unexamined life is not worth living. -- Socrates', 'There is only one thing we say to lazy: NOT TODAY'];
  var randomIndex = Math.floor(Math.random() * aphorisms.length);
  var text = aphorisms[randomIndex];

  _refreshGeneral2.default.sentenceHandler(text);
}

exports.default = {
  init: _refreshGeneral2.default.init,
  clear: _refreshGeneral2.default.clear,
  random: randomAphorism
};

},{"../dbGeneral/refreshGeneral":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function addEventsGenerator(handler) {
  handler.showInit();
  // add all eventListener
  var list = document.querySelector('#list');

  list.addEventListener('click', handler.clickLi, false);
  list.addEventListener('click', handler.removeLi, false);
  document.addEventListener('keydown', handler.enterAdd, false);
  document.querySelector('#add').addEventListener('click', handler.add, false);
  document.querySelector('#showDone').addEventListener('click', handler.showDone, false);
  document.querySelector('#showTodo').addEventListener('click', handler.showTodo, false);
  document.querySelector('#showAll').addEventListener('click', handler.showAll, false);
  document.querySelector('#showClearDone').addEventListener('click', handler.showClearDone, false);
  document.querySelector('#showClear').addEventListener('click', handler.showClear, false);
}

exports.default = addEventsGenerator;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getFormatDate = require('../getFormatDate');

var _getFormatDate2 = _interopRequireDefault(_getFormatDate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resetInput() {
  document.querySelector('#input').value = '';
}

function dataGenerator(key, value) {
  return {
    id: key,
    event: value,
    finished: false,
    date: (0, _getFormatDate2.default)('MM月dd日hh:mm')
  };
}

exports.default = {
  resetInput: resetInput,
  dataGenerator: dataGenerator
};

},{"../getFormatDate":8}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _itemGenerator = require('../templete/itemGenerator');

var _itemGenerator2 = _interopRequireDefault(_itemGenerator);

var _sentenceGenerator = require('../templete/sentenceGenerator');

var _sentenceGenerator2 = _interopRequireDefault(_sentenceGenerator);

var _clearChildNodes = require('../clearChildNodes');

var _clearChildNodes2 = _interopRequireDefault(_clearChildNodes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(dataArr) {
  _show(dataArr, _initSentence, _renderAll);
}

function _show(dataArr, showSentenceFunc, generateFunc) {
  if (!dataArr || dataArr.length === 0) {
    showSentenceFunc();
  } else {
    document.querySelector('#list').innerHTML = generateFunc(dataArr);
  }
}

function _initSentence() {
  var text = 'Welcome~, try to add your first to-do list : )';

  document.querySelector('#list').innerHTML = (0, _sentenceGenerator2.default)(text);
}

function all(randomAphorism, dataArr) {
  _show(dataArr, randomAphorism, _renderAll);
}

function _renderAll(dataArr) {
  var classifiedData = _classifyData(dataArr);

  return (0, _itemGenerator2.default)(classifiedData);
}

function _classifyData(dataArr) {
  var finished = [];
  var unfishied = [];

  // put the finished item to the bottom
  dataArr.forEach(function (data) {
    return data.finished ? finished.unshift(data) : unfishied.unshift(data);
  });

  return unfishied.concat(finished);
}

function part(randomAphorism, dataArr) {
  _show(dataArr, randomAphorism, _renderPart);
}

function _renderPart(dataArr) {
  return (0, _itemGenerator2.default)(dataArr.reverse());
}

function clear() {
  (0, _clearChildNodes2.default)(document.querySelector('#list'));
}

function sentenceHandler(text) {
  var rendered = (0, _sentenceGenerator2.default)(text);

  document.querySelector('#list').innerHTML = rendered;
}

exports.default = {
  init: init,
  all: all,
  part: part,
  clear: clear,
  sentenceHandler: sentenceHandler
};

},{"../clearChildNodes":1,"../templete/itemGenerator":9,"../templete/sentenceGenerator":10}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function getFormatDate(fmt) {
  var newDate = new Date();
  var o = {
    'y+': newDate.getFullYear(),
    'M+': newDate.getMonth() + 1,
    'd+': newDate.getDate(),
    'h+': newDate.getHours(),
    'm+': newDate.getMinutes()
  };
  var newfmt = fmt;

  Object.keys(o).forEach(function (k) {
    if (new RegExp('(' + k + ')').test(newfmt)) {
      if (k === 'y+') {
        newfmt = newfmt.replace(RegExp.$1, ('' + o[k]).substr(4 - RegExp.$1.length));
      } else if (k === 'S+') {
        var lens = RegExp.$1.length;
        lens = lens === 1 ? 3 : lens;
        newfmt = newfmt.replace(RegExp.$1, ('00' + o[k]).substr(('' + o[k]).length - 1, lens));
      } else {
        newfmt = newfmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
      }
    }
  });
  // for (const k in o) {
  //   if (new RegExp(`(${k})`).test(newfmt)) {
  //     if (k === 'y+') {
  //       newfmt = newfmt.replace(RegExp.$1, (`${o[k]}`).substr(4 - RegExp.$1.length));
  //     } else if (k === 'S+') {
  //       let lens = RegExp.$1.length;
  //       lens = lens === 1 ? 3 : lens;
  //       newfmt = newfmt.replace(RegExp.$1, (`00${o[k]}`).substr((`${o[k]}`).length - 1, lens));
  //     } else {
  //       newfmt = newfmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
  //     }
  //   }
  // }

  return newfmt;
}

exports.default = getFormatDate;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function itemGenerator(dataArr) {
  var template = Handlebars.templates.li;
  var result = dataArr;

  if (!Array.isArray(dataArr)) {
    result = [dataArr];
  }
  var rendered = template({ listItems: result });

  return rendered.trim();
}

exports.default = itemGenerator;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function sentenceGenerator(text) {
  var template = Handlebars.templates.li;
  var rendered = template({ sentence: text });

  return rendered.trim();
}

exports.default = sentenceGenerator;

},{}],11:[function(require,module,exports){
'use strict';

var _addEvents = require('./utlis/dbFail/addEvents');

var _addEvents2 = _interopRequireDefault(_addEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _addEvents2.default)();

},{"./utlis/dbFail/addEvents":2}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANi4xLjAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2NsZWFyQ2hpbGROb2Rlcy5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiRmFpbC9hZGRFdmVudHMuanMiLCJzcmMvc2NyaXB0cy91dGxpcy9kYkZhaWwvZXZlbnRzSGFuZGxlci5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiRmFpbC9yZWZyZXNoLmpzIiwic3JjL3NjcmlwdHMvdXRsaXMvZGJHZW5lcmFsL2FkZEV2ZW50c0dlbmVyYXRvci5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiR2VuZXJhbC9ldmVudHNIYW5kbGVyR2VuZXJhbC5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiR2VuZXJhbC9yZWZyZXNoR2VuZXJhbC5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2dldEZvcm1hdERhdGUuanMiLCJzcmMvc2NyaXB0cy91dGxpcy90ZW1wbGV0ZS9pdGVtR2VuZXJhdG9yLmpzIiwic3JjL3NjcmlwdHMvdXRsaXMvdGVtcGxldGUvc2VudGVuY2VHZW5lcmF0b3IuanMiLCJzcmMvc2NyaXB0cy93aXRob3V0REIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FBLFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUErQjtBQUM3QixTQUFPLEtBQUssYUFBTCxFQUFQLEVBQTZCO0FBQUU7QUFDN0IsU0FBSyxXQUFMLENBQWlCLEtBQUssVUFBdEI7QUFDRDtBQUNEO0FBQ0Q7O2tCQUVjLGU7Ozs7Ozs7OztBQ1BmOzs7O0FBQ0E7Ozs7OztBQUVBLFNBQVMsU0FBVCxHQUFxQjtBQUNuQixTQUFPLEtBQVAsQ0FBYSwyR0FBYjtBQUNBLG9DQUFtQix1QkFBbkI7QUFDRDs7a0JBRWMsUzs7Ozs7Ozs7O0FDUmY7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQUksTUFBTSxDQUFW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dEM7QUFDQSxNQUFNLFdBQVcsU0FBUyxFQUFFLFVBQVUsSUFBWixFQUFULENBQWpCOztBQUVBLFNBQU8sU0FBUyxJQUFULEVBQVA7QUFDRDs7a0JBRWMsaUI7Ozs7O0FDUGY7Ozs7OztBQUVBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZnVuY3Rpb24gY2xlYXJDaGlsZE5vZGVzKHJvb3QpIHtcbiAgd2hpbGUgKHJvb3QuaGFzQ2hpbGROb2RlcygpKSB7IC8vIG9yIHJvb3QuZmlyc3RDaGlsZCBvciByb290Lmxhc3RDaGlsZFxuICAgIHJvb3QucmVtb3ZlQ2hpbGQocm9vdC5maXJzdENoaWxkKTtcbiAgfVxuICAvLyBvciByb290LmlubmVySFRNTCA9ICcnXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsZWFyQ2hpbGROb2RlcztcbiIsImltcG9ydCBhZGRFdmVudHNHZW5lcmF0b3IgZnJvbSAnLi4vZGJHZW5lcmFsL2FkZEV2ZW50c0dlbmVyYXRvcic7XG5pbXBvcnQgZXZlbnRzSGFuZGxlciBmcm9tICcuLi9kYkZhaWwvZXZlbnRzSGFuZGxlcic7XG5cbmZ1bmN0aW9uIGFkZEV2ZW50cygpIHtcbiAgd2luZG93LmFsZXJ0KCdZb3VyIGJyb3dzZXIgZG9lc25cXCd0IHN1cHBvcnQgYSBzdGFibGUgdmVyc2lvbiBvZiBJbmRleGVkREIuIFdlIHdpbGwgb2ZmZXIgeW91IHRoZSB3aXRob3V0IGluZGV4ZWREQiBtb2RlJyk7XG4gIGFkZEV2ZW50c0dlbmVyYXRvcihldmVudHNIYW5kbGVyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWRkRXZlbnRzO1xuIiwiaW1wb3J0IFJlZnJlc2ggZnJvbSAnLi4vZGJGYWlsL3JlZnJlc2gnO1xuaW1wb3J0IEdlbmVyYWwgZnJvbSAnLi4vZGJHZW5lcmFsL2V2ZW50c0hhbmRsZXJHZW5lcmFsJztcbmltcG9ydCBpdGVtR2VuZXJhdG9yIGZyb20gJy4uL3RlbXBsZXRlL2l0ZW1HZW5lcmF0b3InO1xuXG5sZXQgX2lkID0gMDsgLy8gc28gdGhlIGZpcnN0IGl0ZW0ncyBpZCBpcyAxXG5cbmZ1bmN0aW9uIGFkZCgpIHtcbiAgY29uc3QgaW5wdXRWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbnB1dCcpLnZhbHVlO1xuXG4gIGlmIChpbnB1dFZhbHVlID09PSAnJykge1xuICAgIHdpbmRvdy5hbGVydCgncGxlYXNlIGlucHV0IGEgcmVhbCBkYXRhficpO1xuICB9IGVsc2Uge1xuICAgIGFkZEhhbmRsZXIoaW5wdXRWYWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkSGFuZGxlcihpbnB1dFZhbHVlKSB7XG4gIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlzdCcpO1xuXG4gIF9yZW1vdmVSYW5kb20obGlzdCk7XG4gIF9pZCArPSAxO1xuICBjb25zdCBuZXdEYXRhID0gR2VuZXJhbC5kYXRhR2VuZXJhdG9yKF9pZCwgaW5wdXRWYWx1ZSk7XG4gIGxpc3QuaW5zZXJ0QmVmb3JlKGl0ZW1HZW5lcmF0b3IobmV3RGF0YSksIGxpc3QuZmlyc3RDaGlsZCk7IC8vIHB1c2ggbmV3TGkgdG8gZmlyc3RcbiAgR2VuZXJhbC5yZXNldElucHV0KCk7XG59XG5cbmZ1bmN0aW9uIF9yZW1vdmVSYW5kb20obGlzdCkge1xuICBjb25zdCBsaXN0SXRlbXMgPSBsaXN0LmNoaWxkTm9kZXM7XG5cbiAgWy4uLmxpc3RJdGVtc10uZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIGlmIChpdGVtLmNsYXNzTGlzdC5jb250YWlucygnYXBob3Jpc20nKSkge1xuICAgICAgbGlzdC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICB9XG4gIH0pO1xufVxuLy8gb3IgdXNlIGZvci4uLmluXG4vLyBmb3IgKGNvbnN0IGluZGV4IGluIGxpc3RJdGVtcykge1xuLy8gICBpZiAobGlzdEl0ZW1zLmhhc093blByb3BlcnR5KGluZGV4KSkge1xuLy8gICAgIGlmIChsaXN0SXRlbXNbaW5kZXhdLmNsYXNzTGlzdC5jb250YWlucygnYXBob3Jpc20nKSkge1xuLy8gICAgICAgbGlzdC5yZW1vdmVDaGlsZChsaXN0SXRlbXNbaW5kZXhdKTtcbi8vICAgICB9XG4vLyAgIH1cbi8vIH1cblxuZnVuY3Rpb24gZW50ZXJBZGQoZSkge1xuICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xuICAgIGFkZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNob3dBbGwoKSB7XG4gIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlzdCcpO1xuICBjb25zdCBsaXN0SXRlbXMgPSBsaXN0LmNoaWxkTm9kZXM7XG5cbiAgWy4uLmxpc3RJdGVtc10uZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIF93aGV0aGVyQXBwZWFyKGl0ZW0sIHRydWUpO1xuICAgIGlmIChpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZmluaXNoZWQnKSkge1xuICAgICAgbGlzdC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoaXRlbSk7IC8vIFBVTkNITElORTogZHJvcCBkb25lIGl0ZW1cbiAgICB9XG4gIH0pO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAgKi9cbmZ1bmN0aW9uIF93aGV0aGVyQXBwZWFyKGVsZW1lbnQsIHdoZXRoZXIpIHtcbiAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gd2hldGhlciA/ICdibG9jaycgOiAnbm9uZSc7IC8vIEZJWE1FOiBlc2xpbnQgZXJyb3Jcbn1cbi8qIGVzbGludC1lbmFibGUgbm8tcGFyYW0tcmVhc3NpZ24gICovXG5cbmZ1bmN0aW9uIGNsaWNrTGkoeyB0YXJnZXQgfSkge1xuICAvLyB1c2UgZXZlbnQgZGVsZWdhdGlvblxuICBpZiAodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoJ2ZpbmlzaGVkJyk7XG4gICAgc2hvd0FsbCgpO1xuICB9XG59XG5cbi8vIGxpJ3MgW3hdJ3MgZGVsZXRlXG5mdW5jdGlvbiByZW1vdmVMaSh7IHRhcmdldCB9KSB7XG4gIGlmICh0YXJnZXQuY2xhc3NOYW1lID09PSAnY2xvc2UnKSB7IC8vIHVzZSBldmVudCBkZWxlZ2F0aW9uXG4gICAgX3JlbW92ZUxpSGFuZGxlcih0YXJnZXQpO1xuICAgIF9hZGRSYW5kb20oKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfcmVtb3ZlTGlIYW5kbGVyKGVsZW1lbnQpIHtcbiAgLy8gdXNlIHByZXZpb3VzbHkgc3RvcmVkIGRhdGFcbiAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0Jyk7XG4gIGNvbnN0IGxpc3RJdGVtcyA9IGxpc3QuY2hpbGROb2RlcztcbiAgY29uc3QgaWQgPSBlbGVtZW50LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJyk7XG5cbiAgdHJ5IHtcbiAgICBbLi4ubGlzdEl0ZW1zXS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBpZiAoaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSA9PT0gaWQpIHtcbiAgICAgICAgbGlzdC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZygnV3JvbmcgaWQsIG5vdCBmb3VuZCBpbiBET00gdHJlZScpO1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FkZFJhbmRvbSgpIHtcbiAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0Jyk7XG5cbiAgaWYgKCFsaXN0Lmhhc0NoaWxkTm9kZXMoKSB8fCBfYWxsRGlzYXBwZWFyKGxpc3QpKSB7XG4gICAgUmVmcmVzaC5yYW5kb20oKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYWxsRGlzYXBwZWFyKGxpc3QpIHtcbiAgY29uc3QgbGlzdEl0ZW1zID0gbGlzdC5jaGlsZE5vZGVzO1xuXG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuZXZlcnkuY2FsbChsaXN0SXRlbXMsIGl0ZW0gPT4gaXRlbS5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpO1xufVxuXG5mdW5jdGlvbiBzaG93SW5pdCgpIHtcbiAgUmVmcmVzaC5pbml0KCk7XG59XG5cbmZ1bmN0aW9uIHNob3dEb25lKCkge1xuICBfc2hvd1doZXRoZXJEb25lKHRydWUpO1xufVxuXG5mdW5jdGlvbiBzaG93VG9kbygpIHtcbiAgX3Nob3dXaGV0aGVyRG9uZShmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIF9zaG93V2hldGhlckRvbmUod2hldGhlckRvbmUpIHtcbiAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0Jyk7XG4gIGNvbnN0IGxpc3RJdGVtcyA9IGxpc3QuY2hpbGROb2RlcztcblxuICBfcmVtb3ZlUmFuZG9tKGxpc3QpO1xuICBbLi4ubGlzdEl0ZW1zXS5mb3JFYWNoKChpdGVtKSA9PiB7IC8vIEZJWE1FOiBlc2xpbnQgZXJyb3JcbiAgICBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZmluaXNoZWQnKSA/IF93aGV0aGVyQXBwZWFyKGl0ZW0sIHdoZXRoZXJEb25lKSA6IF93aGV0aGVyQXBwZWFyKGl0ZW0sICF3aGV0aGVyRG9uZSk7XG4gIH0pO1xuICBfYWRkUmFuZG9tKCk7XG59XG5cbmZ1bmN0aW9uIHNob3dDbGVhckRvbmUoKSB7XG4gIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlzdCcpO1xuICBjb25zdCBsaXN0SXRlbXMgPSBsaXN0LmNoaWxkTm9kZXM7XG5cbiAgX3JlbW92ZVJhbmRvbShsaXN0KTtcbiAgWy4uLmxpc3RJdGVtc10uZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIGlmIChpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZmluaXNoZWQnKSkge1xuICAgICAgbGlzdC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICB9XG4gIH0pO1xuICBfYWRkUmFuZG9tKCk7XG59XG5cbmZ1bmN0aW9uIHNob3dDbGVhcigpIHtcbiAgUmVmcmVzaC5jbGVhcigpOyAvLyBjbGVhciBub2RlcyB2aXN1YWxseVxuICBSZWZyZXNoLnJhbmRvbSgpO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYWRkLFxuICBlbnRlckFkZCxcbiAgY2xpY2tMaSxcbiAgcmVtb3ZlTGksXG4gIHNob3dJbml0LFxuICBzaG93QWxsLFxuICBzaG93RG9uZSxcbiAgc2hvd1RvZG8sXG4gIHNob3dDbGVhckRvbmUsXG4gIHNob3dDbGVhcixcbn07XG4iLCJpbXBvcnQgR2VuZXJhbCBmcm9tICcuLi9kYkdlbmVyYWwvcmVmcmVzaEdlbmVyYWwnO1xuXG5mdW5jdGlvbiByYW5kb21BcGhvcmlzbSgpIHtcbiAgY29uc3QgYXBob3Jpc21zID0gW1xuICAgICdZZXN0ZXJkYXkgWW91IFNhaWQgVG9tb3Jyb3cnLFxuICAgICdXaHkgYXJlIHdlIGhlcmU/JyxcbiAgICAnQWxsIGluLCBvciBub3RoaW5nJyxcbiAgICAnWW91IE5ldmVyIFRyeSwgWW91IE5ldmVyIEtub3cnLFxuICAgICdUaGUgdW5leGFtaW5lZCBsaWZlIGlzIG5vdCB3b3J0aCBsaXZpbmcuIC0tIFNvY3JhdGVzJyxcbiAgICAnVGhlcmUgaXMgb25seSBvbmUgdGhpbmcgd2Ugc2F5IHRvIGxhenk6IE5PVCBUT0RBWScsXG4gIF07XG4gIGNvbnN0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXBob3Jpc21zLmxlbmd0aCk7XG4gIGNvbnN0IHRleHQgPSBhcGhvcmlzbXNbcmFuZG9tSW5kZXhdO1xuXG4gIEdlbmVyYWwuc2VudGVuY2VIYW5kbGVyKHRleHQpO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdDogR2VuZXJhbC5pbml0LFxuICBjbGVhcjogR2VuZXJhbC5jbGVhcixcbiAgcmFuZG9tOiByYW5kb21BcGhvcmlzbSxcbn07XG4iLCJmdW5jdGlvbiBhZGRFdmVudHNHZW5lcmF0b3IoaGFuZGxlcikge1xuICBoYW5kbGVyLnNob3dJbml0KCk7XG4gIC8vIGFkZCBhbGwgZXZlbnRMaXN0ZW5lclxuICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpc3QnKTtcblxuICBsaXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlci5jbGlja0xpLCBmYWxzZSk7XG4gIGxpc3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyLnJlbW92ZUxpLCBmYWxzZSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVyLmVudGVyQWRkLCBmYWxzZSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhZGQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIuYWRkLCBmYWxzZSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaG93RG9uZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlci5zaG93RG9uZSwgZmFsc2UpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2hvd1RvZG8nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIuc2hvd1RvZG8sIGZhbHNlKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Nob3dBbGwnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIuc2hvd0FsbCwgZmFsc2UpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2hvd0NsZWFyRG9uZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlci5zaG93Q2xlYXJEb25lLCBmYWxzZSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaG93Q2xlYXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIuc2hvd0NsZWFyLCBmYWxzZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFkZEV2ZW50c0dlbmVyYXRvcjtcbiIsImltcG9ydCBnZXRGb3JtYXREYXRlIGZyb20gJy4uL2dldEZvcm1hdERhdGUnO1xuXG5mdW5jdGlvbiByZXNldElucHV0KCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5wdXQnKS52YWx1ZSA9ICcnO1xufVxuXG5mdW5jdGlvbiBkYXRhR2VuZXJhdG9yKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBpZDoga2V5LFxuICAgIGV2ZW50OiB2YWx1ZSxcbiAgICBmaW5pc2hlZDogZmFsc2UsXG4gICAgZGF0ZTogZ2V0Rm9ybWF0RGF0ZSgnTU3mnIhkZOaXpWhoOm1tJyksXG4gIH07XG59XG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICByZXNldElucHV0LFxuICBkYXRhR2VuZXJhdG9yLFxufTtcbiIsImltcG9ydCBpdGVtR2VuZXJhdG9yIGZyb20gJy4uL3RlbXBsZXRlL2l0ZW1HZW5lcmF0b3InO1xuaW1wb3J0IHNlbnRlbmNlR2VuZXJhdG9yIGZyb20gJy4uL3RlbXBsZXRlL3NlbnRlbmNlR2VuZXJhdG9yJztcbmltcG9ydCBjbGVhckNoaWxkTm9kZXMgZnJvbSAnLi4vY2xlYXJDaGlsZE5vZGVzJztcblxuZnVuY3Rpb24gaW5pdChkYXRhQXJyKSB7XG4gIF9zaG93KGRhdGFBcnIsIF9pbml0U2VudGVuY2UsIF9yZW5kZXJBbGwpO1xufVxuXG5mdW5jdGlvbiBfc2hvdyhkYXRhQXJyLCBzaG93U2VudGVuY2VGdW5jLCBnZW5lcmF0ZUZ1bmMpIHtcbiAgaWYgKCFkYXRhQXJyIHx8IGRhdGFBcnIubGVuZ3RoID09PSAwKSB7XG4gICAgc2hvd1NlbnRlbmNlRnVuYygpO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0JykuaW5uZXJIVE1MID0gZ2VuZXJhdGVGdW5jKGRhdGFBcnIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9pbml0U2VudGVuY2UoKSB7XG4gIGNvbnN0IHRleHQgPSAnV2VsY29tZX4sIHRyeSB0byBhZGQgeW91ciBmaXJzdCB0by1kbyBsaXN0IDogKSc7XG5cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpc3QnKS5pbm5lckhUTUwgPSBzZW50ZW5jZUdlbmVyYXRvcih0ZXh0KTtcbn1cblxuZnVuY3Rpb24gYWxsKHJhbmRvbUFwaG9yaXNtLCBkYXRhQXJyKSB7XG4gIF9zaG93KGRhdGFBcnIsIHJhbmRvbUFwaG9yaXNtLCBfcmVuZGVyQWxsKTtcbn1cblxuZnVuY3Rpb24gX3JlbmRlckFsbChkYXRhQXJyKSB7XG4gIGNvbnN0IGNsYXNzaWZpZWREYXRhID0gX2NsYXNzaWZ5RGF0YShkYXRhQXJyKTtcblxuICByZXR1cm4gaXRlbUdlbmVyYXRvcihjbGFzc2lmaWVkRGF0YSk7XG59XG5cbmZ1bmN0aW9uIF9jbGFzc2lmeURhdGEoZGF0YUFycikge1xuICBjb25zdCBmaW5pc2hlZCA9IFtdO1xuICBjb25zdCB1bmZpc2hpZWQgPSBbXTtcblxuICAvLyBwdXQgdGhlIGZpbmlzaGVkIGl0ZW0gdG8gdGhlIGJvdHRvbVxuICBkYXRhQXJyLmZvckVhY2goZGF0YSA9PiAoZGF0YS5maW5pc2hlZCA/IGZpbmlzaGVkLnVuc2hpZnQoZGF0YSkgOiB1bmZpc2hpZWQudW5zaGlmdChkYXRhKSkpO1xuXG4gIHJldHVybiB1bmZpc2hpZWQuY29uY2F0KGZpbmlzaGVkKTtcbn1cblxuZnVuY3Rpb24gcGFydChyYW5kb21BcGhvcmlzbSwgZGF0YUFycikge1xuICBfc2hvdyhkYXRhQXJyLCByYW5kb21BcGhvcmlzbSwgX3JlbmRlclBhcnQpO1xufVxuXG5mdW5jdGlvbiBfcmVuZGVyUGFydChkYXRhQXJyKSB7XG4gIHJldHVybiBpdGVtR2VuZXJhdG9yKGRhdGFBcnIucmV2ZXJzZSgpKTtcbn1cblxuZnVuY3Rpb24gY2xlYXIoKSB7XG4gIGNsZWFyQ2hpbGROb2Rlcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlzdCcpKTtcbn1cblxuZnVuY3Rpb24gc2VudGVuY2VIYW5kbGVyKHRleHQpIHtcbiAgY29uc3QgcmVuZGVyZWQgPSBzZW50ZW5jZUdlbmVyYXRvcih0ZXh0KTtcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlzdCcpLmlubmVySFRNTCA9IHJlbmRlcmVkO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdCxcbiAgYWxsLFxuICBwYXJ0LFxuICBjbGVhcixcbiAgc2VudGVuY2VIYW5kbGVyLFxufTtcbiIsImZ1bmN0aW9uIGdldEZvcm1hdERhdGUoZm10KSB7XG4gIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCBvID0ge1xuICAgICd5Kyc6IG5ld0RhdGUuZ2V0RnVsbFllYXIoKSxcbiAgICAnTSsnOiBuZXdEYXRlLmdldE1vbnRoKCkgKyAxLFxuICAgICdkKyc6IG5ld0RhdGUuZ2V0RGF0ZSgpLFxuICAgICdoKyc6IG5ld0RhdGUuZ2V0SG91cnMoKSxcbiAgICAnbSsnOiBuZXdEYXRlLmdldE1pbnV0ZXMoKSxcbiAgfTtcbiAgbGV0IG5ld2ZtdCA9IGZtdDtcblxuICBPYmplY3Qua2V5cyhvKS5mb3JFYWNoKChrKSA9PiB7XG4gICAgaWYgKG5ldyBSZWdFeHAoYCgke2t9KWApLnRlc3QobmV3Zm10KSkge1xuICAgICAgaWYgKGsgPT09ICd5KycpIHtcbiAgICAgICAgbmV3Zm10ID0gbmV3Zm10LnJlcGxhY2UoUmVnRXhwLiQxLCAoYCR7b1trXX1gKS5zdWJzdHIoNCAtIFJlZ0V4cC4kMS5sZW5ndGgpKTtcbiAgICAgIH0gZWxzZSBpZiAoayA9PT0gJ1MrJykge1xuICAgICAgICBsZXQgbGVucyA9IFJlZ0V4cC4kMS5sZW5ndGg7XG4gICAgICAgIGxlbnMgPSBsZW5zID09PSAxID8gMyA6IGxlbnM7XG4gICAgICAgIG5ld2ZtdCA9IG5ld2ZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKGAwMCR7b1trXX1gKS5zdWJzdHIoKGAke29ba119YCkubGVuZ3RoIC0gMSwgbGVucykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Zm10ID0gbmV3Zm10LnJlcGxhY2UoUmVnRXhwLiQxLCAoUmVnRXhwLiQxLmxlbmd0aCA9PT0gMSkgPyAob1trXSkgOiAoKGAwMCR7b1trXX1gKS5zdWJzdHIoKGAke29ba119YCkubGVuZ3RoKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIC8vIGZvciAoY29uc3QgayBpbiBvKSB7XG4gIC8vICAgaWYgKG5ldyBSZWdFeHAoYCgke2t9KWApLnRlc3QobmV3Zm10KSkge1xuICAvLyAgICAgaWYgKGsgPT09ICd5KycpIHtcbiAgLy8gICAgICAgbmV3Zm10ID0gbmV3Zm10LnJlcGxhY2UoUmVnRXhwLiQxLCAoYCR7b1trXX1gKS5zdWJzdHIoNCAtIFJlZ0V4cC4kMS5sZW5ndGgpKTtcbiAgLy8gICAgIH0gZWxzZSBpZiAoayA9PT0gJ1MrJykge1xuICAvLyAgICAgICBsZXQgbGVucyA9IFJlZ0V4cC4kMS5sZW5ndGg7XG4gIC8vICAgICAgIGxlbnMgPSBsZW5zID09PSAxID8gMyA6IGxlbnM7XG4gIC8vICAgICAgIG5ld2ZtdCA9IG5ld2ZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKGAwMCR7b1trXX1gKS5zdWJzdHIoKGAke29ba119YCkubGVuZ3RoIC0gMSwgbGVucykpO1xuICAvLyAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgbmV3Zm10ID0gbmV3Zm10LnJlcGxhY2UoUmVnRXhwLiQxLCAoUmVnRXhwLiQxLmxlbmd0aCA9PT0gMSkgPyAob1trXSkgOiAoKGAwMCR7b1trXX1gKS5zdWJzdHIoKGAke29ba119YCkubGVuZ3RoKSkpO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gfVxuXG4gIHJldHVybiBuZXdmbXQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldEZvcm1hdERhdGU7XG4iLCJmdW5jdGlvbiBpdGVtR2VuZXJhdG9yKGRhdGFBcnIpIHtcbiAgY29uc3QgdGVtcGxhdGUgPSBIYW5kbGViYXJzLnRlbXBsYXRlcy5saTtcbiAgbGV0IHJlc3VsdCA9IGRhdGFBcnI7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGFBcnIpKSB7XG4gICAgcmVzdWx0ID0gW2RhdGFBcnJdO1xuICB9XG4gIGNvbnN0IHJlbmRlcmVkID0gdGVtcGxhdGUoeyBsaXN0SXRlbXM6IHJlc3VsdCB9KTtcblxuICByZXR1cm4gcmVuZGVyZWQudHJpbSgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpdGVtR2VuZXJhdG9yO1xuIiwiZnVuY3Rpb24gc2VudGVuY2VHZW5lcmF0b3IodGV4dCkge1xuICBjb25zdCB0ZW1wbGF0ZSA9IEhhbmRsZWJhcnMudGVtcGxhdGVzLmxpO1xuICBjb25zdCByZW5kZXJlZCA9IHRlbXBsYXRlKHsgc2VudGVuY2U6IHRleHQgfSk7XG5cbiAgcmV0dXJuIHJlbmRlcmVkLnRyaW0oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2VudGVuY2VHZW5lcmF0b3I7XG4iLCJpbXBvcnQgYWRkRXZlbnRzIGZyb20gJy4vdXRsaXMvZGJGYWlsL2FkZEV2ZW50cyc7XG5cbmFkZEV2ZW50cygpO1xuIl19

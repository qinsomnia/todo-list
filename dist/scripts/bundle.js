(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./utlis/log');

var _log2 = _interopRequireDefault(_log);

var _crud = require('./utlis/crud');

var _crud2 = _interopRequireDefault(_crud);

var _getAllRequest = require('./utlis/getAllRequest');

var _getAllRequest2 = _interopRequireDefault(_getAllRequest);

var _parseJSONData = require('./utlis/parseJSONData');

var _parseJSONData2 = _interopRequireDefault(_parseJSONData);

var _promiseGenerator = require('./utlis/promiseGenerator');

var _promiseGenerator2 = _interopRequireDefault(_promiseGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _db = void 0;
var _defaultStoreName = void 0;
var _presentKey = {}; // store multi-objectStore's presentKey

/* first step, open it and use others API */

var open = function open(config) {
  return new Promise(function (resolve, reject) {
    if (window.indexedDB) {
      _openHandler(config, resolve);
    } else {
      _log2.default.fail('Your browser doesn\'t support a stable version of IndexedDB. You can install latest Chrome or FireFox to handler it');
      reject();
    }
  });
};

/* synchronous API */

var getLength = function getLength() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;
  return _presentKey[storeName];
};

var getNewKey = function getNewKey() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;

  _presentKey[storeName] += 1;

  return _presentKey[storeName];
};

/* asynchronous API: crud methods */

var getItem = function getItem(key) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.get(_db, key, storeName);
};

var getConditionItem = function getConditionItem(condition, whether) {
  var storeName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultStoreName;
  return _crud2.default.getCondition(_db, condition, whether, storeName);
};

var getAll = function getAll() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;
  return _crud2.default.getAll(_db, storeName);
};

var addItem = function addItem(newData) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.add(_db, newData, storeName);
};

var removeItem = function removeItem(key) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.remove(_db, key, storeName);
};

var removeConditionItem = function removeConditionItem(condition, whether) {
  var storeName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultStoreName;
  return _crud2.default.removeCondition(_db, condition, whether, storeName);
};

var clear = function clear() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;
  return _crud2.default.clear(_db, storeName);
};

var updateItem = function updateItem(newData) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.update(_db, newData, storeName);
};

/* handle DB.open */

function _openHandler(config, successCallback) {
  var openRequest = window.indexedDB.open(config.name, config.version); // open indexedDB

  // an onblocked event is fired until they are closed or reloaded
  openRequest.onblocked = function () {
    // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
    _log2.default.fail('Please close all other tabs with this site open');
  };

  // Creating or updating the version of the database
  openRequest.onupgradeneeded = function (_ref) {
    var target = _ref.target;

    // All other databases have been closed. Set everything up.
    _db = target.result;
    _log2.default.success('onupgradeneeded in');
    _createObjectStoreHandler(config.storeConfig);
  };

  openRequest.onsuccess = function (_ref2) {
    var target = _ref2.target;

    _db = target.result;
    _db.onversionchange = function () {
      _db.close();
      _log2.default.fail('A new version of this page is ready. Please reload');
    };
    _openSuccessCallbackHandler(config.storeConfig, successCallback);
  };

  // use error events bubble to handle all error events
  openRequest.onerror = function (_ref3) {
    var target = _ref3.target;

    _log2.default.fail('Something is wrong with indexedDB, for more information, checkout console');
    _log2.default.fail(target.error);
    throw new Error(target.error);
  };
}

function _openSuccessCallbackHandler(configStoreConfig, successCallback) {
  var objectStoreList = (0, _parseJSONData2.default)(configStoreConfig, 'storeName');

  objectStoreList.forEach(function (storeConfig, index) {
    if (index === 0) {
      _defaultStoreName = storeConfig.storeName; // PUNCHLINE: the last storeName is defaultStoreName
    }
    if (index === objectStoreList.length - 1) {
      _getPresentKey(storeConfig.storeName, function () {
        successCallback();
        _log2.default.success('open indexedDB success');
      });
    } else {
      _getPresentKey(storeConfig.storeName);
    }
  });
}

// set present key value to _presentKey (the private property)
function _getPresentKey(storeName, successCallback) {
  var transaction = _db.transaction([storeName]);
  var successMessage = 'now ' + storeName + ' \'s max key is ' + _presentKey[storeName]; // initial value is 0

  _presentKey[storeName] = 0;
  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref4) {
    var target = _ref4.target;

    var cursor = target.result;

    if (cursor) {
      _presentKey[storeName] = cursor.value.id;
      cursor.continue();
    }
  };
  _promiseGenerator2.default.transaction(transaction, successMessage).then(successCallback);
}

function _createObjectStoreHandler(configStoreConfig) {
  (0, _parseJSONData2.default)(configStoreConfig, 'storeName').forEach(function (storeConfig) {
    if (!_db.objectStoreNames.contains(storeConfig.storeName)) {
      _createObjectStore(storeConfig);
    }
  });
}

function _createObjectStore(_ref5) {
  var storeName = _ref5.storeName,
      key = _ref5.key,
      initialData = _ref5.initialData;

  var store = _db.createObjectStore(storeName, { keyPath: key, autoIncrement: true });
  var transaction = store.transaction;

  var successMessage = 'create ' + storeName + ' \'s object store succeed';

  _promiseGenerator2.default.transaction(transaction, successMessage).then(function () {
    if (initialData) {
      // Store initial values in the newly created object store.
      _initialDataHandler(storeName, initialData);
    }
  });
}

function _initialDataHandler(storeName, initialData) {
  var transaction = _db.transaction([storeName], 'readwrite');
  var objectStore = transaction.objectStore(storeName);
  var successMessage = 'add all ' + storeName + ' \'s initial data done';

  (0, _parseJSONData2.default)(initialData, 'initial').forEach(function (data, index) {
    var addRequest = objectStore.add(data);

    addRequest.onsuccess = function () {
      _log2.default.success('add initial data[' + index + '] successed');
    };
  });
  _promiseGenerator2.default.transaction(transaction, successMessage).then(function () {
    _getPresentKey(storeName);
  });
}

exports.default = {
  open: open,
  getLength: getLength,
  getNewKey: getNewKey,
  getItem: getItem,
  getConditionItem: getConditionItem,
  getAll: getAll,
  addItem: addItem,
  removeItem: removeItem,
  removeConditionItem: removeConditionItem,
  clear: clear,
  updateItem: updateItem
};

},{"./utlis/crud":2,"./utlis/getAllRequest":3,"./utlis/log":4,"./utlis/parseJSONData":5,"./utlis/promiseGenerator":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promiseGenerator = require('./promiseGenerator');

var _promiseGenerator2 = _interopRequireDefault(_promiseGenerator);

var _getAllRequest = require('./getAllRequest');

var _getAllRequest2 = _interopRequireDefault(_getAllRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(dbValue, key, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var getRequest = transaction.objectStore(storeName).get(parseInt(key, 10)); // get it by index
  var successMessage = 'get ' + storeName + '\'s ' + getRequest.source.keyPath + ' = ' + key + ' data success';
  var data = { property: 'result' };

  return _promiseGenerator2.default.request(getRequest, successMessage, data);
}

// get conditional data (boolean condition)
function getCondition(dbValue, condition, whether, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var result = []; // use an array to storage eligible data
  var successMessage = 'get ' + storeName + '\'s ' + condition + ' = ' + whether + ' data success';

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref) {
    var target = _ref.target;

    var cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        result.push(cursor.value);
      }
      cursor.continue();
    }
  };

  return _promiseGenerator2.default.transaction(transaction, successMessage, result);
}

function getAll(dbValue, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var result = [];
  var successMessage = 'get ' + storeName + '\'s all data success';

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref2) {
    var target = _ref2.target;

    var cursor = target.result;

    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    }
  };

  return _promiseGenerator2.default.transaction(transaction, successMessage, result);
}

function add(dbValue, newData, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var addRequest = transaction.objectStore(storeName).add(newData);
  var successMessage = 'add ' + storeName + '\'s ' + addRequest.source.keyPath + '  = ' + newData[addRequest.source.keyPath] + ' data succeed';

  return _promiseGenerator2.default.request(addRequest, successMessage, newData);
}

function remove(dbValue, key, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var deleteRequest = transaction.objectStore(storeName).delete(key);
  var successMessage = 'remove ' + storeName + '\'s  ' + deleteRequest.source.keyPath + ' = ' + key + ' data success';

  return _promiseGenerator2.default.request(deleteRequest, successMessage, key);
}

function removeCondition(dbValue, condition, whether, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var successMessage = 'remove ' + storeName + '\'s ' + condition + ' = ' + whether + ' data success';

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref3) {
    var target = _ref3.target;

    var cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        cursor.delete();
      }
      cursor.continue();
    }
  };

  return _promiseGenerator2.default.transaction(transaction, successMessage);
}

function clear(dbValue, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var successMessage = 'clear ' + storeName + '\'s all data success';

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref4) {
    var target = _ref4.target;

    var cursor = target.result;

    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  return _promiseGenerator2.default.transaction(transaction, successMessage);
}

function update(dbValue, newData, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var putRequest = transaction.objectStore(storeName).put(newData);
  var successMessage = 'update ' + storeName + '\'s ' + putRequest.source.keyPath + '  = ' + newData[putRequest.source.keyPath] + ' data success';

  return _promiseGenerator2.default.request(putRequest, successMessage, newData);
}

exports.default = {
  get: get,
  getCondition: getCondition,
  getAll: getAll,
  add: add,
  remove: remove,
  removeCondition: removeCondition,
  clear: clear,
  update: update
};

},{"./getAllRequest":3,"./promiseGenerator":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getAllRequest = function getAllRequest(transaction, storeName) {
  return transaction.objectStore(storeName).openCursor(IDBKeyRange.lowerBound(1), 'next');
};

exports.default = getAllRequest;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var log = {
  success: function success(message) {
    console.log("\u2713 " + message + " :)");
  },
  fail: function fail(message) {
    console.log("\u2714 " + message);
  }
};

exports.default = log;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var parseJSONData = function parseJSONData(rawdata, name) {
  try {
    var parsedData = JSON.parse(JSON.stringify(rawdata));

    return parsedData;
  } catch (error) {
    window.alert("please set correct " + name + " array object");
    console.log(error);
    throw error;
  }
};

exports.default = parseJSONData;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestPromise = function requestPromise(request, successMessage, data) {
  return new Promise(function (resolve, reject) {
    request.onsuccess = function () {
      var successData = data;

      if (data.property) {
        successData = request[data.property]; // for getItem
      }
      _log2.default.success(successMessage);
      resolve(successData);
    };
    request.onerror = function () {
      _log2.default.fail(request.error);
      reject();
    };
  });
};

var transactionPromise = function transactionPromise(transaction, successMessage, data) {
  return new Promise(function (resolve, reject) {
    transaction.oncomplete = function () {
      _log2.default.success(successMessage);
      resolve(data);
    };
    transaction.onerror = function () {
      _log2.default.fail(transaction.error);
      reject();
    };
  });
};

exports.default = {
  request: requestPromise,
  transaction: transactionPromise
};

},{"./log":4}],7:[function(require,module,exports){
'use strict';
module.exports = require('./dist/indexeddb-crud')['default'];

},{"./dist/indexeddb-crud":1}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'JustToDo',
  version: '23',
  storeConfig: [{
    storeName: 'list',
    key: 'id',
    initialData: [{
      id: 0, event: 'JustDemo', finished: true, date: 0
    }]
  }, {
    storeName: 'aphorism',
    key: 'id',
    initialData: [{
      id: 1,
      content: "You're better than that"
    }, {
      id: 2,
      content: 'Yesterday You Said Tomorrow'
    }, {
      id: 3,
      content: 'Why are we here?'
    }, {
      id: 4,
      content: 'All in, or nothing'
    }, {
      id: 5,
      content: 'You Never Try, You Never Know'
    }, {
      id: 6,
      content: 'The unexamined life is not worth living. -- Socrates'
    }, {
      id: 7,
      content: 'There is only one thing we say to lazy: NOT TODAY'
    }]
  }]
};

},{}],9:[function(require,module,exports){
'use strict';

var _indexeddbCrud = require('indexeddb-crud');

var _config = require('./db/config');

var _config2 = _interopRequireDefault(_config);

var _template = require('../templete/template');

var _template2 = _interopRequireDefault(_template);

var _addEvents = require('./utlis/dbSuccess/addEvents');

var _addEvents2 = _interopRequireDefault(_addEvents);

var _lazyLoadWithoutDB = require('./utlis/lazyLoadWithoutDB');

var _lazyLoadWithoutDB2 = _interopRequireDefault(_lazyLoadWithoutDB);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _template2.default)();
// open DB, and when DB open succeed, invoke initial function
// when failed, change to withoutDB mode
(0, _indexeddbCrud.open)(_config2.default).then(_addEvents2.default).catch(_lazyLoadWithoutDB2.default);

},{"../templete/template":21,"./db/config":8,"./utlis/dbSuccess/addEvents":14,"./utlis/lazyLoadWithoutDB":18,"indexeddb-crud":7}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"../getFormatDate":17}],13:[function(require,module,exports){
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

},{"../clearChildNodes":10,"../templete/itemGenerator":19,"../templete/sentenceGenerator":20}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addEventsGenerator = require('../dbGeneral/addEventsGenerator');

var _addEventsGenerator2 = _interopRequireDefault(_addEventsGenerator);

var _eventsHandler = require('../dbSuccess/eventsHandler');

var _eventsHandler2 = _interopRequireDefault(_eventsHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addEvents() {
  (0, _addEventsGenerator2.default)(_eventsHandler2.default);
}

exports.default = addEvents;

},{"../dbGeneral/addEventsGenerator":11,"../dbSuccess/eventsHandler":15}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _indexeddbCrud = require('indexeddb-crud');

var _indexeddbCrud2 = _interopRequireDefault(_indexeddbCrud);

var _refresh = require('../dbSuccess/refresh');

var _refresh2 = _interopRequireDefault(_refresh);

var _eventsHandlerGeneral = require('../dbGeneral/eventsHandlerGeneral');

var _eventsHandlerGeneral2 = _interopRequireDefault(_eventsHandlerGeneral);

var _itemGenerator = require('../templete/itemGenerator');

var _itemGenerator2 = _interopRequireDefault(_itemGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function add() {
  var inputValue = document.querySelector('#input').value;

  if (inputValue === '') {
    window.alert('please input a real data~');
  } else {
    _addHandler(inputValue);
  }
}

function _addHandler(inputValue) {
  var newData = _eventsHandlerGeneral2.default.dataGenerator(_indexeddbCrud2.default.getNewKey(), inputValue);
  var rendered = (0, _itemGenerator2.default)(newData);

  removeInit();
  document.querySelector('#list').insertAdjacentHTML('afterbegin', rendered); // PUNCHLINE: use insertAdjacentHTML
  _eventsHandlerGeneral2.default.resetInput();
  _indexeddbCrud2.default.addItem(newData);
}

function removeInit() {
  var list = document.querySelector('#list');

  if (list.firstChild.className === 'aphorism') {
    list.removeChild(list.firstChild);
  }
}

function enterAdd(_ref) {
  var keyCode = _ref.keyCode;

  if (keyCode === 13) {
    add();
  }
}

function clickLi(_ref2) {
  var target = _ref2.target;

  // use event delegation
  if (!target.classList.contains('aphorism')) {
    if (target.getAttribute('data-id')) {
      // test whether is x
      target.classList.toggle('finished'); // toggle appearance

      // use previously stored data-id attribute
      var id = parseInt(target.getAttribute('data-id'), 10);

      _indexeddbCrud2.default.getItem(id).then(_toggleLi);
    }
  }
}

function _toggleLi(data) {
  var newData = data;

  newData.finished = !data.finished;
  _indexeddbCrud2.default.updateItem(newData).then(showAll);
}

// li's [x]'s delete
function removeLi(_ref3) {
  var target = _ref3.target;

  if (target.className === 'close') {
    // use event delegation
    // delete visually
    document.querySelector('#list').removeChild(target.parentNode);
    _addRandom();
    // use previously stored data
    var id = parseInt(target.parentNode.getAttribute('data-id'), 10);
    // delete actually
    _indexeddbCrud2.default.removeItem(id);
  }
}

// for Semantic
function _addRandom() {
  var list = document.querySelector('#list');

  // because of the handlerbas.templete, add this inspect
  if (!list.lastChild || list.lastChild.nodeName === '#text') {
    _refresh2.default.random();
  }
}

function showInit() {
  _indexeddbCrud2.default.getAll().then(_refresh2.default.init);
}

function showAll() {
  _indexeddbCrud2.default.getAll().then(_refresh2.default.all);
}

function showDone() {
  _showWhetherDone(true);
}

function showTodo() {
  _showWhetherDone(false);
}

function _showWhetherDone(whetherDone) {
  var condition = 'finished';

  _indexeddbCrud2.default.getConditionItem(condition, whetherDone).then(_refresh2.default.part);
}

function showClearDone() {
  var condition = 'finished';

  _indexeddbCrud2.default.removeConditionItem(condition, true).then(_indexeddbCrud2.default.getAll).then(_refresh2.default.part);
}

function showClear() {
  _refresh2.default.clear(); // clear nodes visually
  _indexeddbCrud2.default.clear().then(_refresh2.default.random); // clear data indeed
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

},{"../dbGeneral/eventsHandlerGeneral":12,"../dbSuccess/refresh":16,"../templete/itemGenerator":19,"indexeddb-crud":7}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _indexeddbCrud = require('indexeddb-crud');

var _indexeddbCrud2 = _interopRequireDefault(_indexeddbCrud);

var _refreshGeneral = require('../dbGeneral/refreshGeneral');

var _refreshGeneral2 = _interopRequireDefault(_refreshGeneral);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function randomAphorism() {
  var storeName = 'aphorism';
  var randomIndex = Math.ceil(Math.random() * _indexeddbCrud2.default.getLength(storeName));

  _indexeddbCrud2.default.getItem(randomIndex, storeName).then(_parseText);
}

function _parseText(data) {
  var text = data.content;

  _refreshGeneral2.default.sentenceHandler(text);
}

exports.default = {
  init: _refreshGeneral2.default.init,
  all: _refreshGeneral2.default.all.bind(null, randomAphorism), // PUNCHLINE: use bind to pass paramter
  part: _refreshGeneral2.default.part.bind(null, randomAphorism),
  clear: _refreshGeneral2.default.clear,
  random: randomAphorism
};

},{"../dbGeneral/refreshGeneral":13,"indexeddb-crud":7}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function lazyLoadWithoutDB() {
  var element = document.createElement('script');

  element.type = 'text/javascript';
  element.async = true;
  element.src = './dist/scripts/lazyLoad.min.js';
  document.body.appendChild(element);
}

exports.default = lazyLoadWithoutDB;

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function template() {
  var template = Handlebars.template,
      templates = Handlebars.templates = Handlebars.templates || {};
  templates['li'] = template({ "1": function _(container, depth0, helpers, partials, data) {
      var helper;

      return "  <li class=\"aphorism\">" + container.escapeExpression((helper = (helper = helpers.sentence || (depth0 != null ? depth0.sentence : depth0)) != null ? helper : helpers.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, { "name": "sentence", "hash": {}, "data": data }) : helper)) + "</li>\n";
    }, "3": function _(container, depth0, helpers, partials, data) {
      var stack1;

      return (stack1 = helpers.each.call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? depth0.listItems : depth0, { "name": "each", "hash": {}, "fn": container.program(4, data, 0), "inverse": container.noop, "data": data })) != null ? stack1 : "";
    }, "4": function _(container, depth0, helpers, partials, data) {
      var stack1;

      return (stack1 = helpers["if"].call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? depth0.finished : depth0, { "name": "if", "hash": {}, "fn": container.program(5, data, 0), "inverse": container.program(7, data, 0), "data": data })) != null ? stack1 : "";
    }, "5": function _(container, depth0, helpers, partials, data) {
      var helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = helpers.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression;

      return "      <li class=\"finished\" data-id=" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + ">\n        " + alias4((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : alias2, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "date", "hash": {}, "data": data }) : helper)) + " : \n        <span>" + alias4((helper = (helper = helpers.event || (depth0 != null ? depth0.event : depth0)) != null ? helper : alias2, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "event", "hash": {}, "data": data }) : helper)) + "</span>\n        <span class=\"close\">×</span>\n      </li>\n";
    }, "7": function _(container, depth0, helpers, partials, data) {
      var helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = helpers.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression;

      return "      <li data-id=" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + ">\n        " + alias4((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : alias2, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "date", "hash": {}, "data": data }) : helper)) + " : \n        <span>" + alias4((helper = (helper = helpers.event || (depth0 != null ? depth0.event : depth0)) != null ? helper : alias2, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "event", "hash": {}, "data": data }) : helper)) + "</span>\n        <span class=\"close\">×</span>\n      </li>\n";
    }, "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
      var stack1;

      return (stack1 = helpers["if"].call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? depth0.sentence : depth0, { "name": "if", "hash": {}, "fn": container.program(1, data, 0), "inverse": container.program(3, data, 0), "data": data })) != null ? stack1 : "";
    }, "useData": true });
};

exports.default = template;

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANi4xLjAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9pbmRleGVkZGItY3J1ZEA1LjMuMC9ub2RlX21vZHVsZXMvaW5kZXhlZGRiLWNydWQvZGlzdC9pbmRleGVkZGItY3J1ZC5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9pbmRleGVkZGItY3J1ZEA1LjMuMC9ub2RlX21vZHVsZXMvaW5kZXhlZGRiLWNydWQvZGlzdC91dGxpcy9jcnVkLmpzIiwibm9kZV9tb2R1bGVzLy5wbnBtL2luZGV4ZWRkYi1jcnVkQDUuMy4wL25vZGVfbW9kdWxlcy9pbmRleGVkZGItY3J1ZC9kaXN0L3V0bGlzL2dldEFsbFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvLnBucG0vaW5kZXhlZGRiLWNydWRANS4zLjAvbm9kZV9tb2R1bGVzL2luZGV4ZWRkYi1jcnVkL2Rpc3QvdXRsaXMvbG9nLmpzIiwibm9kZV9tb2R1bGVzLy5wbnBtL2luZGV4ZWRkYi1jcnVkQDUuMy4wL25vZGVfbW9kdWxlcy9pbmRleGVkZGItY3J1ZC9kaXN0L3V0bGlzL3BhcnNlSlNPTkRhdGEuanMiLCJub2RlX21vZHVsZXMvLnBucG0vaW5kZXhlZGRiLWNydWRANS4zLjAvbm9kZV9tb2R1bGVzL2luZGV4ZWRkYi1jcnVkL2Rpc3QvdXRsaXMvcHJvbWlzZUdlbmVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9pbmRleGVkZGItY3J1ZEA1LjMuMC9ub2RlX21vZHVsZXMvaW5kZXhlZGRiLWNydWQvaW5kZXguanMiLCJzcmMvc2NyaXB0cy9kYi9jb25maWcuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwic3JjL3NjcmlwdHMvdXRsaXMvY2xlYXJDaGlsZE5vZGVzLmpzIiwic3JjL3NjcmlwdHMvdXRsaXMvZGJHZW5lcmFsL2FkZEV2ZW50c0dlbmVyYXRvci5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiR2VuZXJhbC9ldmVudHNIYW5kbGVyR2VuZXJhbC5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiR2VuZXJhbC9yZWZyZXNoR2VuZXJhbC5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiU3VjY2Vzcy9hZGRFdmVudHMuanMiLCJzcmMvc2NyaXB0cy91dGxpcy9kYlN1Y2Nlc3MvZXZlbnRzSGFuZGxlci5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2RiU3VjY2Vzcy9yZWZyZXNoLmpzIiwic3JjL3NjcmlwdHMvdXRsaXMvZ2V0Rm9ybWF0RGF0ZS5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL2xhenlMb2FkV2l0aG91dERCLmpzIiwic3JjL3NjcmlwdHMvdXRsaXMvdGVtcGxldGUvaXRlbUdlbmVyYXRvci5qcyIsInNyYy9zY3JpcHRzL3V0bGlzL3RlbXBsZXRlL3NlbnRlbmNlR2VuZXJhdG9yLmpzIiwic3JjL3RlbXBsZXRlL3RlbXBsYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QWtDLFFBQWxDLEVBQTJDLElBQTNDLEVBQWlEO0FBQ2hGLFVBQUksTUFBSjs7QUFFRixhQUFRLENBQUMsU0FBUyxRQUFRLElBQVIsRUFBYyxJQUFkLENBQW1CLFVBQVUsSUFBVixHQUFpQixNQUFqQixHQUEyQixVQUFVLFdBQVYsSUFBeUIsRUFBdkUsRUFBNEUsVUFBVSxJQUFWLEdBQWlCLE9BQU8sUUFBeEIsR0FBbUMsTUFBL0csRUFBdUgsRUFBQyxRQUFPLElBQVIsRUFBYSxRQUFPLEVBQXBCLEVBQXVCLE1BQUssVUFBVSxPQUFWLENBQWtCLENBQWxCLEVBQXFCLElBQXJCLEVBQTJCLENBQTNCLENBQTVCLEVBQTBELFdBQVUsVUFBVSxPQUFWLENBQWtCLENBQWxCLEVBQXFCLElBQXJCLEVBQTJCLENBQTNCLENBQXBFLEVBQWtHLFFBQU8sSUFBekcsRUFBdkgsQ0FBVixLQUFxUCxJQUFyUCxHQUE0UCxNQUE1UCxHQUFxUSxFQUE3UTtBQUNELEtBdEMwQixFQXNDekIsV0FBVSxJQXRDZSxFQUFULENBQWxCO0FBdUNDOztrQkFFYyxRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2xvZyA9IHJlcXVpcmUoJy4vdXRsaXMvbG9nJyk7XG5cbnZhciBfbG9nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xvZyk7XG5cbnZhciBfY3J1ZCA9IHJlcXVpcmUoJy4vdXRsaXMvY3J1ZCcpO1xuXG52YXIgX2NydWQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3J1ZCk7XG5cbnZhciBfZ2V0QWxsUmVxdWVzdCA9IHJlcXVpcmUoJy4vdXRsaXMvZ2V0QWxsUmVxdWVzdCcpO1xuXG52YXIgX2dldEFsbFJlcXVlc3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0QWxsUmVxdWVzdCk7XG5cbnZhciBfcGFyc2VKU09ORGF0YSA9IHJlcXVpcmUoJy4vdXRsaXMvcGFyc2VKU09ORGF0YScpO1xuXG52YXIgX3BhcnNlSlNPTkRhdGEyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGFyc2VKU09ORGF0YSk7XG5cbnZhciBfcHJvbWlzZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vdXRsaXMvcHJvbWlzZUdlbmVyYXRvcicpO1xuXG52YXIgX3Byb21pc2VHZW5lcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvbWlzZUdlbmVyYXRvcik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBfZGIgPSB2b2lkIDA7XG52YXIgX2RlZmF1bHRTdG9yZU5hbWUgPSB2b2lkIDA7XG52YXIgX3ByZXNlbnRLZXkgPSB7fTsgLy8gc3RvcmUgbXVsdGktb2JqZWN0U3RvcmUncyBwcmVzZW50S2V5XG5cbi8qIGZpcnN0IHN0ZXAsIG9wZW4gaXQgYW5kIHVzZSBvdGhlcnMgQVBJICovXG5cbnZhciBvcGVuID0gZnVuY3Rpb24gb3Blbihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAod2luZG93LmluZGV4ZWREQikge1xuICAgICAgX29wZW5IYW5kbGVyKGNvbmZpZywgcmVzb2x2ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9sb2cyLmRlZmF1bHQuZmFpbCgnWW91ciBicm93c2VyIGRvZXNuXFwndCBzdXBwb3J0IGEgc3RhYmxlIHZlcnNpb24gb2YgSW5kZXhlZERCLiBZb3UgY2FuIGluc3RhbGwgbGF0ZXN0IENocm9tZSBvciBGaXJlRm94IHRvIGhhbmRsZXIgaXQnKTtcbiAgICAgIHJlamVjdCgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKiBzeW5jaHJvbm91cyBBUEkgKi9cblxudmFyIGdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCgpIHtcbiAgdmFyIHN0b3JlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogX2RlZmF1bHRTdG9yZU5hbWU7XG4gIHJldHVybiBfcHJlc2VudEtleVtzdG9yZU5hbWVdO1xufTtcblxudmFyIGdldE5ld0tleSA9IGZ1bmN0aW9uIGdldE5ld0tleSgpIHtcbiAgdmFyIHN0b3JlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogX2RlZmF1bHRTdG9yZU5hbWU7XG5cbiAgX3ByZXNlbnRLZXlbc3RvcmVOYW1lXSArPSAxO1xuXG4gIHJldHVybiBfcHJlc2VudEtleVtzdG9yZU5hbWVdO1xufTtcblxuLyogYXN5bmNocm9ub3VzIEFQSTogY3J1ZCBtZXRob2RzICovXG5cbnZhciBnZXRJdGVtID0gZnVuY3Rpb24gZ2V0SXRlbShrZXkpIHtcbiAgdmFyIHN0b3JlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogX2RlZmF1bHRTdG9yZU5hbWU7XG4gIHJldHVybiBfY3J1ZDIuZGVmYXVsdC5nZXQoX2RiLCBrZXksIHN0b3JlTmFtZSk7XG59O1xuXG52YXIgZ2V0Q29uZGl0aW9uSXRlbSA9IGZ1bmN0aW9uIGdldENvbmRpdGlvbkl0ZW0oY29uZGl0aW9uLCB3aGV0aGVyKSB7XG4gIHZhciBzdG9yZU5hbWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IF9kZWZhdWx0U3RvcmVOYW1lO1xuICByZXR1cm4gX2NydWQyLmRlZmF1bHQuZ2V0Q29uZGl0aW9uKF9kYiwgY29uZGl0aW9uLCB3aGV0aGVyLCBzdG9yZU5hbWUpO1xufTtcblxudmFyIGdldEFsbCA9IGZ1bmN0aW9uIGdldEFsbCgpIHtcbiAgdmFyIHN0b3JlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogX2RlZmF1bHRTdG9yZU5hbWU7XG4gIHJldHVybiBfY3J1ZDIuZGVmYXVsdC5nZXRBbGwoX2RiLCBzdG9yZU5hbWUpO1xufTtcblxudmFyIGFkZEl0ZW0gPSBmdW5jdGlvbiBhZGRJdGVtKG5ld0RhdGEpIHtcbiAgdmFyIHN0b3JlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogX2RlZmF1bHRTdG9yZU5hbWU7XG4gIHJldHVybiBfY3J1ZDIuZGVmYXVsdC5hZGQoX2RiLCBuZXdEYXRhLCBzdG9yZU5hbWUpO1xufTtcblxudmFyIHJlbW92ZUl0ZW0gPSBmdW5jdGlvbiByZW1vdmVJdGVtKGtleSkge1xuICB2YXIgc3RvcmVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBfZGVmYXVsdFN0b3JlTmFtZTtcbiAgcmV0dXJuIF9jcnVkMi5kZWZhdWx0LnJlbW92ZShfZGIsIGtleSwgc3RvcmVOYW1lKTtcbn07XG5cbnZhciByZW1vdmVDb25kaXRpb25JdGVtID0gZnVuY3Rpb24gcmVtb3ZlQ29uZGl0aW9uSXRlbShjb25kaXRpb24sIHdoZXRoZXIpIHtcbiAgdmFyIHN0b3JlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogX2RlZmF1bHRTdG9yZU5hbWU7XG4gIHJldHVybiBfY3J1ZDIuZGVmYXVsdC5yZW1vdmVDb25kaXRpb24oX2RiLCBjb25kaXRpb24sIHdoZXRoZXIsIHN0b3JlTmFtZSk7XG59O1xuXG52YXIgY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpIHtcbiAgdmFyIHN0b3JlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogX2RlZmF1bHRTdG9yZU5hbWU7XG4gIHJldHVybiBfY3J1ZDIuZGVmYXVsdC5jbGVhcihfZGIsIHN0b3JlTmFtZSk7XG59O1xuXG52YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uIHVwZGF0ZUl0ZW0obmV3RGF0YSkge1xuICB2YXIgc3RvcmVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBfZGVmYXVsdFN0b3JlTmFtZTtcbiAgcmV0dXJuIF9jcnVkMi5kZWZhdWx0LnVwZGF0ZShfZGIsIG5ld0RhdGEsIHN0b3JlTmFtZSk7XG59O1xuXG4vKiBoYW5kbGUgREIub3BlbiAqL1xuXG5mdW5jdGlvbiBfb3BlbkhhbmRsZXIoY29uZmlnLCBzdWNjZXNzQ2FsbGJhY2spIHtcbiAgdmFyIG9wZW5SZXF1ZXN0ID0gd2luZG93LmluZGV4ZWREQi5vcGVuKGNvbmZpZy5uYW1lLCBjb25maWcudmVyc2lvbik7IC8vIG9wZW4gaW5kZXhlZERCXG5cbiAgLy8gYW4gb25ibG9ja2VkIGV2ZW50IGlzIGZpcmVkIHVudGlsIHRoZXkgYXJlIGNsb3NlZCBvciByZWxvYWRlZFxuICBvcGVuUmVxdWVzdC5vbmJsb2NrZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gSWYgc29tZSBvdGhlciB0YWIgaXMgbG9hZGVkIHdpdGggdGhlIGRhdGFiYXNlLCB0aGVuIGl0IG5lZWRzIHRvIGJlIGNsb3NlZCBiZWZvcmUgd2UgY2FuIHByb2NlZWQuXG4gICAgX2xvZzIuZGVmYXVsdC5mYWlsKCdQbGVhc2UgY2xvc2UgYWxsIG90aGVyIHRhYnMgd2l0aCB0aGlzIHNpdGUgb3BlbicpO1xuICB9O1xuXG4gIC8vIENyZWF0aW5nIG9yIHVwZGF0aW5nIHRoZSB2ZXJzaW9uIG9mIHRoZSBkYXRhYmFzZVxuICBvcGVuUmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldDtcblxuICAgIC8vIEFsbCBvdGhlciBkYXRhYmFzZXMgaGF2ZSBiZWVuIGNsb3NlZC4gU2V0IGV2ZXJ5dGhpbmcgdXAuXG4gICAgX2RiID0gdGFyZ2V0LnJlc3VsdDtcbiAgICBfbG9nMi5kZWZhdWx0LnN1Y2Nlc3MoJ29udXBncmFkZW5lZWRlZCBpbicpO1xuICAgIF9jcmVhdGVPYmplY3RTdG9yZUhhbmRsZXIoY29uZmlnLnN0b3JlQ29uZmlnKTtcbiAgfTtcblxuICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgdGFyZ2V0ID0gX3JlZjIudGFyZ2V0O1xuXG4gICAgX2RiID0gdGFyZ2V0LnJlc3VsdDtcbiAgICBfZGIub252ZXJzaW9uY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgX2RiLmNsb3NlKCk7XG4gICAgICBfbG9nMi5kZWZhdWx0LmZhaWwoJ0EgbmV3IHZlcnNpb24gb2YgdGhpcyBwYWdlIGlzIHJlYWR5LiBQbGVhc2UgcmVsb2FkJyk7XG4gICAgfTtcbiAgICBfb3BlblN1Y2Nlc3NDYWxsYmFja0hhbmRsZXIoY29uZmlnLnN0b3JlQ29uZmlnLCBzdWNjZXNzQ2FsbGJhY2spO1xuICB9O1xuXG4gIC8vIHVzZSBlcnJvciBldmVudHMgYnViYmxlIHRvIGhhbmRsZSBhbGwgZXJyb3IgZXZlbnRzXG4gIG9wZW5SZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICB2YXIgdGFyZ2V0ID0gX3JlZjMudGFyZ2V0O1xuXG4gICAgX2xvZzIuZGVmYXVsdC5mYWlsKCdTb21ldGhpbmcgaXMgd3Jvbmcgd2l0aCBpbmRleGVkREIsIGZvciBtb3JlIGluZm9ybWF0aW9uLCBjaGVja291dCBjb25zb2xlJyk7XG4gICAgX2xvZzIuZGVmYXVsdC5mYWlsKHRhcmdldC5lcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKHRhcmdldC5lcnJvcik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIF9vcGVuU3VjY2Vzc0NhbGxiYWNrSGFuZGxlcihjb25maWdTdG9yZUNvbmZpZywgc3VjY2Vzc0NhbGxiYWNrKSB7XG4gIHZhciBvYmplY3RTdG9yZUxpc3QgPSAoMCwgX3BhcnNlSlNPTkRhdGEyLmRlZmF1bHQpKGNvbmZpZ1N0b3JlQ29uZmlnLCAnc3RvcmVOYW1lJyk7XG5cbiAgb2JqZWN0U3RvcmVMaXN0LmZvckVhY2goZnVuY3Rpb24gKHN0b3JlQ29uZmlnLCBpbmRleCkge1xuICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgX2RlZmF1bHRTdG9yZU5hbWUgPSBzdG9yZUNvbmZpZy5zdG9yZU5hbWU7IC8vIFBVTkNITElORTogdGhlIGxhc3Qgc3RvcmVOYW1lIGlzIGRlZmF1bHRTdG9yZU5hbWVcbiAgICB9XG4gICAgaWYgKGluZGV4ID09PSBvYmplY3RTdG9yZUxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgX2dldFByZXNlbnRLZXkoc3RvcmVDb25maWcuc3RvcmVOYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN1Y2Nlc3NDYWxsYmFjaygpO1xuICAgICAgICBfbG9nMi5kZWZhdWx0LnN1Y2Nlc3MoJ29wZW4gaW5kZXhlZERCIHN1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBfZ2V0UHJlc2VudEtleShzdG9yZUNvbmZpZy5zdG9yZU5hbWUpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIHNldCBwcmVzZW50IGtleSB2YWx1ZSB0byBfcHJlc2VudEtleSAodGhlIHByaXZhdGUgcHJvcGVydHkpXG5mdW5jdGlvbiBfZ2V0UHJlc2VudEtleShzdG9yZU5hbWUsIHN1Y2Nlc3NDYWxsYmFjaykge1xuICB2YXIgdHJhbnNhY3Rpb24gPSBfZGIudHJhbnNhY3Rpb24oW3N0b3JlTmFtZV0pO1xuICB2YXIgc3VjY2Vzc01lc3NhZ2UgPSAnbm93ICcgKyBzdG9yZU5hbWUgKyAnIFxcJ3MgbWF4IGtleSBpcyAnICsgX3ByZXNlbnRLZXlbc3RvcmVOYW1lXTsgLy8gaW5pdGlhbCB2YWx1ZSBpcyAwXG5cbiAgX3ByZXNlbnRLZXlbc3RvcmVOYW1lXSA9IDA7XG4gICgwLCBfZ2V0QWxsUmVxdWVzdDIuZGVmYXVsdCkodHJhbnNhY3Rpb24sIHN0b3JlTmFtZSkub25zdWNjZXNzID0gZnVuY3Rpb24gKF9yZWY0KSB7XG4gICAgdmFyIHRhcmdldCA9IF9yZWY0LnRhcmdldDtcblxuICAgIHZhciBjdXJzb3IgPSB0YXJnZXQucmVzdWx0O1xuXG4gICAgaWYgKGN1cnNvcikge1xuICAgICAgX3ByZXNlbnRLZXlbc3RvcmVOYW1lXSA9IGN1cnNvci52YWx1ZS5pZDtcbiAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgIH1cbiAgfTtcbiAgX3Byb21pc2VHZW5lcmF0b3IyLmRlZmF1bHQudHJhbnNhY3Rpb24odHJhbnNhY3Rpb24sIHN1Y2Nlc3NNZXNzYWdlKS50aGVuKHN1Y2Nlc3NDYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVPYmplY3RTdG9yZUhhbmRsZXIoY29uZmlnU3RvcmVDb25maWcpIHtcbiAgKDAsIF9wYXJzZUpTT05EYXRhMi5kZWZhdWx0KShjb25maWdTdG9yZUNvbmZpZywgJ3N0b3JlTmFtZScpLmZvckVhY2goZnVuY3Rpb24gKHN0b3JlQ29uZmlnKSB7XG4gICAgaWYgKCFfZGIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhzdG9yZUNvbmZpZy5zdG9yZU5hbWUpKSB7XG4gICAgICBfY3JlYXRlT2JqZWN0U3RvcmUoc3RvcmVDb25maWcpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVPYmplY3RTdG9yZShfcmVmNSkge1xuICB2YXIgc3RvcmVOYW1lID0gX3JlZjUuc3RvcmVOYW1lLFxuICAgICAga2V5ID0gX3JlZjUua2V5LFxuICAgICAgaW5pdGlhbERhdGEgPSBfcmVmNS5pbml0aWFsRGF0YTtcblxuICB2YXIgc3RvcmUgPSBfZGIuY3JlYXRlT2JqZWN0U3RvcmUoc3RvcmVOYW1lLCB7IGtleVBhdGg6IGtleSwgYXV0b0luY3JlbWVudDogdHJ1ZSB9KTtcbiAgdmFyIHRyYW5zYWN0aW9uID0gc3RvcmUudHJhbnNhY3Rpb247XG5cbiAgdmFyIHN1Y2Nlc3NNZXNzYWdlID0gJ2NyZWF0ZSAnICsgc3RvcmVOYW1lICsgJyBcXCdzIG9iamVjdCBzdG9yZSBzdWNjZWVkJztcblxuICBfcHJvbWlzZUdlbmVyYXRvcjIuZGVmYXVsdC50cmFuc2FjdGlvbih0cmFuc2FjdGlvbiwgc3VjY2Vzc01lc3NhZ2UpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIGlmIChpbml0aWFsRGF0YSkge1xuICAgICAgLy8gU3RvcmUgaW5pdGlhbCB2YWx1ZXMgaW4gdGhlIG5ld2x5IGNyZWF0ZWQgb2JqZWN0IHN0b3JlLlxuICAgICAgX2luaXRpYWxEYXRhSGFuZGxlcihzdG9yZU5hbWUsIGluaXRpYWxEYXRhKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfaW5pdGlhbERhdGFIYW5kbGVyKHN0b3JlTmFtZSwgaW5pdGlhbERhdGEpIHtcbiAgdmFyIHRyYW5zYWN0aW9uID0gX2RiLnRyYW5zYWN0aW9uKFtzdG9yZU5hbWVdLCAncmVhZHdyaXRlJyk7XG4gIHZhciBvYmplY3RTdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHN0b3JlTmFtZSk7XG4gIHZhciBzdWNjZXNzTWVzc2FnZSA9ICdhZGQgYWxsICcgKyBzdG9yZU5hbWUgKyAnIFxcJ3MgaW5pdGlhbCBkYXRhIGRvbmUnO1xuXG4gICgwLCBfcGFyc2VKU09ORGF0YTIuZGVmYXVsdCkoaW5pdGlhbERhdGEsICdpbml0aWFsJykuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSwgaW5kZXgpIHtcbiAgICB2YXIgYWRkUmVxdWVzdCA9IG9iamVjdFN0b3JlLmFkZChkYXRhKTtcblxuICAgIGFkZFJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgX2xvZzIuZGVmYXVsdC5zdWNjZXNzKCdhZGQgaW5pdGlhbCBkYXRhWycgKyBpbmRleCArICddIHN1Y2Nlc3NlZCcpO1xuICAgIH07XG4gIH0pO1xuICBfcHJvbWlzZUdlbmVyYXRvcjIuZGVmYXVsdC50cmFuc2FjdGlvbih0cmFuc2FjdGlvbiwgc3VjY2Vzc01lc3NhZ2UpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIF9nZXRQcmVzZW50S2V5KHN0b3JlTmFtZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gIG9wZW46IG9wZW4sXG4gIGdldExlbmd0aDogZ2V0TGVuZ3RoLFxuICBnZXROZXdLZXk6IGdldE5ld0tleSxcbiAgZ2V0SXRlbTogZ2V0SXRlbSxcbiAgZ2V0Q29uZGl0aW9uSXRlbTogZ2V0Q29uZGl0aW9uSXRlbSxcbiAgZ2V0QWxsOiBnZXRBbGwsXG4gIGFkZEl0ZW06IGFkZEl0ZW0sXG4gIHJlbW92ZUl0ZW06IHJlbW92ZUl0ZW0sXG4gIHJlbW92ZUNvbmRpdGlvbkl0ZW06IHJlbW92ZUNvbmRpdGlvbkl0ZW0sXG4gIGNsZWFyOiBjbGVhcixcbiAgdXBkYXRlSXRlbTogdXBkYXRlSXRlbVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4ZWRkYi1jcnVkLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9wcm9taXNlR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9wcm9taXNlR2VuZXJhdG9yJyk7XG5cbnZhciBfcHJvbWlzZUdlbmVyYXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9taXNlR2VuZXJhdG9yKTtcblxudmFyIF9nZXRBbGxSZXF1ZXN0ID0gcmVxdWlyZSgnLi9nZXRBbGxSZXF1ZXN0Jyk7XG5cbnZhciBfZ2V0QWxsUmVxdWVzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9nZXRBbGxSZXF1ZXN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gZ2V0KGRiVmFsdWUsIGtleSwgc3RvcmVOYW1lKSB7XG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiVmFsdWUudHJhbnNhY3Rpb24oW3N0b3JlTmFtZV0pO1xuICB2YXIgZ2V0UmVxdWVzdCA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKHN0b3JlTmFtZSkuZ2V0KHBhcnNlSW50KGtleSwgMTApKTsgLy8gZ2V0IGl0IGJ5IGluZGV4XG4gIHZhciBzdWNjZXNzTWVzc2FnZSA9ICdnZXQgJyArIHN0b3JlTmFtZSArICdcXCdzICcgKyBnZXRSZXF1ZXN0LnNvdXJjZS5rZXlQYXRoICsgJyA9ICcgKyBrZXkgKyAnIGRhdGEgc3VjY2Vzcyc7XG4gIHZhciBkYXRhID0geyBwcm9wZXJ0eTogJ3Jlc3VsdCcgfTtcblxuICByZXR1cm4gX3Byb21pc2VHZW5lcmF0b3IyLmRlZmF1bHQucmVxdWVzdChnZXRSZXF1ZXN0LCBzdWNjZXNzTWVzc2FnZSwgZGF0YSk7XG59XG5cbi8vIGdldCBjb25kaXRpb25hbCBkYXRhIChib29sZWFuIGNvbmRpdGlvbilcbmZ1bmN0aW9uIGdldENvbmRpdGlvbihkYlZhbHVlLCBjb25kaXRpb24sIHdoZXRoZXIsIHN0b3JlTmFtZSkge1xuICB2YXIgdHJhbnNhY3Rpb24gPSBkYlZhbHVlLnRyYW5zYWN0aW9uKFtzdG9yZU5hbWVdKTtcbiAgdmFyIHJlc3VsdCA9IFtdOyAvLyB1c2UgYW4gYXJyYXkgdG8gc3RvcmFnZSBlbGlnaWJsZSBkYXRhXG4gIHZhciBzdWNjZXNzTWVzc2FnZSA9ICdnZXQgJyArIHN0b3JlTmFtZSArICdcXCdzICcgKyBjb25kaXRpb24gKyAnID0gJyArIHdoZXRoZXIgKyAnIGRhdGEgc3VjY2Vzcyc7XG5cbiAgKDAsIF9nZXRBbGxSZXF1ZXN0Mi5kZWZhdWx0KSh0cmFuc2FjdGlvbiwgc3RvcmVOYW1lKS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldDtcblxuICAgIHZhciBjdXJzb3IgPSB0YXJnZXQucmVzdWx0O1xuXG4gICAgaWYgKGN1cnNvcikge1xuICAgICAgaWYgKGN1cnNvci52YWx1ZVtjb25kaXRpb25dID09PSB3aGV0aGVyKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGN1cnNvci52YWx1ZSk7XG4gICAgICB9XG4gICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIF9wcm9taXNlR2VuZXJhdG9yMi5kZWZhdWx0LnRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uLCBzdWNjZXNzTWVzc2FnZSwgcmVzdWx0KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsKGRiVmFsdWUsIHN0b3JlTmFtZSkge1xuICB2YXIgdHJhbnNhY3Rpb24gPSBkYlZhbHVlLnRyYW5zYWN0aW9uKFtzdG9yZU5hbWVdKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgc3VjY2Vzc01lc3NhZ2UgPSAnZ2V0ICcgKyBzdG9yZU5hbWUgKyAnXFwncyBhbGwgZGF0YSBzdWNjZXNzJztcblxuICAoMCwgX2dldEFsbFJlcXVlc3QyLmRlZmF1bHQpKHRyYW5zYWN0aW9uLCBzdG9yZU5hbWUpLm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChfcmVmMikge1xuICAgIHZhciB0YXJnZXQgPSBfcmVmMi50YXJnZXQ7XG5cbiAgICB2YXIgY3Vyc29yID0gdGFyZ2V0LnJlc3VsdDtcblxuICAgIGlmIChjdXJzb3IpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGN1cnNvci52YWx1ZSk7XG4gICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIF9wcm9taXNlR2VuZXJhdG9yMi5kZWZhdWx0LnRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uLCBzdWNjZXNzTWVzc2FnZSwgcmVzdWx0KTtcbn1cblxuZnVuY3Rpb24gYWRkKGRiVmFsdWUsIG5ld0RhdGEsIHN0b3JlTmFtZSkge1xuICB2YXIgdHJhbnNhY3Rpb24gPSBkYlZhbHVlLnRyYW5zYWN0aW9uKFtzdG9yZU5hbWVdLCAncmVhZHdyaXRlJyk7XG4gIHZhciBhZGRSZXF1ZXN0ID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5hZGQobmV3RGF0YSk7XG4gIHZhciBzdWNjZXNzTWVzc2FnZSA9ICdhZGQgJyArIHN0b3JlTmFtZSArICdcXCdzICcgKyBhZGRSZXF1ZXN0LnNvdXJjZS5rZXlQYXRoICsgJyAgPSAnICsgbmV3RGF0YVthZGRSZXF1ZXN0LnNvdXJjZS5rZXlQYXRoXSArICcgZGF0YSBzdWNjZWVkJztcblxuICByZXR1cm4gX3Byb21pc2VHZW5lcmF0b3IyLmRlZmF1bHQucmVxdWVzdChhZGRSZXF1ZXN0LCBzdWNjZXNzTWVzc2FnZSwgbmV3RGF0YSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShkYlZhbHVlLCBrZXksIHN0b3JlTmFtZSkge1xuICB2YXIgdHJhbnNhY3Rpb24gPSBkYlZhbHVlLnRyYW5zYWN0aW9uKFtzdG9yZU5hbWVdLCAncmVhZHdyaXRlJyk7XG4gIHZhciBkZWxldGVSZXF1ZXN0ID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5kZWxldGUoa2V5KTtcbiAgdmFyIHN1Y2Nlc3NNZXNzYWdlID0gJ3JlbW92ZSAnICsgc3RvcmVOYW1lICsgJ1xcJ3MgICcgKyBkZWxldGVSZXF1ZXN0LnNvdXJjZS5rZXlQYXRoICsgJyA9ICcgKyBrZXkgKyAnIGRhdGEgc3VjY2Vzcyc7XG5cbiAgcmV0dXJuIF9wcm9taXNlR2VuZXJhdG9yMi5kZWZhdWx0LnJlcXVlc3QoZGVsZXRlUmVxdWVzdCwgc3VjY2Vzc01lc3NhZ2UsIGtleSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNvbmRpdGlvbihkYlZhbHVlLCBjb25kaXRpb24sIHdoZXRoZXIsIHN0b3JlTmFtZSkge1xuICB2YXIgdHJhbnNhY3Rpb24gPSBkYlZhbHVlLnRyYW5zYWN0aW9uKFtzdG9yZU5hbWVdLCAncmVhZHdyaXRlJyk7XG4gIHZhciBzdWNjZXNzTWVzc2FnZSA9ICdyZW1vdmUgJyArIHN0b3JlTmFtZSArICdcXCdzICcgKyBjb25kaXRpb24gKyAnID0gJyArIHdoZXRoZXIgKyAnIGRhdGEgc3VjY2Vzcyc7XG5cbiAgKDAsIF9nZXRBbGxSZXF1ZXN0Mi5kZWZhdWx0KSh0cmFuc2FjdGlvbiwgc3RvcmVOYW1lKS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICB2YXIgdGFyZ2V0ID0gX3JlZjMudGFyZ2V0O1xuXG4gICAgdmFyIGN1cnNvciA9IHRhcmdldC5yZXN1bHQ7XG5cbiAgICBpZiAoY3Vyc29yKSB7XG4gICAgICBpZiAoY3Vyc29yLnZhbHVlW2NvbmRpdGlvbl0gPT09IHdoZXRoZXIpIHtcbiAgICAgICAgY3Vyc29yLmRlbGV0ZSgpO1xuICAgICAgfVxuICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBfcHJvbWlzZUdlbmVyYXRvcjIuZGVmYXVsdC50cmFuc2FjdGlvbih0cmFuc2FjdGlvbiwgc3VjY2Vzc01lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiBjbGVhcihkYlZhbHVlLCBzdG9yZU5hbWUpIHtcbiAgdmFyIHRyYW5zYWN0aW9uID0gZGJWYWx1ZS50cmFuc2FjdGlvbihbc3RvcmVOYW1lXSwgJ3JlYWR3cml0ZScpO1xuICB2YXIgc3VjY2Vzc01lc3NhZ2UgPSAnY2xlYXIgJyArIHN0b3JlTmFtZSArICdcXCdzIGFsbCBkYXRhIHN1Y2Nlc3MnO1xuXG4gICgwLCBfZ2V0QWxsUmVxdWVzdDIuZGVmYXVsdCkodHJhbnNhY3Rpb24sIHN0b3JlTmFtZSkub25zdWNjZXNzID0gZnVuY3Rpb24gKF9yZWY0KSB7XG4gICAgdmFyIHRhcmdldCA9IF9yZWY0LnRhcmdldDtcblxuICAgIHZhciBjdXJzb3IgPSB0YXJnZXQucmVzdWx0O1xuXG4gICAgaWYgKGN1cnNvcikge1xuICAgICAgY3Vyc29yLmRlbGV0ZSgpO1xuICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBfcHJvbWlzZUdlbmVyYXRvcjIuZGVmYXVsdC50cmFuc2FjdGlvbih0cmFuc2FjdGlvbiwgc3VjY2Vzc01lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUoZGJWYWx1ZSwgbmV3RGF0YSwgc3RvcmVOYW1lKSB7XG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiVmFsdWUudHJhbnNhY3Rpb24oW3N0b3JlTmFtZV0sICdyZWFkd3JpdGUnKTtcbiAgdmFyIHB1dFJlcXVlc3QgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShzdG9yZU5hbWUpLnB1dChuZXdEYXRhKTtcbiAgdmFyIHN1Y2Nlc3NNZXNzYWdlID0gJ3VwZGF0ZSAnICsgc3RvcmVOYW1lICsgJ1xcJ3MgJyArIHB1dFJlcXVlc3Quc291cmNlLmtleVBhdGggKyAnICA9ICcgKyBuZXdEYXRhW3B1dFJlcXVlc3Quc291cmNlLmtleVBhdGhdICsgJyBkYXRhIHN1Y2Nlc3MnO1xuXG4gIHJldHVybiBfcHJvbWlzZUdlbmVyYXRvcjIuZGVmYXVsdC5yZXF1ZXN0KHB1dFJlcXVlc3QsIHN1Y2Nlc3NNZXNzYWdlLCBuZXdEYXRhKTtcbn1cblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBnZXQ6IGdldCxcbiAgZ2V0Q29uZGl0aW9uOiBnZXRDb25kaXRpb24sXG4gIGdldEFsbDogZ2V0QWxsLFxuICBhZGQ6IGFkZCxcbiAgcmVtb3ZlOiByZW1vdmUsXG4gIHJlbW92ZUNvbmRpdGlvbjogcmVtb3ZlQ29uZGl0aW9uLFxuICBjbGVhcjogY2xlYXIsXG4gIHVwZGF0ZTogdXBkYXRlXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y3J1ZC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgZ2V0QWxsUmVxdWVzdCA9IGZ1bmN0aW9uIGdldEFsbFJlcXVlc3QodHJhbnNhY3Rpb24sIHN0b3JlTmFtZSkge1xuICByZXR1cm4gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5vcGVuQ3Vyc29yKElEQktleVJhbmdlLmxvd2VyQm91bmQoMSksICduZXh0Jyk7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBnZXRBbGxSZXF1ZXN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0QWxsUmVxdWVzdC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBsb2cgPSB7XG4gIHN1Y2Nlc3M6IGZ1bmN0aW9uIHN1Y2Nlc3MobWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKFwiXFx1MjcxMyBcIiArIG1lc3NhZ2UgKyBcIiA6KVwiKTtcbiAgfSxcbiAgZmFpbDogZnVuY3Rpb24gZmFpbChtZXNzYWdlKSB7XG4gICAgY29uc29sZS5sb2coXCJcXHUyNzE0IFwiICsgbWVzc2FnZSk7XG4gIH1cbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGxvZztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvZy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBwYXJzZUpTT05EYXRhID0gZnVuY3Rpb24gcGFyc2VKU09ORGF0YShyYXdkYXRhLCBuYW1lKSB7XG4gIHRyeSB7XG4gICAgdmFyIHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJhd2RhdGEpKTtcblxuICAgIHJldHVybiBwYXJzZWREYXRhO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHdpbmRvdy5hbGVydChcInBsZWFzZSBzZXQgY29ycmVjdCBcIiArIG5hbWUgKyBcIiBhcnJheSBvYmplY3RcIik7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBwYXJzZUpTT05EYXRhO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2VKU09ORGF0YS5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfbG9nID0gcmVxdWlyZSgnLi9sb2cnKTtcblxudmFyIF9sb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHJlcXVlc3RQcm9taXNlID0gZnVuY3Rpb24gcmVxdWVzdFByb21pc2UocmVxdWVzdCwgc3VjY2Vzc01lc3NhZ2UsIGRhdGEpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzdWNjZXNzRGF0YSA9IGRhdGE7XG5cbiAgICAgIGlmIChkYXRhLnByb3BlcnR5KSB7XG4gICAgICAgIHN1Y2Nlc3NEYXRhID0gcmVxdWVzdFtkYXRhLnByb3BlcnR5XTsgLy8gZm9yIGdldEl0ZW1cbiAgICAgIH1cbiAgICAgIF9sb2cyLmRlZmF1bHQuc3VjY2VzcyhzdWNjZXNzTWVzc2FnZSk7XG4gICAgICByZXNvbHZlKHN1Y2Nlc3NEYXRhKTtcbiAgICB9O1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIF9sb2cyLmRlZmF1bHQuZmFpbChyZXF1ZXN0LmVycm9yKTtcbiAgICAgIHJlamVjdCgpO1xuICAgIH07XG4gIH0pO1xufTtcblxudmFyIHRyYW5zYWN0aW9uUHJvbWlzZSA9IGZ1bmN0aW9uIHRyYW5zYWN0aW9uUHJvbWlzZSh0cmFuc2FjdGlvbiwgc3VjY2Vzc01lc3NhZ2UsIGRhdGEpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgX2xvZzIuZGVmYXVsdC5zdWNjZXNzKHN1Y2Nlc3NNZXNzYWdlKTtcbiAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgfTtcbiAgICB0cmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgX2xvZzIuZGVmYXVsdC5mYWlsKHRyYW5zYWN0aW9uLmVycm9yKTtcbiAgICAgIHJlamVjdCgpO1xuICAgIH07XG4gIH0pO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICByZXF1ZXN0OiByZXF1ZXN0UHJvbWlzZSxcbiAgdHJhbnNhY3Rpb246IHRyYW5zYWN0aW9uUHJvbWlzZVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb21pc2VHZW5lcmF0b3IuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvaW5kZXhlZGRiLWNydWQnKVsnZGVmYXVsdCddO1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnSnVzdFRvRG8nLFxuICB2ZXJzaW9uOiAnMjMnLFxuICBzdG9yZUNvbmZpZzogW1xuICAgIHtcbiAgICAgIHN0b3JlTmFtZTogJ2xpc3QnLFxuICAgICAga2V5OiAnaWQnLFxuICAgICAgaW5pdGlhbERhdGE6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAwLCBldmVudDogJ0p1c3REZW1vJywgZmluaXNoZWQ6IHRydWUsIGRhdGU6IDAsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgc3RvcmVOYW1lOiAnYXBob3Jpc20nLFxuICAgICAga2V5OiAnaWQnLFxuICAgICAgaW5pdGlhbERhdGE6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgIGNvbnRlbnQ6IFwiWW91J3JlIGJldHRlciB0aGFuIHRoYXRcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAyLFxuICAgICAgICAgIGNvbnRlbnQ6ICdZZXN0ZXJkYXkgWW91IFNhaWQgVG9tb3Jyb3cnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgY29udGVudDogJ1doeSBhcmUgd2UgaGVyZT8nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgY29udGVudDogJ0FsbCBpbiwgb3Igbm90aGluZycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogNSxcbiAgICAgICAgICBjb250ZW50OiAnWW91IE5ldmVyIFRyeSwgWW91IE5ldmVyIEtub3cnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IDYsXG4gICAgICAgICAgY29udGVudDogJ1RoZSB1bmV4YW1pbmVkIGxpZmUgaXMgbm90IHdvcnRoIGxpdmluZy4gLS0gU29jcmF0ZXMnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IDcsXG4gICAgICAgICAgY29udGVudDogJ1RoZXJlIGlzIG9ubHkgb25lIHRoaW5nIHdlIHNheSB0byBsYXp5OiBOT1QgVE9EQVknLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxufTtcbiIsImltcG9ydCB7IG9wZW4gYXMgb3BlbkRCIH0gZnJvbSAnaW5kZXhlZGRiLWNydWQnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2RiL2NvbmZpZyc7XG5pbXBvcnQgdGVtcGxldGUgZnJvbSAnLi4vdGVtcGxldGUvdGVtcGxhdGUnO1xuaW1wb3J0IGFkZEV2ZW50cyBmcm9tICcuL3V0bGlzL2RiU3VjY2Vzcy9hZGRFdmVudHMnO1xuaW1wb3J0IGxhenlMb2FkV2l0aG91dERCIGZyb20gJy4vdXRsaXMvbGF6eUxvYWRXaXRob3V0REInO1xuXG5cbnRlbXBsZXRlKCk7XG4vLyBvcGVuIERCLCBhbmQgd2hlbiBEQiBvcGVuIHN1Y2NlZWQsIGludm9rZSBpbml0aWFsIGZ1bmN0aW9uXG4vLyB3aGVuIGZhaWxlZCwgY2hhbmdlIHRvIHdpdGhvdXREQiBtb2RlXG5vcGVuREIoY29uZmlnKVxuICAudGhlbihhZGRFdmVudHMpXG4gIC5jYXRjaChsYXp5TG9hZFdpdGhvdXREQik7XG4iLCJmdW5jdGlvbiBjbGVhckNoaWxkTm9kZXMocm9vdCkge1xuICB3aGlsZSAocm9vdC5oYXNDaGlsZE5vZGVzKCkpIHsgLy8gb3Igcm9vdC5maXJzdENoaWxkIG9yIHJvb3QubGFzdENoaWxkXG4gICAgcm9vdC5yZW1vdmVDaGlsZChyb290LmZpcnN0Q2hpbGQpO1xuICB9XG4gIC8vIG9yIHJvb3QuaW5uZXJIVE1MID0gJydcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xlYXJDaGlsZE5vZGVzO1xuIiwiZnVuY3Rpb24gYWRkRXZlbnRzR2VuZXJhdG9yKGhhbmRsZXIpIHtcbiAgaGFuZGxlci5zaG93SW5pdCgpO1xuICAvLyBhZGQgYWxsIGV2ZW50TGlzdGVuZXJcbiAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0Jyk7XG5cbiAgbGlzdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIuY2xpY2tMaSwgZmFsc2UpO1xuICBsaXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlci5yZW1vdmVMaSwgZmFsc2UpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlci5lbnRlckFkZCwgZmFsc2UpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYWRkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyLmFkZCwgZmFsc2UpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2hvd0RvbmUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIuc2hvd0RvbmUsIGZhbHNlKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Nob3dUb2RvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyLnNob3dUb2RvLCBmYWxzZSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaG93QWxsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyLnNob3dBbGwsIGZhbHNlKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Nob3dDbGVhckRvbmUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIuc2hvd0NsZWFyRG9uZSwgZmFsc2UpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2hvd0NsZWFyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyLnNob3dDbGVhciwgZmFsc2UpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhZGRFdmVudHNHZW5lcmF0b3I7XG4iLCJpbXBvcnQgZ2V0Rm9ybWF0RGF0ZSBmcm9tICcuLi9nZXRGb3JtYXREYXRlJztcblxuZnVuY3Rpb24gcmVzZXRJbnB1dCgpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2lucHV0JykudmFsdWUgPSAnJztcbn1cblxuZnVuY3Rpb24gZGF0YUdlbmVyYXRvcihrZXksIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGtleSxcbiAgICBldmVudDogdmFsdWUsXG4gICAgZmluaXNoZWQ6IGZhbHNlLFxuICAgIGRhdGU6IGdldEZvcm1hdERhdGUoJ01N5pyIZGTml6VoaDptbScpLFxuICB9O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVzZXRJbnB1dCxcbiAgZGF0YUdlbmVyYXRvcixcbn07XG4iLCJpbXBvcnQgaXRlbUdlbmVyYXRvciBmcm9tICcuLi90ZW1wbGV0ZS9pdGVtR2VuZXJhdG9yJztcbmltcG9ydCBzZW50ZW5jZUdlbmVyYXRvciBmcm9tICcuLi90ZW1wbGV0ZS9zZW50ZW5jZUdlbmVyYXRvcic7XG5pbXBvcnQgY2xlYXJDaGlsZE5vZGVzIGZyb20gJy4uL2NsZWFyQ2hpbGROb2Rlcyc7XG5cbmZ1bmN0aW9uIGluaXQoZGF0YUFycikge1xuICBfc2hvdyhkYXRhQXJyLCBfaW5pdFNlbnRlbmNlLCBfcmVuZGVyQWxsKTtcbn1cblxuZnVuY3Rpb24gX3Nob3coZGF0YUFyciwgc2hvd1NlbnRlbmNlRnVuYywgZ2VuZXJhdGVGdW5jKSB7XG4gIGlmICghZGF0YUFyciB8fCBkYXRhQXJyLmxlbmd0aCA9PT0gMCkge1xuICAgIHNob3dTZW50ZW5jZUZ1bmMoKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlzdCcpLmlubmVySFRNTCA9IGdlbmVyYXRlRnVuYyhkYXRhQXJyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfaW5pdFNlbnRlbmNlKCkge1xuICBjb25zdCB0ZXh0ID0gJ1dlbGNvbWV+LCB0cnkgdG8gYWRkIHlvdXIgZmlyc3QgdG8tZG8gbGlzdCA6ICknO1xuXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0JykuaW5uZXJIVE1MID0gc2VudGVuY2VHZW5lcmF0b3IodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGFsbChyYW5kb21BcGhvcmlzbSwgZGF0YUFycikge1xuICBfc2hvdyhkYXRhQXJyLCByYW5kb21BcGhvcmlzbSwgX3JlbmRlckFsbCk7XG59XG5cbmZ1bmN0aW9uIF9yZW5kZXJBbGwoZGF0YUFycikge1xuICBjb25zdCBjbGFzc2lmaWVkRGF0YSA9IF9jbGFzc2lmeURhdGEoZGF0YUFycik7XG5cbiAgcmV0dXJuIGl0ZW1HZW5lcmF0b3IoY2xhc3NpZmllZERhdGEpO1xufVxuXG5mdW5jdGlvbiBfY2xhc3NpZnlEYXRhKGRhdGFBcnIpIHtcbiAgY29uc3QgZmluaXNoZWQgPSBbXTtcbiAgY29uc3QgdW5maXNoaWVkID0gW107XG5cbiAgLy8gcHV0IHRoZSBmaW5pc2hlZCBpdGVtIHRvIHRoZSBib3R0b21cbiAgZGF0YUFyci5mb3JFYWNoKGRhdGEgPT4gKGRhdGEuZmluaXNoZWQgPyBmaW5pc2hlZC51bnNoaWZ0KGRhdGEpIDogdW5maXNoaWVkLnVuc2hpZnQoZGF0YSkpKTtcblxuICByZXR1cm4gdW5maXNoaWVkLmNvbmNhdChmaW5pc2hlZCk7XG59XG5cbmZ1bmN0aW9uIHBhcnQocmFuZG9tQXBob3Jpc20sIGRhdGFBcnIpIHtcbiAgX3Nob3coZGF0YUFyciwgcmFuZG9tQXBob3Jpc20sIF9yZW5kZXJQYXJ0KTtcbn1cblxuZnVuY3Rpb24gX3JlbmRlclBhcnQoZGF0YUFycikge1xuICByZXR1cm4gaXRlbUdlbmVyYXRvcihkYXRhQXJyLnJldmVyc2UoKSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyKCkge1xuICBjbGVhckNoaWxkTm9kZXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpc3QnKSk7XG59XG5cbmZ1bmN0aW9uIHNlbnRlbmNlSGFuZGxlcih0ZXh0KSB7XG4gIGNvbnN0IHJlbmRlcmVkID0gc2VudGVuY2VHZW5lcmF0b3IodGV4dCk7XG5cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpc3QnKS5pbm5lckhUTUwgPSByZW5kZXJlZDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGluaXQsXG4gIGFsbCxcbiAgcGFydCxcbiAgY2xlYXIsXG4gIHNlbnRlbmNlSGFuZGxlcixcbn07XG4iLCJpbXBvcnQgYWRkRXZlbnRzR2VuZXJhdG9yIGZyb20gJy4uL2RiR2VuZXJhbC9hZGRFdmVudHNHZW5lcmF0b3InO1xuaW1wb3J0IGV2ZW50c0hhbmRsZXIgZnJvbSAnLi4vZGJTdWNjZXNzL2V2ZW50c0hhbmRsZXInO1xuXG5mdW5jdGlvbiBhZGRFdmVudHMoKSB7XG4gIGFkZEV2ZW50c0dlbmVyYXRvcihldmVudHNIYW5kbGVyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWRkRXZlbnRzO1xuIiwiaW1wb3J0IERCIGZyb20gJ2luZGV4ZWRkYi1jcnVkJztcbmltcG9ydCBSZWZyZXNoIGZyb20gJy4uL2RiU3VjY2Vzcy9yZWZyZXNoJztcbmltcG9ydCBHZW5lcmFsIGZyb20gJy4uL2RiR2VuZXJhbC9ldmVudHNIYW5kbGVyR2VuZXJhbCc7XG5pbXBvcnQgaXRlbUdlbmVyYXRvciBmcm9tICcuLi90ZW1wbGV0ZS9pdGVtR2VuZXJhdG9yJztcblxuZnVuY3Rpb24gYWRkKCkge1xuICBjb25zdCBpbnB1dFZhbHVlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2lucHV0JykudmFsdWU7XG5cbiAgaWYgKGlucHV0VmFsdWUgPT09ICcnKSB7XG4gICAgd2luZG93LmFsZXJ0KCdwbGVhc2UgaW5wdXQgYSByZWFsIGRhdGF+Jyk7XG4gIH0gZWxzZSB7XG4gICAgX2FkZEhhbmRsZXIoaW5wdXRWYWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FkZEhhbmRsZXIoaW5wdXRWYWx1ZSkge1xuICBjb25zdCBuZXdEYXRhID0gR2VuZXJhbC5kYXRhR2VuZXJhdG9yKERCLmdldE5ld0tleSgpLCBpbnB1dFZhbHVlKTtcbiAgY29uc3QgcmVuZGVyZWQgPSBpdGVtR2VuZXJhdG9yKG5ld0RhdGEpO1xuXG4gIHJlbW92ZUluaXQoKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpc3QnKS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCByZW5kZXJlZCk7IC8vIFBVTkNITElORTogdXNlIGluc2VydEFkamFjZW50SFRNTFxuICBHZW5lcmFsLnJlc2V0SW5wdXQoKTtcbiAgREIuYWRkSXRlbShuZXdEYXRhKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSW5pdCgpIHtcbiAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0Jyk7XG5cbiAgaWYgKGxpc3QuZmlyc3RDaGlsZC5jbGFzc05hbWUgPT09ICdhcGhvcmlzbScpIHtcbiAgICBsaXN0LnJlbW92ZUNoaWxkKGxpc3QuZmlyc3RDaGlsZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW50ZXJBZGQoeyBrZXlDb2RlIH0pIHtcbiAgaWYgKGtleUNvZGUgPT09IDEzKSB7XG4gICAgYWRkKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xpY2tMaSh7IHRhcmdldCB9KSB7XG4gIC8vIHVzZSBldmVudCBkZWxlZ2F0aW9uXG4gIGlmICghdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYXBob3Jpc20nKSkge1xuICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpIHsgLy8gdGVzdCB3aGV0aGVyIGlzIHhcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKCdmaW5pc2hlZCcpOyAvLyB0b2dnbGUgYXBwZWFyYW5jZVxuXG4gICAgICAvLyB1c2UgcHJldmlvdXNseSBzdG9yZWQgZGF0YS1pZCBhdHRyaWJ1dGVcbiAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpLCAxMCk7XG5cbiAgICAgIERCLmdldEl0ZW0oaWQpXG4gICAgICAgIC50aGVuKF90b2dnbGVMaSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF90b2dnbGVMaShkYXRhKSB7XG4gIGNvbnN0IG5ld0RhdGEgPSBkYXRhO1xuXG4gIG5ld0RhdGEuZmluaXNoZWQgPSAhZGF0YS5maW5pc2hlZDtcbiAgREIudXBkYXRlSXRlbShuZXdEYXRhKVxuICAgIC50aGVuKHNob3dBbGwpO1xufVxuXG4vLyBsaSdzIFt4XSdzIGRlbGV0ZVxuZnVuY3Rpb24gcmVtb3ZlTGkoeyB0YXJnZXQgfSkge1xuICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PT0gJ2Nsb3NlJykgeyAvLyB1c2UgZXZlbnQgZGVsZWdhdGlvblxuICAgIC8vIGRlbGV0ZSB2aXN1YWxseVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaXN0JykucmVtb3ZlQ2hpbGQodGFyZ2V0LnBhcmVudE5vZGUpO1xuICAgIF9hZGRSYW5kb20oKTtcbiAgICAvLyB1c2UgcHJldmlvdXNseSBzdG9yZWQgZGF0YVxuICAgIGNvbnN0IGlkID0gcGFyc2VJbnQodGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJyksIDEwKTtcbiAgICAvLyBkZWxldGUgYWN0dWFsbHlcbiAgICBEQi5yZW1vdmVJdGVtKGlkKTtcbiAgfVxufVxuXG4vLyBmb3IgU2VtYW50aWNcbmZ1bmN0aW9uIF9hZGRSYW5kb20oKSB7XG4gIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlzdCcpO1xuXG4gIC8vIGJlY2F1c2Ugb2YgdGhlIGhhbmRsZXJiYXMudGVtcGxldGUsIGFkZCB0aGlzIGluc3BlY3RcbiAgaWYgKCFsaXN0Lmxhc3RDaGlsZCB8fCBsaXN0Lmxhc3RDaGlsZC5ub2RlTmFtZSA9PT0gJyN0ZXh0Jykge1xuICAgIFJlZnJlc2gucmFuZG9tKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd0luaXQoKSB7XG4gIERCLmdldEFsbCgpXG4gICAgLnRoZW4oUmVmcmVzaC5pbml0KTtcbn1cblxuZnVuY3Rpb24gc2hvd0FsbCgpIHtcbiAgREIuZ2V0QWxsKClcbiAgICAudGhlbihSZWZyZXNoLmFsbCk7XG59XG5cbmZ1bmN0aW9uIHNob3dEb25lKCkge1xuICBfc2hvd1doZXRoZXJEb25lKHRydWUpO1xufVxuXG5mdW5jdGlvbiBzaG93VG9kbygpIHtcbiAgX3Nob3dXaGV0aGVyRG9uZShmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIF9zaG93V2hldGhlckRvbmUod2hldGhlckRvbmUpIHtcbiAgY29uc3QgY29uZGl0aW9uID0gJ2ZpbmlzaGVkJztcblxuICBEQi5nZXRDb25kaXRpb25JdGVtKGNvbmRpdGlvbiwgd2hldGhlckRvbmUpXG4gICAgLnRoZW4oUmVmcmVzaC5wYXJ0KTtcbn1cblxuZnVuY3Rpb24gc2hvd0NsZWFyRG9uZSgpIHtcbiAgY29uc3QgY29uZGl0aW9uID0gJ2ZpbmlzaGVkJztcblxuICBEQi5yZW1vdmVDb25kaXRpb25JdGVtKGNvbmRpdGlvbiwgdHJ1ZSlcbiAgICAudGhlbihEQi5nZXRBbGwpXG4gICAgLnRoZW4oUmVmcmVzaC5wYXJ0KTtcbn1cblxuZnVuY3Rpb24gc2hvd0NsZWFyKCkge1xuICBSZWZyZXNoLmNsZWFyKCk7IC8vIGNsZWFyIG5vZGVzIHZpc3VhbGx5XG4gIERCLmNsZWFyKClcbiAgICAudGhlbihSZWZyZXNoLnJhbmRvbSk7IC8vIGNsZWFyIGRhdGEgaW5kZWVkXG59XG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICBhZGQsXG4gIGVudGVyQWRkLFxuICBjbGlja0xpLFxuICByZW1vdmVMaSxcbiAgc2hvd0luaXQsXG4gIHNob3dBbGwsXG4gIHNob3dEb25lLFxuICBzaG93VG9kbyxcbiAgc2hvd0NsZWFyRG9uZSxcbiAgc2hvd0NsZWFyLFxufTtcbiIsImltcG9ydCBEQiBmcm9tICdpbmRleGVkZGItY3J1ZCc7XG5pbXBvcnQgR2VuZXJhbCBmcm9tICcuLi9kYkdlbmVyYWwvcmVmcmVzaEdlbmVyYWwnO1xuXG5mdW5jdGlvbiByYW5kb21BcGhvcmlzbSgpIHtcbiAgY29uc3Qgc3RvcmVOYW1lID0gJ2FwaG9yaXNtJztcbiAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIERCLmdldExlbmd0aChzdG9yZU5hbWUpKTtcblxuICBEQi5nZXRJdGVtKHJhbmRvbUluZGV4LCBzdG9yZU5hbWUpXG4gICAgLnRoZW4oX3BhcnNlVGV4dCk7XG59XG5cbmZ1bmN0aW9uIF9wYXJzZVRleHQoZGF0YSkge1xuICBjb25zdCB0ZXh0ID0gZGF0YS5jb250ZW50O1xuXG4gIEdlbmVyYWwuc2VudGVuY2VIYW5kbGVyKHRleHQpO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdDogR2VuZXJhbC5pbml0LFxuICBhbGw6IEdlbmVyYWwuYWxsLmJpbmQobnVsbCwgcmFuZG9tQXBob3Jpc20pLCAvLyBQVU5DSExJTkU6IHVzZSBiaW5kIHRvIHBhc3MgcGFyYW10ZXJcbiAgcGFydDogR2VuZXJhbC5wYXJ0LmJpbmQobnVsbCwgcmFuZG9tQXBob3Jpc20pLFxuICBjbGVhcjogR2VuZXJhbC5jbGVhcixcbiAgcmFuZG9tOiByYW5kb21BcGhvcmlzbSxcbn07XG4iLCJmdW5jdGlvbiBnZXRGb3JtYXREYXRlKGZtdCkge1xuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoKTtcbiAgY29uc3QgbyA9IHtcbiAgICAneSsnOiBuZXdEYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgJ00rJzogbmV3RGF0ZS5nZXRNb250aCgpICsgMSxcbiAgICAnZCsnOiBuZXdEYXRlLmdldERhdGUoKSxcbiAgICAnaCsnOiBuZXdEYXRlLmdldEhvdXJzKCksXG4gICAgJ20rJzogbmV3RGF0ZS5nZXRNaW51dGVzKCksXG4gIH07XG4gIGxldCBuZXdmbXQgPSBmbXQ7XG5cbiAgT2JqZWN0LmtleXMobykuZm9yRWFjaCgoaykgPT4ge1xuICAgIGlmIChuZXcgUmVnRXhwKGAoJHtrfSlgKS50ZXN0KG5ld2ZtdCkpIHtcbiAgICAgIGlmIChrID09PSAneSsnKSB7XG4gICAgICAgIG5ld2ZtdCA9IG5ld2ZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKGAke29ba119YCkuc3Vic3RyKDQgLSBSZWdFeHAuJDEubGVuZ3RoKSk7XG4gICAgICB9IGVsc2UgaWYgKGsgPT09ICdTKycpIHtcbiAgICAgICAgbGV0IGxlbnMgPSBSZWdFeHAuJDEubGVuZ3RoO1xuICAgICAgICBsZW5zID0gbGVucyA9PT0gMSA/IDMgOiBsZW5zO1xuICAgICAgICBuZXdmbXQgPSBuZXdmbXQucmVwbGFjZShSZWdFeHAuJDEsIChgMDAke29ba119YCkuc3Vic3RyKChgJHtvW2tdfWApLmxlbmd0aCAtIDEsIGxlbnMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld2ZtdCA9IG5ld2ZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKFJlZ0V4cC4kMS5sZW5ndGggPT09IDEpID8gKG9ba10pIDogKChgMDAke29ba119YCkuc3Vic3RyKChgJHtvW2tdfWApLmxlbmd0aCkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICAvLyBmb3IgKGNvbnN0IGsgaW4gbykge1xuICAvLyAgIGlmIChuZXcgUmVnRXhwKGAoJHtrfSlgKS50ZXN0KG5ld2ZtdCkpIHtcbiAgLy8gICAgIGlmIChrID09PSAneSsnKSB7XG4gIC8vICAgICAgIG5ld2ZtdCA9IG5ld2ZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKGAke29ba119YCkuc3Vic3RyKDQgLSBSZWdFeHAuJDEubGVuZ3RoKSk7XG4gIC8vICAgICB9IGVsc2UgaWYgKGsgPT09ICdTKycpIHtcbiAgLy8gICAgICAgbGV0IGxlbnMgPSBSZWdFeHAuJDEubGVuZ3RoO1xuICAvLyAgICAgICBsZW5zID0gbGVucyA9PT0gMSA/IDMgOiBsZW5zO1xuICAvLyAgICAgICBuZXdmbXQgPSBuZXdmbXQucmVwbGFjZShSZWdFeHAuJDEsIChgMDAke29ba119YCkuc3Vic3RyKChgJHtvW2tdfWApLmxlbmd0aCAtIDEsIGxlbnMpKTtcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIG5ld2ZtdCA9IG5ld2ZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKFJlZ0V4cC4kMS5sZW5ndGggPT09IDEpID8gKG9ba10pIDogKChgMDAke29ba119YCkuc3Vic3RyKChgJHtvW2tdfWApLmxlbmd0aCkpKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vIH1cblxuICByZXR1cm4gbmV3Zm10O1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRGb3JtYXREYXRlO1xuIiwiZnVuY3Rpb24gbGF6eUxvYWRXaXRob3V0REIoKSB7XG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuICBlbGVtZW50LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgZWxlbWVudC5hc3luYyA9IHRydWU7XG4gIGVsZW1lbnQuc3JjID0gJy4vZGlzdC9zY3JpcHRzL2xhenlMb2FkLm1pbi5qcyc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxhenlMb2FkV2l0aG91dERCO1xuIiwiZnVuY3Rpb24gaXRlbUdlbmVyYXRvcihkYXRhQXJyKSB7XG4gIGNvbnN0IHRlbXBsYXRlID0gSGFuZGxlYmFycy50ZW1wbGF0ZXMubGk7XG4gIGxldCByZXN1bHQgPSBkYXRhQXJyO1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShkYXRhQXJyKSkge1xuICAgIHJlc3VsdCA9IFtkYXRhQXJyXTtcbiAgfVxuICBjb25zdCByZW5kZXJlZCA9IHRlbXBsYXRlKHsgbGlzdEl0ZW1zOiByZXN1bHQgfSk7XG5cbiAgcmV0dXJuIHJlbmRlcmVkLnRyaW0oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXRlbUdlbmVyYXRvcjtcbiIsImZ1bmN0aW9uIHNlbnRlbmNlR2VuZXJhdG9yKHRleHQpIHtcbiAgY29uc3QgdGVtcGxhdGUgPSBIYW5kbGViYXJzLnRlbXBsYXRlcy5saTtcbiAgY29uc3QgcmVuZGVyZWQgPSB0ZW1wbGF0ZSh7IHNlbnRlbmNlOiB0ZXh0IH0pO1xuXG4gIHJldHVybiByZW5kZXJlZC50cmltKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNlbnRlbmNlR2VuZXJhdG9yO1xuIiwiZnVuY3Rpb24gdGVtcGxhdGUgKCkge1xuICB2YXIgdGVtcGxhdGUgPSBIYW5kbGViYXJzLnRlbXBsYXRlLCB0ZW1wbGF0ZXMgPSBIYW5kbGViYXJzLnRlbXBsYXRlcyA9IEhhbmRsZWJhcnMudGVtcGxhdGVzIHx8IHt9O1xudGVtcGxhdGVzWydsaSddID0gdGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCIgIDxsaSBjbGFzcz1cXFwiYXBob3Jpc21cXFwiPlwiXG4gICAgKyBjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnNlbnRlbmNlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zZW50ZW5jZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLHtcIm5hbWVcIjpcInNlbnRlbmNlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvbGk+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5saXN0SXRlbXMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5maW5pc2hlZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oNywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwiNVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMz1cImZ1bmN0aW9uXCIsIGFsaWFzND1jb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICA8bGkgY2xhc3M9XFxcImZpbmlzaGVkXFxcIiBkYXRhLWlkPVwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cXG4gICAgICAgIFwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5kYXRlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5kYXRlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJkYXRlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiA6IFxcbiAgICAgICAgPHNwYW4+XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmV2ZW50IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ldmVudCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiZXZlbnRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9zcGFuPlxcbiAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNsb3NlXFxcIj7Dlzwvc3Bhbj5cXG4gICAgICA8L2xpPlxcblwiO1xufSxcIjdcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9XCJmdW5jdGlvblwiLCBhbGlhczQ9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgPGxpIGRhdGEtaWQ9XCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczMgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlxcbiAgICAgICAgXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmRhdGUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmRhdGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMzID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImRhdGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIDogXFxuICAgICAgICA8c3Bhbj5cIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZXZlbnQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmV2ZW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMyA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJldmVudFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3NwYW4+XFxuICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2xvc2VcXFwiPsOXPC9zcGFuPlxcbiAgICAgIDwvbGk+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzW1wiaWZcIl0uY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zZW50ZW5jZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlO1xuIl19

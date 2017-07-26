'use strict';

const CONTROL_FIELD_ID = 'checksum';
const TARGET_URL = './check.php';
const CHECK_PERIOD = 5 * 1000;

function getCurrentData() {
  const target = document.getElementById(CONTROL_FIELD_ID);
  return target ? target.value : false;
}

function compare(newData) {
  const currentData = getCurrentData();
  return newData.trim() !== currentData.trim();
}

function checkUpdates(check, callback) {
  const xhr = new XMLHttpRequest();
  xhr.timeout = CHECK_PERIOD - 500;
  xhr.addEventListener('load', e => {
    console.log('Проверка');
    if (xhr.status !== 200) {
      setTimeout(checkUpdates, CHECK_PERIOD);
      return;
    }
    const actualData = xhr.response;
    if (check(actualData)) {
      console.log('Перезагрузка');
      return callback();
    }
    next();
  });
  xhr.addEventListener('error', e => {
    next();
  });
  xhr.addEventListener('timeout', e => {
    next();
  });
  xhr.open('GET', TARGET_URL);
  xhr.send();
}

function next() {
  setTimeout(() => {
    checkUpdates(compare, () => location.reload());
  }, CHECK_PERIOD);
}

next();

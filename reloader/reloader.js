'use strict';

const CONTROL_FIELD_ID = 'checksum';
const TIME_FIELD_ID = 'heatStartTime';
const TIME_OUTPUT = 'heatTime';
const NOTIFICATION_SOUND = './assets/trembling.mp3';

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength,padString) {
    targetLength = targetLength>>0;
    padString = String(padString || ' ');
    if (this.length > targetLength) {
      return String(this);
    }
    else {
      targetLength = targetLength-this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength/padString.length);
      }
      return padString.slice(0,targetLength) + String(this);
    }
  };
}

function getHeatTime() {
  const target = document.getElementById(TIME_FIELD_ID);
  const start = Number(target.value) * 1000;
  const period = Date.now() - start;

  const min = Math.floor(period / (1000 * 60));
  let sec = Math.floor(period % (1000 * 60) / 1000);
  if (sec === 60) {
    sec = 0;
  }
  return `${min.toFixed(0).padStart(2, '0')}:${sec.toFixed(0).padStart(2, '0')}`;
}

function showHeatTime() {
  const target = document.getElementById(TIME_OUTPUT);
  target.textContent = getHeatTime();
}

function getTargetUrl() {
  const target = document.getElementById(CONTROL_FIELD_ID);
  return target.dataset.url;
}

function getCheckPeriod() {
  const target = document.getElementById(CONTROL_FIELD_ID);
  return (Number(target.dataset.period) || 5) * 1000;
}

function getCurrentData() {
  const target = document.getElementById(CONTROL_FIELD_ID);
  return target ? target.value : false;
}

function compare(newData) {
  const currentData = getCurrentData();
  return newData.trim() !== currentData.trim();
}

function notify(callback) {
  const player = document.createElement('audio');
  player.src = NOTIFICATION_SOUND;
  document.body.appendChild(player);
  player.addEventListener('ended', callback);
  player.play();
}

function checkUpdates(check, callback) {
  const xhr = new XMLHttpRequest();
  xhr.timeout = getCheckPeriod() - 500;
  xhr.addEventListener('load', e => {
    if (xhr.status !== 200) {
      return next();
    }
    const actualData = xhr.response;
    if (check(actualData)) {
      console.log('Перезагрузка');
      return notify(callback);
    }
    next();
  });
  xhr.addEventListener('error', e => {
    next();
  });
  xhr.addEventListener('timeout', e => {
    next();
  });
  xhr.open('GET', getTargetUrl());
  xhr.send();
}

function next() {
  setTimeout(() => {
    checkUpdates(compare, () => location.reload());
  }, getCheckPeriod());
}

function init() {
  next();
  setInterval(showHeatTime, 1000);
}

init();

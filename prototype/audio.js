
var channel_max = 16;										// number of channels
audiochannels = new Array();
for (a=0;a<channel_max;a++) {									// prepare the channels
  audiochannels[a] = new Array();
  audiochannels[a]['channel'] = new Audio();						// create a new audio object
  audiochannels[a]['finished'] = -1;							// expected end time for this channel
  audiochannels[a]['name'] = "";
}
// Do music seperately
var musicchannel = [];
musicchannel['channel'] = new Audio();
musicchannel['finished'] = -1;							// expected end time for this channel

function play_sound(s) {
  for (a=0;a<audiochannels.length;a++) {
    thistime = new Date();
    if (audiochannels[a]['finished'] < thistime.getTime()) {			// is this channel finished?
      audiochannels[a]['name'] = s;
      audiochannels[a]['channel'].src = document.getElementById(s).src;
      audiochannels[a]['channel'].load();
      audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
      audiochannels[a]['channel'].play();
      break;
    }
  }
}

function stop_sound(s) {
  for (a=0;a<audiochannels.length;a++) {
    thistime = new Date();
    if (audiochannels[a]['name'] == s) {
      audiochannels[a]['channel'].pause();
      audiochannels[a]['finished'] = -1;
      break;
    }
  }
}

function restart_music(s) {
  thistime = new Date();
  if(musicchannel['finished'] > thistime.getTime()) {
    musicchannel['channel'].pause();
  }
  musicchannel['name'] = s;
  musicchannel['channel'].src = document.getElementById(s).src;
  musicchannel['channel'].load();
  musicchannel['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
  musicchannel['channel'].play();
  musicchannel['channel'].volume = .3;
}


/*

audio subsystem:

audio tags (with links to actual files) are defined in HTML. use only 16bit
.wav or .ogg files for cross platform action. 

music is played in it's own channel. all other audio effects are shared among
16 channels (so up to 16 other sounds can be played at the same time; probably
a reasonable limit?) 

*/

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
musicchannel['lasttoggle'] = -1;

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

function restart_music(s) {
  thistime = new Date();
  if(musicchannel['name'] != s) {
    musicchannel['channel'].pause();
  }
  musicchannel['name'] = s;
  musicchannel['channel'].src = document.getElementById(s).src;
  musicchannel['channel'].load();
  musicchannel['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
  musicchannel['channel'].play();
  musicchannel['channel'].volume = .3;
}

function pause_music() {
  musicchannel['channel'].pause();
}

function resume_music() {
  musicchannel['channel'].play();
}

function toggle_music() {
  thistime = new Date();

  // did we just try to toggle music? 
  if(thistime.getTime() - musicchannel['last_toggle'] < 200) {
    musicchannel['last_toggle'] = thistime.getTime();
    return;
  }

  musicchannel['last_toggle'] = thistime.getTime();  
  if(musicchannel['channel'].paused == true) {
    resume_music();
  } else {
    pause_music();
  }
}

/* this function is unnecessary and untested
 *
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
*/

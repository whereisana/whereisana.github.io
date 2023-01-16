/*!
 *  Howler.js Audio Player Demo
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

// Cache references to DOM elements.
var elms = ['timer', 'track', 'duration', 'background', 'progress', 'waveform', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'loading', 'playlist', 'playlistOverlay', 'list', 'volume', 'volumeOverlay', 'volumeSlider'];
elms.forEach(function(elm) {
  window[elm] = document.querySelector('[data-player-' + elm + ']');
});

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;

  // Display the title of the first track.
  track.innerHTML = playlist[0].title;

  // Setup the playlist display.
  playlist.forEach(function(song) {
    var div = document.createElement('div');
    div.className = 'list-song';
    div.innerHTML = song.title;
    div.onclick = function() {
      player.skipTo(playlist.indexOf(song));
    };
    list.appendChild(div);
  });
};
Player.prototype = {
  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  play: function(index) {
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    var data = self.playlist[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (data.howl) {
      sound = data.howl;

      // If song is changed, restart the waveform.
      if (index != self.index) {
        data.wave._play();
      }
    } else {
      sound = data.howl = new Howl({
        src: [data.file],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onplay: function() {
          // Display the duration.
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));

          // Start updating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

          // Start the wave animation if we have already loaded
          playBtn.classList.remove('active');

          // Show the pause button.
          if (sound.state() === 'loaded') {
            pauseBtn.classList.add('active');
            loading.classList.remove('active');
          } else {
            loading.classList.add('active');
            pauseBtn.classList.remove('active');
          }
        },
        onload: function() {
          // Start the wave animation.
          loading.classList.remove('active');
          pauseBtn.classList.add('active');
        },
        onend: function() {
          // Start the next song.
          self.skip('next');
        },
        onseek: function() {
          // Start updating the progress of the track.
          requestAnimationFrame(self.step.bind(self));
        }
      });

      // Add the waveform.
      data.wave = new Wave(sound._sounds[0]._node, waveform);
      data.wave.addAnimation(new data.wave.animations.Wave({
        lineColor: 'transparent',
        fillColor: {
          gradient: ['#f9bf52', '#e5b256', '#d1a559', '#be985b', '#aa8c5d']
        },
      }));
      sound._sounds[0]._node.crossOrigin = 'anonymous';
    }

    // Begin playing the sound.
    sound.play();

    // Update the track display.
    track.innerHTML = data.title;

    // Keep track of the index we are currently playing.
    self.index = index;
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    if (sound) {
      // Pause the sound.
      sound.pause();
      // Show the play button.
      playBtn.classList.add('active');
      pauseBtn.classList.remove('active');
    }
  },

  /**
   * Skip to the next or previous track.
   * @param  {String} direction 'next' or 'prev'.
   */
  skip: function(direction) {
    var self = this;

    // Get the next track based on the direction of the track.
    var index = 0;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }

    self.skipTo(index);
  },

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function(index) {
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    progress.style.width = '0%';

    // Play the new track.
    self.play(index);
  },

  /**
   * Set the volume and update the volume slider display.
   * @param  {Number} val Volume between 0 and 1.
   */
  volume: function(val) {
    // Update the global volume (affecting all Howls).
    Howler.volume(val);
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
  seek: function(per) {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Convert the percent into a seek position.
    if (sound.playing()) {
      sound.seek(sound.duration() * per);
    }
  },

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  /**
   * Toggle the playlist display on/off.
   */
  togglePlaylist: function() {
    playlist.classList.toggle('active');
    playlistOverlay.classList.toggle('active');
  },

  /**
   * Toggle the volume display on/off.
   */
  toggleVolume: function() {
    volume.classList.toggle('active');
    volumeOverlay.classList.toggle('active');
  },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
};

// Setup our new audio player class and pass it the playlist.
var player;
var songList = [];
client
  .getEntries({
    content_type: 'music',
    order:'sys.createdAt'
  })
  .then(function (entries){
    entries.items.forEach(function (entry) {
      songList.push({
        title: entry.fields.title,
        file: 'https:' + entry.fields.file.fields.file.url,
        howl: null,
        wave: null
      });
    });
    player = new Player(songList);
  });


// Bind our player controls.
playBtn.addEventListener('click', function() {
  player.play();
});
pauseBtn.addEventListener('click', function() {
  player.pause();
});
prevBtn.addEventListener('click', function() {
  player.skip('prev');
});
nextBtn.addEventListener('click', function() {
  player.skip('next');
});
background.addEventListener('click', function(event) {
  player.seek((event.clientX - background.getBoundingClientRect().left) / background.scrollWidth);
});
playlistBtn.addEventListener('click', function() {
  player.togglePlaylist();
});
playlist.addEventListener('click', function() {
  player.togglePlaylist();
});
volumeBtn.addEventListener('click', function() {
  player.toggleVolume();
});
volume.addEventListener('click', function() {
  player.toggleVolume();
});

// Update the current slider value (each time you drag the slider handle)
volumeSlider.oninput = function() {
  player.volume(this.value / 100);
}

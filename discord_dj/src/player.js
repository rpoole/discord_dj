const volume = 0.1;

class MusicPlayer {

  constructor(vc) {
    this.vc = vc;
    this.currentPlaylist = [];
    this.currentSong = null;
    this.isPlaying = false;
    this.shouldStop = false;
  }

  addSongToCurrentPlaylist(songFile) {
    this.currentPlaylist.push(songFile);
  }

  addSongsToCurrentPlaylist(songFiles) {
    this.currentPlaylist = this.currentPlaylist.concat(songFiles);
  }

  start() {
    if (this.isPlaying) {
      return Promise.reject('Already playing!');
    }

    return this._next();
  }

  _next() {
    if (this.currentPlaylist.length === 0) {
      return Promise.resolve('Playlist finished.');
    }

    let nextSong = this.currentPlaylist.shift();

    return this
      .vc
      .playFile(nextSong, {volume: volume})
      .then(intent => {
        this.isPlaying = true;

        intent.on('end', () => {
          this.isPlaying = false;

          if (this.shouldStop) {
            this.shouldStop = false;
          } else {
            this._next();
          }
        });
      });
  }

  skip() {
    if (!this.isPlaying) {
      return Promise.reject('Player not playing.');
    }

    return this
      .stop()
      .then(() => {
        return this._next();
      });
  }

  stop() {
    if (!this.isPlaying) {
      return Promise.reject('Player already stopped.');
    }
    this.shouldStop = true;

    this.vc.stopPlaying();
    return Promise.resolve('Player stopped.');
  }
}

module.exports = MusicPlayer;

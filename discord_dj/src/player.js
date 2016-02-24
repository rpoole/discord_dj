const volume = .1;

class MusicPlayer {

  constructor(vc) {
    this.vc = vc;
    this.currentPlaylist = [];
    this.currentSong = null;
  }

  addSongToCurrentPlaylist(songFile) {
    this.currentPlaylist.push(songFile);
  }

  addSongsToCurrentPlaylist(songFiles) {
    this.currentPlaylist = this.currentPlaylist.concat(songFiles);
  }

  next() {
    if (this.currentPlaylist.length === 0) {
      return Promise.resolve('Playlist finished.');
    }

    let nextSong = this.currentPlaylist.shift();

    return this
      .vc
      .playFile(nextSong, {volume: volume})
      .then(intent => {
        intent.on('end', () => {
          this.next();
        });
      });
  }

  skip() {
    return this
      .stop()
      .then(() => {
        return this.next();
      });
  }

  stop() {
    this.vc.stopPlaying();
    return Promise.resolve('Player stopped.');
  }
}

module.exports = MusicPlayer;

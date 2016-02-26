import MusicPlayer from '../src/player.js';

describe('MusicPlayer', () => {
  let player, vc, songs;

  beforeEach( () => {
    vc = {};

    player = new MusicPlayer(vc);
    songs = ['songA', 'songB'];
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(player.currentPlaylist).toEqual([]);
      expect(player.isPlaying).toEqual(false);
      expect(player.shouldStop).toEqual(false);
    });
  });

  describe('addSongToCurrentPlaylist', () => {
    it('should add a song to the current playlist', () => {
      player.addSongToCurrentPlaylist('song');
      expect(player.currentPlaylist).toEqual(['song']);
    });
  });

  describe('addSongsToCurrentPlaylist', () => {
    it('should add songs to the current playlist', () => {
      player.addSongsToCurrentPlaylist(songs);
      expect(player.currentPlaylist).toEqual(songs);
    });
  });

  describe('start', () => {
    beforeEach(() => {
      player._next = () => {
        return Promise.resolve();
      };
    });

    it('should fail if already playing', done => {
      player.isPlaying = true;
      player
        .start()
        .catch(() => {
          done();
        });
    });

    it('should start from the beginning of the playlist', done => {
      player.currentPlaylist = songs;
      player.playedSongs = ['songC'];
      player.start()
        .then( () => {
          expect(player.currentPlaylist[0]).toEqual('songC');
          done();
        });
    });

    it('should start a song', done => {
      player.currentPlaylist = songs;
      spyOn(player, '_next').and.callThrough();

      player.start()
        .then(() => {
          expect(player._next).toHaveBeenCalled();
          done();
        });
    });
  });
});

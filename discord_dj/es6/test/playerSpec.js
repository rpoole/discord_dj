import MusicPlayer from '../src/player.js';

describe('MusicPlayer', () => {
  let player, vc;

  beforeEach( () => {
    vc = {
    };

    player = new MusicPlayer(vc);
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
      player.addSongsToCurrentPlaylist(['song', 'song']);
      expect(player.currentPlaylist).toEqual(['song', 'song']);
    });
  });

  describe('start', () => {
    it('should fail if already playing');
    it('should start from the beginning of the playlist');
    it('should start a song');
  });
});

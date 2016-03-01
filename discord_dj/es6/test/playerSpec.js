import MusicPlayer from '../src/player.js';
import * as utils from '../src/utils.js';

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

    it('should shuffle the order if specified', done => {
      spyOn(utils, 'shuffleArray');
      player.currentPlaylist = songs;
      player.start(true)
        .then(() => {
          expect(utils.shuffleArray).toHaveBeenCalled();
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

  describe('_next', () => {
    let intent, fireEvent;
    beforeEach(() => {
      player.addSongsToCurrentPlaylist(songs);
      vc.playFile = jasmine.createSpy().and.callFake(() => {
        intent = {
          on(evt, fn) {
            if (evt && fireEvent) {
              player._next = () => { return Promise.resolve(); };
              spyOn(player, '_next').and.callThrough();
              fn();
            }
          },
        };
        return Promise.resolve(intent);
      });
    });

    it('should do nothing if no songs are left', done => {
      player.currentPlaylist = [];

      player
        ._next()
        .then(msg => {
          expect(msg).toBeDefined();
          done();
        });
    });

    it('should add a song to the played songs list', done => {
      player
        ._next()
        .then(() => {
          expect(player.playedSongs[0]).toEqual(songs[0]);
          done();
        });
    });

    it('should call playFile on the voiceConnection', done => {
      player
        ._next()
        .then(() => {
          expect(vc.playFile).toHaveBeenCalled();
          done();
        });
    });

    it('should mark the player as playing', done => {
      player
        ._next()
        .then(() => {
          expect(player.isPlaying).toEqual(true);
          done();
        });
    });

    describe('on end', function() {
      beforeEach(() => {
        fireEvent = true;
      });

      it('should set playing to false', done => {
        player
          ._next()
          .then(() => {
            expect(player.isPlaying).toEqual(false);
            done();
          });
      });

      it('should set shouldStop to false if shouldStop is true', done => {
        player.shouldStop = true;
        player
          ._next()
          .then(() => {
            expect(player.shouldStop).toEqual(false);
            done();
          });
      });

      it('should play the next song if shouldStop is false', done => {
        player.shouldStop = false;
        player
          ._next()
          .then(() => {
            // the spy is redefined when the event is fired,
            // so only 1 call should happen
            expect(player._next).toHaveBeenCalled();
            done();
          });
      });
    });
  });

  describe('skip', () => {
    beforeEach(() => {
      player.isPlaying = true;

      spyOn(player, 'stop').and.callFake(() => {
        return Promise.resolve();
      });

      spyOn(player, '_next').and.callFake(() => {
        return Promise.resolve();
      });
    });

    it('should fail if not playing', done => {
      player.isPlaying = false;
      player.skip()
        .catch(err => {
          expect(err).toBeDefined();
          done();
        });
    });

    it('should call stop', done => {
      player.skip()
        .then(() => {
          expect(player.stop).toHaveBeenCalled();
          done();
        });
    });

    it('should call _next', done => {
      player.skip()
        .then(() => {
          expect(player._next).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('stop', () => {
    beforeEach(() => {
      vc.stopPlaying = jasmine.createSpy();
      player.isPlaying = true;
    });

    it('should fail if not playing', done => {
      player.isPlaying = false;
      player.stop()
        .catch(err => {
          expect(err).toBeDefined();
          done();
        });
    });

    it('should set shouldStop to true', done => {
      player.stop()
        .then(() => {
          expect(player.shouldStop).toEqual(true);
          done();
        });
    });
    it('should call stopPlaying', done => {
      player.stop()
        .then(() => {
          expect(vc.stopPlaying).toHaveBeenCalled();
          done();
        });
    });
  });
});

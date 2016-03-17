/**
 * Created by sdonnelly on 3/7/2016.
 */
import mongoose from 'mongoose';

let Schema = mongoose.Schema;
let matchSchema = new Schema({
  "properties": {
    "result": {
      "id": "result",
        "type": "object",
        "properties": {
        "players": {
          "id": "players",
            "type": "array",
            "items": {
            "id": "9",
              "type": "object",
              "properties": {
              "account_id": {
                "id": "account_id",
                  "type": "integer"
              },
              "player_slot": {
                "id": "player_slot",
                  "type": "integer"
              },
              "hero_id": {
                "id": "hero_id",
                  "type": "integer"
              },
              "item_0": {
                "id": "item_0",
                  "type": "integer"
              },
              "item_1": {
                "id": "item_1",
                  "type": "integer"
              },
              "item_2": {
                "id": "item_2",
                  "type": "integer"
              },
              "item_3": {
                "id": "item_3",
                  "type": "integer"
              },
              "item_4": {
                "id": "item_4",
                  "type": "integer"
              },
              "item_5": {
                "id": "item_5",
                  "type": "integer"
              },
              "kills": {
                "id": "kills",
                  "type": "integer"
              },
              "deaths": {
                "id": "deaths",
                  "type": "integer"
              },
              "assists": {
                "id": "assists",
                  "type": "integer"
              },
              "leaver_status": {
                "id": "leaver_status",
                  "type": "integer"
              },
              "last_hits": {
                "id": "last_hits",
                  "type": "integer"
              },
              "denies": {
                "id": "denies",
                  "type": "integer"
              },
              "gold_per_min": {
                "id": "gold_per_min",
                  "type": "integer"
              },
              "xp_per_min": {
                "id": "xp_per_min",
                  "type": "integer"
              },
              "level": {
                "id": "level",
                  "type": "integer"
              },
              "gold": {
                "id": "gold",
                  "type": "integer"
              },
              "gold_spent": {
                "id": "gold_spent",
                  "type": "integer"
              },
              "hero_damage": {
                "id": "hero_damage",
                  "type": "integer"
              },
              "tower_damage": {
                "id": "tower_damage",
                  "type": "integer"
              },
              "hero_healing": {
                "id": "hero_healing",
                  "type": "integer"
              },
              "ability_upgrades": {
                "id": "ability_upgrades",
                  "type": "array",
                  "items": {
                  "id": "12",
                    "type": "object",
                    "properties": {
                    "ability": {
                      "id": "ability",
                        "type": "integer"
                    },
                    "time": {
                      "id": "time",
                        "type": "integer"
                    },
                    "level": {
                      "id": "level",
                        "type": "integer"
                    }
                  }
                }
              }
            }
          }
        },
        "radiant_win": {
          "id": "radiant_win",
            "type": "boolean"
        },
        "duration": {
          "id": "duration",
            "type": "integer"
        },
        "start_time": {
          "id": "start_time",
            "type": "integer"
        },
        "match_id": {
          "id": "match_id",
            "type": "integer"
        },
        "match_seq_num": {
          "id": "match_seq_num",
            "type": "integer"
        },
        "tower_status_radiant": {
          "id": "tower_status_radiant",
            "type": "integer"
        },
        "tower_status_dire": {
          "id": "tower_status_dire",
            "type": "integer"
        },
        "barracks_status_radiant": {
          "id": "barracks_status_radiant",
            "type": "integer"
        },
        "barracks_status_dire": {
          "id": "barracks_status_dire",
            "type": "integer"
        },
        "cluster": {
          "id": "cluster",
            "type": "integer"
        },
        "first_blood_time": {
          "id": "first_blood_time",
            "type": "integer"
        },
        "lobby_type": {
          "id": "lobby_type",
            "type": "integer"
        },
        "human_players": {
          "id": "human_players",
            "type": "integer"
        },
        "leagueid": {
          "id": "leagueid",
            "type": "integer"
        },
        "positive_votes": {
          "id": "positive_votes",
            "type": "integer"
        },
        "negative_votes": {
          "id": "negative_votes",
            "type": "integer"
        },
        "game_mode": {
          "id": "game_mode",
            "type": "integer"
        },
        "flags": {
          "id": "flags",
            "type": "integer"
        },
        "engine": {
          "id": "engine",
            "type": "integer"
        }
      }
  }
}
});

module.exports = mongoose.model('matches', matchSchema);
var trmp = {
	
	card_spec: {}, // attribute names, units and high/low precedence
	attrs: {},
	low_wins: [],
	high_wins: [],
	cards: [], // list of all cards
	/*
	a card is an object with these attribute patterns...
	card = {
		'img_url': 'http://images.com/card1.jpg',
		'name': 'Dachshund',
		'values': [200, 5, 123, 999, 12] // these are type Numbers
	}
	*/
	player_factory: function(name, memory) {
		return {
			name: name,
			cards: [],		// cards in hand
			memorised: [],  // cards memorised
			memory: memory, //number of cards a player can remember being played
			remember_cards: function(cards) {
				/*
				cards = array of cards to remember
				*/
				var memorised = cards.concat(this.memorised);
				this.memorised = memorised.slice(0, this.memory);
			}
		} 
	},
	
	player1: null,
	player2: null,
	turn: 0,
	in_control: null,
	cards_in_play: [],

	init: function(card_spec, cards) {
		this.player1 = this.player_factory('Bill', 4);
		this.player2 = this.player_factory('Frank', 4);
        this.in_control = this.player1;
		this.card_spec = card_spec;
		var attrs = {};
		for (var i=0; i<card_spec.length; i++) {
			card_spec[i]['index'] = i;
			attrs[card_spec[i].label] = card_spec[i];
		}
		this.attrs = attrs;
		// unoack the cards
		var card_objects = [];
		for (var i=0; i<cards.length; i++) {
			var card = {
				'name': cards[i][0],
			};
			for (var x=0; x<cards[i][1].length; x++) {
                var lbl = card_spec[x].label;
				card[lbl] = cards[i][1][x];
			}
			card_objects.push(card);
		}
		this.cards = card_objects;
	},

	reset_player: function(player) {
		player.cards = [];
		player.memorised = [];
		return player;
	},

	start_game: function() {
		this.turn = 0
		this.player1 = this.reset_player(this.player1);
		this.player2 = this.reset_player(this.player2);
		this.deal_cards(this.shuffle_pack());
	},

	shuffle_pack: function() {
		var cards = this.cards;
		cards.sort(function() {
			return (Math.random() > 0.5)
		});
		return cards;
	},

	deal_cards: function(cards) {
		var hand_size = Math.floor(this.cards.length/2);
		this.player1.cards = this.cards.splice(0, hand_size);
		this.player2.cards = this.cards;
	},

	get_turn_cards: function() {
		if (this.cards_in_play.length == 0) {
			this.cards_in_play = [this.player1.cards.shift(), this.player2.cards.shift()]
		}
		return this.cards_in_play;
	},

	compare_cards: function(attr, cards) {
		// attr = string, name of attribute to compare
		// cards = array if two cards to compare
		// returns index of the winning card or -1 for a tie
		var vals = [];
		for (var q=0; q<cards.length; q++) {
			vals.push(cards[q][attr]);
		}
		var high = this.attrs[attr].high,
		    winning_value = vals[0],
			winning_index = 0;
		for (var q=1; q<vals.length; q++) {
			if (vals[q] == winning_value) {
				//tie
				winning_index = -1
			}
			else if (high && (vals[q] > winning_value)) {
				winning_value = vals[q];
				winning_index = q;
			}
			else if (!high && (vals[q] < winning_value)) {
				winning_value = vals[q];
				winning_index = q;
			}
		}
		return winning_index;
	},
	
	complete_turn: function(attr) {
		// place the cards with the pack of the winner
		// winner = a player
		// cards = an array of te two cards in play
		if (this.cards_in_play) {
			var winner = this.compare_cards(attr, this.cards_in_play),
			    winning_player = (winner == 0) ? this.player2 : this.player1;
			    // TODO: handle tie
			winning_player.cards = winning_player.cards.concat(this.cards_in_play)
		}
		// TODO: check for a winner
	}
};
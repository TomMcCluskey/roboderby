var testData = {
  botNumber: 0,
  poweredDown: false,
  hand: [
      { "120": "Rotate Right"},
      { "20": "U Turn" },
      { "39": "Rotate Right" },
      { "43": "Back Up" },
      { "84": "Move 3" },
      { "58": "Move 1" },
      { "63": "Move 1" },
      { "70": "Move 2" },
      { "7": "Rotate Left" }
  ]
};

var numPhases = 5;
var app = {};

app.Card = Backbone.Model.extend ({ });

app.Phase = Backbone.Model.extend ({ });

app.Hand = Backbone.Collection.extend ({
  model: app.Card,
  comparator: 'sequence'
});

app.hand = new app.Hand();

var parseHand = function(handData) {
  var parsedHand = [];
  for ( var cardCounter = 0; cardCounter < handData.length; cardCounter++) {
    var card = parseCard(handData[cardCounter]);
    parsedHand.push(card);
  }
  console.log(parsedHand);
  return parsedHand;
};

var parseCard = function(cardData) {
  var seq = Object.keys(cardData)[0];
  return { sequence: seq, move: cardData[seq] };
};

app.Register = Backbone.Collection.extend ({
  model: app.Phase,
  comparator: 'phaseNumber'
});

app.hand.add(parseHand(testData.hand));

app.CardView = Backbone.View.extend ({
  el: '#cards',
  events: '',
  initialize: function() {
    this.collection.on('remove', this.render, this);
  },
  render: function() {
    var outputHtml = '';
  },
  addCard: function(cardData) {
    // Does it make sense to have this happen here? Seems like
    // this should be more for adding from drag/drops
    // var seq = Object.keys(cardData)[0];
    // this.collection.add({sequence: seq, move: cardData[seq]});
  },
  dragCard: function() {
    //
  }
});

app.RegisterView = Backbone.View.extend ({
  el: '#register',
  events: '',
  initialize: function() {
    //
  },
  render: function() {
    //
  },
  addCard: function() {
    //
  }
});

app.ButtonsView = Backbone.View.extend ({
  el: '#buttons',
  events: '',
  initialize: function() {
    //
  },
  render: function() {
    //
  }
});

$(function () {
  var hand = testData.hand;
  cards = [];
  //console.log(hand);
  for (var regCount = 0; regCount < numPhases; regCount ++) {
    // make a new CardView and add data to it
    // This makes one View for the whole hand.
    // We need one View per card in the hand.
    cards.push(new app.CardView({collection: app.hand}));
    //app.CardView.addCard(hand[regCount]);
  }
} );

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

var app = {};

app.numPhases = 5;
app.startingPhases = [];

app.Card = Backbone.Model.extend ({ });

app.Phase = Backbone.Model.extend ({ });

app.Hand = Backbone.Collection.extend ({
  model: app.Card,
  comparator: 'sequence' // Compares as string
});

app.Register = Backbone.Collection.extend ({
  model: app.Phase,
  comparator: 'phaseNumber'
});

app.hand = new app.Hand();
app.register = new app.Register();

app.parseHand = function(handData) {
  var parsedHand = [];
  for ( var cardCounter = 0; cardCounter < handData.length; cardCounter++) {
    var card = app.parseCard(handData[cardCounter]);
    parsedHand.push(card);
  }
  return parsedHand;
};

app.parseCard = function(cardData) {
  var seq = Object.keys(cardData)[0];
  return { sequence: seq, move: cardData[seq] };
};

app.hand.add(app.parseHand(testData.hand));
app.register.add(['empty', 'empty', 'empty', 'empty', 'empty']);

app.CardView = Backbone.View.extend ({
  el: '#cards',
  events: {
    "dragstart .card": "dragCard",
    "drop .card"     : "dropCard",
    "dragover .card" : "overValid",
  },
  initialize: function() {
    this.collection.on('remove', this.render, this);
    this.render();
  },
  render: function() {
    var outputHtml = '';
    var compiledTemplate = _.template('<div draggable="true" class="card"><p class="sequence"><%=sequence%></p><p class="move"><%=move%></p></div>');
    this.collection.models.forEach( function(model) {
      var data = {};
      data.sequence = model.get('sequence');
      data.move = model.get('move');
      outputHtml += compiledTemplate(data);
    });
    $(this.el).html(outputHtml);
  },
  addCard: function(cardData) {
  },
  dragCard: function(dragEvent, data, clone, element) {
    console.log(dragEvent);
    var seq = ($(dragEvent.target).children().first().text());
    var val = ($(dragEvent.target).children().last().text());
    console.log("sequence: " + seq + "; move: " + val);
  },
  dropCard: function(card) {
    var seq = ($(card.target).children().first().text());
    var val = ($(card.target).children().last().text());
    console.log("card dropped!");
    console.log(card);
  },
  overValid: function() {
    event.preventDefault();
    console.log("good target!");
  }
});

app.RegisterView = Backbone.View.extend ({
  el: '#register',
  model: this.Phase,
  events: '',
  initialize: function() {
    this.render();
  },
  render: function() {
    var outputHtml = '';
    var compiledTemplate = _.template('<div draggable="true" class="phase"><p class="sequence"><%=sequence%></p><p class="move"><%=move%></p></div>');
    this.collection.models.forEach( function(model) {
      var data = {};
      data.sequence = model.get('sequence');
      data.move = model.get('move');
      outputHtml += compiledTemplate(data);
    });
    $(this.el).html(outputHtml);
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
  var registerView = new app.RegisterView({collection: app.register});
  var cardView = new app.CardView({collection: app.hand});
} );

// Think we need individual views for each card after all, with associated models
// and collections so we can, eg, this.collection.remove(this.model);

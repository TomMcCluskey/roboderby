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
app.cardArray = [];
app.regArray = [];

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

app.HandView = Backbone.View.extend ({
  el: '#cards',
  events: {
    //
  },
  initialize: function() {
    this.childViews = [];
    //
  },
  render: function() {
    var self = this;
    this.childViews.forEach(function (view){
      view.remove();
    });
    this.childViews = [];

    console.log(this.collection);
    this.collection.each(function (item){
      var cardView = new app.CardView({model: item});
      cardView.render();
      self.childViews.push(cardView.$el);
    });
    console.log(self.childViews);

    this.childViews.forEach(function (item){
      self.$el.append(item);
    });
  }
});

app.CardView = Backbone.View.extend ({
  className: 'card',
  attributes: {'draggable': 'true'},
  events: {
    // these are problematic. Doing something to one card fires the appropriate
    // event on all cards.
    "dragstart .card": "dragCard",
    "drop .card"     : "dropCard",
    "dragover .card" : "overValid",
    "click .card"    : "clicked"
  },
  initialize: function() {
    // this.collection.on('remove', this.render, this);
    // this.render(); // This will cause render to run twice on initialization
  },
  render: function() {
    var outputHtml = '';
    var compiledTemplate = _.template('<p class="sequence"><%=sequence%></p><p class="move"><%=move%></p>');
    var data = {};
    data.sequence = this.model.get('sequence');
    data.move = this.model.get('move');
    outputHtml += compiledTemplate(data);
    $(this.el).append(outputHtml);
  },
  addCard: function(cardData) {
  },
  dragCard: function(dragEvent, data, clone, element) {
    var seq = ($(dragEvent.target).children().first().text());
    var val = ($(dragEvent.target).children().last().text());
    console.log("sequence: " + seq + "; move: " + val);
    console.log(dragEvent);
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
  },
  clicked: function() {
    console.log(this.model.attributes);
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
    var compiledTemplate = _.template('<div class="phase" draggable="true" id="phase<%=phaseNum%>"><p class="sequence"><%=sequence%></p><p class="move"><%=move%></p></div>');
    var data = {};
    data.sequence = this.model.get('sequence');
    data.move = this.model.get('move');
    data.phaseNum = this.model.phaseNum;
    outputHtml += compiledTemplate(data);
    $(this.el).append(outputHtml);
  },
  addCard: function() {
    //
  }
});

app.ButtonsView = Backbone.View.extend ({
  el: '#buttons',
  events: '',
  initialize: function() {
    var outputHtml = '';
    if(JSON.parse(testData.poweredDown)) {
      outputHtml = '<p>Waiting for other players while powered down</p>';
    } else {
      outputHtml = '<button id="standardMove">Go!</button><button id="powerDown">Power Down!</button>';
    }
    this.render(outputHtml);
  },
  render: function(outputHtml) {
    $(this.el).append(outputHtml);
  }
});

$(function () {
  var hand = testData.hand;
  var handView = new app.HandView({collection: app.hand});
  handView.render();
  var phaseNum = 0;
  app.register.models.forEach( function(model) {
    model.phaseNum = phaseNum;
    app.regArray.push(new app.RegisterView( {model: model} ));
    phaseNum++;
  });
  app.buttonView = new app.ButtonsView();
} );

// Think we need individual views for each card after all, with associated models
// and collections so we can, eg, this.collection.remove(this.model);

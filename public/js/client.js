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
_(app.numPhases).times(function(){
  app.register.add({sequence: undefined, move: undefined});
});

app.tempCard = {  sequence: undefined,
                  move: undefined,
                  validDrop: false};

app.tempPhase = { sequence: undefined,
                  move: undefined,
                  validDrop: false};

app.HandView = Backbone.View.extend ({
  el: '#cards',
  events: {
    "drop": "dropCard",
    "dragover" : "overValid",
    "dragend" : "dragEnd",
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
    this.collection.each(function (item){
      var cardView = new app.CardView({model: item});
      cardView.parentView = self;
      cardView.render();
      self.childViews.push(cardView.$el);
    });
    this.childViews.forEach(function (item){
      self.$el.append(item);
    });
  },
  overValid: function() {
    event.preventDefault();
  },
  dropCard: function(card) {
    app.tempCard.validDrop = true;
    app.tempPhase.validDrop = true;
    if (app.tempPhase.sequence) {
      this.collection.add({move: app.tempPhase.move,
                           sequence: app.tempPhase.sequence});
    }
    this.render();
  },
});

app.CardView = Backbone.View.extend ({
  className: 'card',
  attributes: {'draggable': 'true'},
  events: {
    "dragstart": "dragCard",
    "dragend": "endCardDrag",
    "click"    : "clicked"
  },
  initialize: function() {
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
    app.tempCard.sequence = this.model.get('sequence');
    app.tempCard.move = this.model.get('move');
  },
  endCardDrag: function(card) {
    console.log('cardView drag end:');
    app.tempCard.sequence = undefined;
    app.tempCard.move = undefined;
    if (app.tempCard.validDrop) {
      console.log('destroying card!');
      this.model.destroy();
    }
    this.parentView.render();
    console.log(card);
  },
});

app.RegisterView = Backbone.View.extend ({
  el: '#register',
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
    this.collection.each(function (item){
      var phaseView = new app.PhaseView({model: item});
      phaseView.parentView = self;
      phaseView.render();
      self.childViews.push(phaseView.$el);
    });
    this.childViews.forEach(function (item){
      self.$el.append(item);
    });
  }
});

app.PhaseView = Backbone.View.extend ({
  className: 'phase',
  attributes: {'draggable': 'true'},
  events: {
    "dragstart": "dragCard",
    "dragend"  : "dragEnd",
    "drop"     : "dropCard",
    "dragover" : "overValid",
    "click"    : "clicked"
  },
  initialize: function() {
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
    app.tempPhase.move = this.model.get('move');
    app.tempPhase.sequence = this.model.get('sequence');
    app.tempPhase.validDrop = false;
  },
  dropCard: function(card) {
    if (!this.model.has('sequence')) {
      app.tempCard.validDrop = true;
      app.tempPhase.validDrop = true;
      if (app.tempCard.sequence) {
        this.model.set({move: app.tempCard.move,
                        sequence: app.tempCard.sequence});
      } else if (app.tempPhase.sequence) {
        this.model.set({move: app.tempPhase.move,
                        sequence: app.tempPhase.sequence});
      }
    }
    this.render();
  },
  dragEnd: function(card) {
    console.log('cardView drag end:');
    app.tempPhase.sequence = undefined;
    app.tempPhase.move = undefined;
    console.log(app.tempPhase);
    if (app.tempPhase.validDrop) {
      console.log('destroying phase!');
      this.model.set({ sequence: undefined,
                       move: undefined });
    }
    this.parentView.render();
    console.log(card);
  },
  overValid: function() {
    event.preventDefault();
  },
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
  var registerView = new app.RegisterView({collection: app.register});
  registerView.render();
  app.buttonView = new app.ButtonsView();
} );

// Think we need individual views for each card after all, with associated models
// and collections so we can, eg, this.collection.remove(this.model);

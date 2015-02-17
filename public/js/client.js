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
  return { sequence: seq, value: cardData[seq] };
};

app.hand.add(app.parseHand(testData.hand));
_(app.numPhases).times(function(){
  app.register.add({sequence: undefined, value: undefined});
});

app.tempCard = {  sequence: undefined,
                  value: undefined,
                  validDrop: false};

app.tempPhase = { sequence: undefined,
                  value: undefined,
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
      this.collection.add({value: app.tempPhase.value,
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
    var compiledTemplate = _.template('<p class="sequence"><%=sequence%></p><p class="value"><%=value%></p>');
    var data = {};
    data.sequence = this.model.get('sequence');
    data.value = this.model.get('value');
    outputHtml += compiledTemplate(data);
    $(this.el).append(outputHtml);
  },
  addCard: function(cardData) {
  },
  dragCard: function() {
    app.tempCard.sequence = this.model.get('sequence');
    app.tempCard.value = this.model.get('value');
  },
  endCardDrag: function(card) {
    app.tempCard.sequence = undefined;
    app.tempCard.value = undefined;
    if (app.tempCard.validDrop) {
      this.model.destroy();
      app.tempCard.validDrop = false;
    }
    this.parentView.render();
  },
});

app.RegisterView = Backbone.View.extend ({
  el: '#register',
  events: {
  },
  initialize: function() {
    this.childViews = [];
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
    var compiledTemplate = _.template('<p class="sequence"><%=sequence%></p><p class="value"><%=value%></p>');
    var data = {};
    data.sequence = this.model.get('sequence');
    data.value = this.model.get('value');
    outputHtml += compiledTemplate(data);
    $(this.el).append(outputHtml);
  },
  addCard: function(cardData) {
  },
  dragCard: function() {
    app.tempPhase.value = this.model.get('value');
    app.tempPhase.sequence = this.model.get('sequence');
    app.tempPhase.validDrop = false;
  },
  dropCard: function(card) {
    if (!this.model.has('sequence')) {
      app.tempCard.validDrop = true;
      app.tempPhase.validDrop = true;
      if (app.tempCard.sequence) {
        this.model.set({value: app.tempCard.value,
                        sequence: app.tempCard.sequence});
      } else if (app.tempPhase.sequence) {
        this.model.set({value: app.tempPhase.value,
                        sequence: app.tempPhase.sequence});
      }
    }
    this.render();
  },
  dragEnd: function(card) {
    app.tempPhase.sequence = undefined;
    app.tempPhase.value = undefined;
    if (app.tempPhase.validDrop) {
      this.model.set({ sequence: undefined,
                       value: undefined });
    }
    this.parentView.render();
  },
  overValid: function() {
    event.preventDefault();
  },
});

app.goWatcher = function (registerView) {
  $('#standardMove').click(function() {
  var socket = new WebSocket('ws://localhost/api/turnSubmission');
    function unplayed(phase) {
      return !((phase.value !== undefined) && (phase.sequence !== undefined));
    }
    var moveSubmission = {};
    moveSubmission.botNumber = testData.botNumber;
    moveSubmission.poweredDown = testData.poweredDown;
    moveSubmission.register = registerView.collection.toJSON();
    if (moveSubmission.register.some(function(item) { 
      return unplayed(item); } )) {
      return window.alert('You have unplayed phases!');
    }
    console.log(moveSubmission);
    // $.post('/api/turnSubmission/', moveSubmission);
  });
};

app.powerDownWatcher = function () {
  $('#powerDown').click(function() {
    if(window.confirm('Are you sure you want to power down?')) {
      console.log('Power down selected');
      powerDownSubmission= { botNumber: testData.botNumber,
                             poweredDown: true,
                             register: [] };
    }
    $.ajax({
      url: '/api/turnSubmission/',
      type: 'POST',
      data: powerDownSubmission
    });
  });
};

$(function () {
  var hand = testData.hand;
  var handView = new app.HandView({collection: app.hand});
  handView.render();
  var phaseNum = 0;
  var registerView = new app.RegisterView({collection: app.register});
  registerView.render();
  app.goWatcher(registerView);
  app.powerDownWatcher();
  var socket = new WebSocket('ws://localhost');
} );

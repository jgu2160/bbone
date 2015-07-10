var app = {};

// Models
app.Beer = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
        name: '',
        likes: 0
    }
});

// Collections
app.BeerList = Backbone.Collection.extend({
    model: app.Beer,
    url: "http://beer.fluentcloud.com/v1/beer",
});

app.beerList = new app.BeerList();

// Views
app.BeerView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this;
    },
    initialize: function(){
        this.model.on('change', this.render, this);
    },
    events: {
        'dblclick label' : 'edit',
        'keypress .edit' : 'updateOnEnter',
        'blur .edit' : 'close',
    },
    edit: function(){
        this.$el.addClass('editing');
        this.input.focus();
    },
    close: function(){
        var value = this.input.val().trim();
        if(value) {
            this.model.save({likes: value});
        }
        this.$el.removeClass('editing');
    },
    updateOnEnter: function(e){
        if(e.which == 13){
            this.close();
        }
    },
});

app.AppView = Backbone.View.extend({
    el: '#beerapp',
    initialize: function () {
        this.input = this.$('#new-beer');
        app.beerList.on('add', this.addAll, this);
        app.beerList.on('reset', this.addAll, this);
        app.beerList.fetch();
    },
    events: {
        'keypress #new-beer': 'createBeerOnEnter'
    },
    createBeerOnEnter: function(e){
        if ( e.which !== 13 || !this.input.val().trim() ) { // ENTER_KEY = 13
            return;
        }
        app.beerList.create(this.newAttributes());
        this.input.val(''); // clean input box
    },
    addOne: function(beer){
        var view = new app.BeerView({model: beer});
        $('#beer-list').append(view.render().el);
    },
    addAll: function(){
        this.$('#beer-list').html('');
        _.each(app.beerList.models, this.addOne);
    },
    newAttributes: function(){
        return {
            name: this.input.val().trim(),
            likes: 0,
        };
    }
});

// Routers
app.Router = Backbone.Router.extend({
    routes: {
        '*filter' : 'setFilter'
    }
});

// Initializers
app.router = new app.Router();
Backbone.history.start();
app.appView = new app.AppView();

$(function(){
  window.Node = Backbone.Model.extend({
    defaults: function() {
      return {
      };
    },

   initialize: function() {
     this.nodes = new NodeList;
     this.nodes.url = "/api/" + this.id + "/";
     this.nodes.bind("reset", this.updateCounts);
   },

   parse: function (){
     console.log("parsing item");
   },

    toggle: function() {
    }



  });


  window.NodeList = Backbone.Collection.extend({
    model: Node,
    url: "/api/"
  });
  window.Nodes = new NodeList;

  window.NodeView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#item-template').html()),
    events: {
      "dblclick div.node-label"    : "edit",
      "click span.node-destroy"   : "clear",
      "keypress .node-input"      : "updateOnEnter"
    },

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    render: function() {
      console.log("render node");
      console.log(this.model);
      $(this.el).html(this.template(this.model.toJSON()));
      this.setLabel();
      return this;
    },

    setLabel: function() {
      var label = this.model.get('label');
      if (!label) {
	label = "no label";
      }
      this.$('.node-label').text(label);
      this.input = this.$('.node-input');
      this.input.bind('blur', _.bind(this.close, this)).val(label);
    },

    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    close: function() {
      this.model.save({label: this.input.val()});
      $(this.el).removeClass("editing");
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    remove: function() {
      $(this.el).remove();
    },

    clear: function() {
      this.model.destroy();
    }

  });

  window.AppView = Backbone.View.extend({
    el: $("#takoapp"),

    events: {
      "keypress #new-node":  "createOnEnter",
      "keyup #new-node":     "showTooltip",
      "click .node-clear a": "clearCompleted"
    },

    initialize: function() {
      console.log("initialize()");
      this.input    = this.$("#new-node");

      Nodes.bind('add',   this.addOne, this);
      Nodes.bind('reset', this.addAll, this);
      Nodes.bind('all',   this.render, this);
      Nodes.fetch();
    },

    render: function() {
      console.log("render");
    },

    addOne: function(node) {
      console.log("addOne");
      var view = new NodeView({model: node});
      this.$("#node-list").append(view.render().el);
    },

    addAll: function() {
      Nodes.each(this.addOne);
    },

    createOnEnter: function(e) {
      console.log("create on enter");
      var label = this.input.val();
      console.log(label);
      if (!label || e.keyCode != 13) return;
      Nodes.create({label: label});
      this.input.val('');
    },

    clearCompleted: function() {
      return false;
    },

    showTooltip: function(e) {
      var tooltip = this.$(".ui-tooltip-top");
      var val = this.input.val();
      tooltip.fadeOut();
      if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
      if (val == '' || val == this.input.attr('placeholder')) return;
      var show = function(){ tooltip.show().fadeIn(); };
      this.tooltipTimeout = _.delay(show, 1000);
    }

  });

  window.App = new AppView;
});

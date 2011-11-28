$(function(){
  window.Node = Backbone.Model.extend({
    defaults: function() {
      return {
	'children_count' : 0,
	'parent_id' : 0
      };
    },

   initialize: function() {
     ChildNodeList = Backbone.Collection.extend({
        model: Node,
	url: "/api/" + this.id + "/"
     });
     this.children = new ChildNodeList;
     this.children.url = "/api/" + this.id + "/";
     this.htmlId = "node-" + this.cid;
   },

   loadChildren: function() {
     this.children.fetch();
     console.log("children fetched");
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
      "click span.node-children-expander"   : "showChildren",
      "keypress .node-input"      : "updateOnEnter"
    },

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
      this.model.children.bind('reset',this.addAll,this);
    },

    render: function() {
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
    },

    addOne: function(node) {
      console.log("node.addOne");
      console.log(node.get('label'));
      var view = new NodeView({model: node});
      console.log(node.get('parent_id'));
      this.$("#node-" + node.get('parent_id') + " ul.children-node-list").append(view.render().el);
    },

    addAll: function() {
      this.model.children.each(this.addOne);
    },

    showChildren: function() {
      this.model.loadChildren();
      $(this.el).addClass("showing-children");
    }

  });

  window.AppView = Backbone.View.extend({
    el: $("#takoapp"),

    events: {
      "keypress #new-node":  "createOnEnter",
      "keyup #new-node":     "showTooltip"
    },

    initialize: function() {
      this.input    = this.$("#new-node");

      Nodes.bind('add',   this.addOne, this);
      Nodes.bind('reset', this.addAll, this);
      Nodes.bind('all',   this.render, this);
      Nodes.fetch();
    },

    render: function() {

    },

    addOne: function(node) {
      var view = new NodeView({model: node});
      this.$("#node-list").append(view.render().el);
      console.log("addOne done");
    },

    addAll: function() {
      Nodes.each(this.addOne);
    },

    createOnEnter: function(e) {
      var label = this.input.val();
      if (!label || e.keyCode != 13) return;
      Nodes.create({label: label});
      this.input.val('');
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

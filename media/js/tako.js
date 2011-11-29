$(function(){
  window.idMap = { };
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
     this.showing_children = false;
     window.idMap[this.get('id')] = this.htmlId;
   },

   toFullJSON: function() {
     var j = this.toJSON();
     j['htmlId'] = this.htmlId;
     return j;
   },

   getParent: function () {

   },

   toggleChildren: function() {
     if (!this.showing_children) {
       this.children.fetch();
       this.showing_children = true;
      } else {
	this.children.reset();
	this.showing_children = false;
      }
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
      "dblclick div.node-label"             : "edit",
      "click span.node-destroy"             : "clear",
      "click span.add-child"             : "createChildForm",
      "click span.node-children-expander"   : "toggleChildren",
      "keypress .node-input"                : "updateOnEnter",
      "keypress .add-child-input"                : "addChildOnEnter"
    },

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
      this.model.children.bind('reset',this.addAll,this);
    },

    render: function() {
      $(this.el).html(this.template(this.model.toFullJSON()));
      this.setLabel();
      return this;
    },

    setLabel: function() {
      var label = this.model.get('label');
      if (!label) { label = "no label"; }
      this.$('.node-label').text(label);
      this.input = this.$('.node-input');
      this.input.bind('blur', _.bind(this.close, this)).val(label);
    },

    edit: function(e) {
      $(this.el).addClass("editing");
      this.input.focus();
      e.stopPropagation();
    },

    close: function() {
      this.model.save({label: this.input.val()});
      $(this.el).removeClass("editing");
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    closeAddChild: function() {
      $(this.el).removeClass("adding-child");
    },

    addChildOnEnter: function(e) {
      if (e.keyCode == 13) {
	console.log("adding child");
	console.log(e.target.value);
	this.model.children.create({label: e.target.value,
				    parent_id: this.model.get('id'),
				    parent: this.model
				   });
	this.closeAddChild();
	}
    },

    remove: function() {
      $(this.el).remove();
    },

    clear: function(e) {
      console.log(this.model.get('id'));
      console.log(this.model.url);
      this.model.destroy();
      e.stopPropagation();
    },

    createChildForm: function(e) {
      console.log("createChildForm");
      console.log(this);
      console.log(e);
      $(this.el).addClass("adding-child");
      e.stopPropagation();
    },

    addOne: function(node) {
      var view = new NodeView({model: node});
      var selector = "#" + window.idMap[node.get('parent_id')] + " >.children > ul.children-node-list";
      var ul = this.$(selector);
      ul.append(view.render().el);
    },

    addAll: function() {
      this.model.children.each(this.addOne);
    },

    toggleChildren: function(e) {
      if (this.model.showing_children) {
	$(this.el).children(".children-node-list").empty();
	this.model.children.unbind();
      }
      $(this.el).toggleClass("showing-children");
      this.model.toggleChildren();
      e.stopPropagation();
    }
  });

  window.AppView = Backbone.View.extend({
    el: $("#takoapp"),

    events: {
      "keypress #new-node":  "createOnEnter"
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
    },

    addAll: function() {
      Nodes.each(this.addOne);
    },

    createOnEnter: function(e) {
      var label = this.input.val();
      if (!label || e.keyCode != 13) return;
      Nodes.create({label: label});
      this.input.val('');
    }
  });

  window.App = new AppView;
});

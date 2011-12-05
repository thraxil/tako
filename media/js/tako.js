$(function(){
  window.idMap = { };
  window.allNodes = { };

  var saveOrder = function(e) {
    console.log("saveOrder");
    var id = $(e.target).parent().parent().attr('id');
    var cid = id.split("-")[1];
    var node = window.allNodes[cid];
    var url = node.saveOrderURL() + "?";
    console.log(cid);
    var worktodo = 0;
    $(e.target).children("li").each(function(index,element) {
       worktodo = 1;
       var n = $(element).children(".node");
       var id = window.allNodes[n.attr('id').split("-")[1]].get("id");
       url += "node_" + index + "=" + id + ";";
    });
    if (worktodo == 1) {
      var req = new XMLHttpRequest();
      req.open("POST",url,true);
      req.send(null);
    }
  };


  window.Node = Backbone.Model.extend({
    defaults: function() {
      return {
	'children_count' : 0,
	'parent_id' : 0
      };
    },

   url: function() {
      if (!this.get('id')) {
	if (this.get('parent_id') == 0) return "/api/";
        return "/api/" + this.get("parent_id") + "/";
     }
     if (this.get('id') == 0) return "/api/";
     return "/api/" + this.get('id') + "/";
   },

   initialize: function() {
     ChildNodeList = Backbone.Collection.extend({
        model: Node,
	url: '/api/' + this.get('id') + "/"
     });
     this.children = new ChildNodeList;
     this.children.url = "/api/" + this.get('id') + "/";
     this.htmlId = "node-" + this.cid;
     window.allNodes[this.cid] = this;
     this.showing_children = false;
     window.idMap[this.get('id')] = this.htmlId;
   },

   toFullJSON: function() {
     var j = this.toJSON();
     j['htmlId'] = this.htmlId;
     return j;
   },

   saveOrderURL: function () {
     return "/api/" + this.get('id') + "/reorder/";
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
      "click div.node-label"               : "closeAddChild",
      "click span.node-destroy"             : "clear",
      "click span.add-child"             : "createChildForm",
      "click span.node-children-expander"   : "toggleChildren",
      "keypress .node-input"                : "updateOnEnter",
      "keypress .add-child-input"                : "addChildOnEnter",
      "click .node-save"                    : "close"
    },

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
      this.model.children.bind('reset',this.addAll,this);
      this.model.children.bind('add',this.render,this);
      this.model.children.bind('remove',this.render,this);
    },

    render: function() {
      $(this.el).html(this.template(this.model.toFullJSON()));
      this.setLabel();
      if (this.model.showing_children) {
	this.model.children.fetch();
      }
      return this;
    },

    setLabel: function() {
      var label = this.model.get('label');
      if (!label) { label = "no label"; }
      this.$('.node-label').text(label);
      this.input = this.$('.node-input');
      this.detailsInput = this.$('.node-details-input');
      this.input.val(label);
      this.detailsInput.val(this.model.get('details'));
    },

    edit: function(e) {
      $(this.el).addClass("editing");
      this.input.focus();
      e.stopPropagation();
    },

    close: function() {
      this.model.save({label: this.input.val(),
		       details: this.detailsInput.val()});
      $(this.el).removeClass("editing");
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    closeAddChild: function(e) {
      $(this.el).removeClass("adding-child");
      e.stopPropagation();
    },

    addChildOnEnter: function(e) {
      if (e.keyCode == 13) {
	this.model.children.create({label: e.target.value,
				    parent_id: this.model.get('id'),
				    parent: this.model
				   });
	this.model.showing_children = true;
	}
      e.stopPropagation();
    },

    remove: function() {
      $(this.el).remove();
    },

    clear: function(e) {
      this.model.destroy();
      e.stopPropagation();
    },

    createChildForm: function(e) {
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


      this.$(".children-node-list").sortable({ containment: 'parent'
					       ,stop: saveOrder
					     });
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

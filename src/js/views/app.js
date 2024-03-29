var app = app || {};

$(function( $ ) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	app.AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#tasks',

		// Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template( $('#tasks-template').html() ),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #new-task': 'createOnEnter',
			'click #clear-completed': 'clearCompleted',
			'click #toggle-all': 'toggleAllComplete'
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function() {
		   /* this.input = this.$('#new-todo');
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');
            this.$tasks = this.$('#tasks');*/

            this.input = $('#new-task');
			this.allCheckbox = $('#toggle-all')[0];
			this.$footer = $('#footer');
			this.$main = $('#main');
            this.$tasks = $('#tasks');

			app.Todos.on( 'add', this.addOne, this );
			app.Todos.on( 'reset', this.addAll, this );
			//app.Todos.on( 'change:completed', this.filterOne, this );
			//app.Todos.on( 'filter', this.filterAll, this );
			//app.Todos.on( 'all', this.render, this );

			//app.Todos.fetch();

            app.Tasks.on( 'add', this.addOneTask, this );
            app.Todos.on( 'reset', this.addAllTasks, this );
            app.Todos.on( 'change:completed', this.filterOne, this );
			app.Todos.on( 'filter', this.filterTasksAll, this );
			app.Todos.on( 'all', this.renderTasks, this );

            app.Tasks.fetch();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			var completed = app.Todos.completed().length;
			var remaining = app.Todos.remaining().length;

			if ( app.Todos.length ) {
				this.$main.show();
				this.$footer.show();
                this.$tasks.show();

				this.$footer.html(this.statsTemplate({
					completed: completed,
					remaining: remaining
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + ( app.TodoFilter || '' ) + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
                this.$tasks.hide();
			}

			this.allCheckbox.checked = !remaining;
		},
        renderTasks: function() {
			var completed = app.Tasks.completed().length;
			var remaining = app.Tasks.remaining().length;

			if ( app.Tasks.length ) {
				this.$main.show();
				this.$footer.show();
                this.$tasks.show();

				this.$footer.html(this.statsTemplate({
					completed: completed,
					remaining: remaining
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + ( app.TasksFilter || '' ) + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
                this.$tasks.hide();
			}

			this.allCheckbox.checked = !remaining;
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function( todo ) {
			var view = new app.TodoView({ model: todo });
			$('#todo-list').append( view.render().el );
		},

        addOneTask: function( task ) {
            var view = new app.TaskView({ model:task });
            $('#tasks').append(view.render().el);
        },

		// Add all items in the **Todos** collection at once.
		addAll: function() {
			this.$('#todo-list').html('');
			app.Todos.each(this.addOne, this);
		},
		// Add all items in the **Todos** collection at once.
        addAllTasks: function() {
			this.$('#tasks').html('');
			app.Tasks.each(this.addOneTask, this);
		},

		filterOne : function (todo) {
			todo.trigger('visible');
		},

		filterAll : function () {
			app.Todos.each(this.filterOne, this);
		},
        filterTasksAll : function () {
			app.Tasks.each(this.filterOne, this);
		},

		// Generate the attributes for a new Todo item.
		newAttributes: function(value) {
			return {
				title: value,
				order: app.Tasks.nextOrder(),
				completed: false
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function( e ) {
			var value  = $(e.currentTarget).val();
            if ( e.which != ENTER_KEY || value == "" ) {
				return;
			}

			app.Tasks.create( this.newAttributes(value) );
            $(e.currentTarget).val();
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function() {
			_.each( app.Todos.completed(), function( todo ) {
				todo.destroy();
			});

			return false;
		},

		toggleAllComplete: function() {
			var completed = this.allCheckbox.checked;

			app.Todos.each(function( todo ) {
				todo.save({
					'completed': completed
				});
			});
		}
	});
});

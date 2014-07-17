/**
 * https://github.com/marionettejs/backbone.marionette
 */

define(['marionette'], function(Marionette){

  Marionette.Region.Transition = Marionette.Region.extend({

    show: function(view, options) {
      this._ensureElement();

      var currentView = this.currentView;

      // If the view has an animate out function, then wait for it to conclude and then continue.
      // Otherwise, simply continue.
      if (this.currentView && _.isFunction(this.currentView.animateOut)) {
        this.listenToOnce(this.currentView, 'animateOut', _.bind(this._onTransitionOut, this, view, options));
        this.currentView.animateOut();
        // Return this for backwards compat
        return this;
      }
      else {
        return this._onTransitionOut(view, options);
      }
    },

    // Close the view, animating it out first if it needs to be
    empty: function(options) {
      options = options || {};

      var view = this.currentView;
      if (!view || view.isClosed){ return; }

      // Animate by default
      var animate = options.animate === undefined ? true : options.animate;

      // Animate the view before destroying it if a function exists. Otherwise,
      // immediately destroy it
      if (_.isFunction(view.animateOut) && animate) {
        this.listenToOnce(this.currentView, 'animateOut', _.bind(this._destroyView, this));
        this.currentView.animateOut();
      } else {
        this._destroyView();
      }
    },

    _destroyView: function() {
      var view = this.currentView;
      if (!view || view.isClosed){ return; }

      // call 'close' or 'remove', depending on which is found
      if (view.close) { view.close(); }
      else if (view.remove) { view.remove(); }

      Marionette.triggerMethod.call(this, "close", view);

      delete this.currentView;
    },

    // This is essentially the show fn 
    _onTransitionOut: function(view, options) {
      Marionette.triggerMethod.call(this, 'animateOut', this.currentView);

      var showOptions = options || {};
      var isViewClosed = view.isClosed || _.isUndefined(view.$el);
      var isDifferentView = view !== this.currentView;
      var preventClose =  !!showOptions.preventClose;

      // only close the view if we don't want to preventClose and the view is different
      var _shouldCloseView = !preventClose && isDifferentView;

      // The region is only animating if there's an animateIn method on the new view
      var animatingIn = _.isFunction(view.animateIn);

      // Close the old view
      if (_shouldCloseView) {
        this.empty({animate:false});
      }

      // Render the new view, then hide its $el
      view.render();

      // before:show triggerMethods
      Marionette.triggerMethod.call(this, "before:show", view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod("before:show");
      } else {
        Marionette.triggerMethod.call(view, "before:show");
      }

      // Only hide the view if we want to animate it
      if (animatingIn) {
        view.$el.css({opacity: 0});
      }

      // Attach the view's Html to the region's el
      if (isDifferentView || isViewClosed) {
        this.attachHtml(view);
      }

      this.currentView = view;

      // show triggerMethods
      Marionette.triggerMethod.call(this, "show", view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod("show");
      } else {
        Marionette.triggerMethod.call(view, "show");
      }

      // If there's an animateIn method, then call it and wait for it to complete
      if (animatingIn) {
        this.listenToOnce(view, 'animateIn', _.bind(this._onTransitionIn, this));
        view.animateIn();
      }

      // Otherwise, continue on
      else {
        return this._onTransitionIn();
      }
    },

    // After it's shown, then we triggerMethod 'animateIn'
    _onTransitionIn: function() {
      Marionette.triggerMethod.call(this, 'animateIn', this.currentView);
      return this;
    }

  });

  return Marionette.Region.Transition;
});
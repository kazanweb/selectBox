(function(global) {

	(function() {

	    if (typeof window.CustomEvent === "function") return false;

	    function CustomEvent(event, params) {
	        params = params || {
	            bubbles: false,
	            cancelable: false,
	            detail: undefined
	        };
	        var evt = document.createEvent('CustomEvent');
	        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
	        return evt;
	    }

	    CustomEvent.prototype = window.Event.prototype;

	    window.CustomEvent = CustomEvent;
	})();

	var mobileDetect = /Android|iPhone|iPad|iPod|BlackBerry|WPDesktop|IEMobile|Opera Mini/i.test(navigator.userAgent);

	var createNewEvent = function(eventName) {
	    if (typeof(Event) === 'function') {
	        var event = new Event(eventName);
	    } else {
	        var event = document.createEvent('Event');
	        event.initEvent(eventName, true, true);
	    }
	}

	var addEl = function (tagname, attrs, html, parent) {

		var tag,
			i;

		tag = document.createElement(tagname);

		for (i in attrs) {
			if (attrs.hasOwnProperty(i)) {
				tag.setAttribute(i, attrs[i]);
			}
		}

		tag.innerHTML = html;

		if (parent) {
			parent.appendChild(tag);
		}

		return tag;
	};

	var extend = function(defaults, source) {

		for (var key in source) {
			if (source.hasOwnProperty(key)) {
				defaults[key] = source[key];
			}
		}

		return defaults;
	}

	var SelectBox = function(opts) {

		this.defaults = extend({
			element: null,
			classMain: 'selectBox',
			startFn: function() {},
			selectFn: function() {},
			changeTitle: function() {},
			eachFn: function() {}
		}, opts);

		this.tags = {};

		if(!this.defaults.element) {
			return false;
		}

		this.init();
	}

	SelectBox.prototype = {

		init: function() {

			if(this.defaults.element.getAttribute('data-selectBox') === 'active') {
				return false;
			}

			this.tags.select = this.defaults.element;
			this.tags.button = this.tags.select.nextElementSibling;

			this.tags.select.setAttribute('data-selectBox', 'active');

			this.events();

			if(!mobileDetect) {
				this.tags.select.parentNode.classList.add('desktop');
				this.createList();
				this.eventsDesktop();
			}

		},

		events: function() {

			var obj = this;
			this.tags.button.innerHTML = '<span>' + this.tags.select.options[this.tags.select.selectedIndex].text + '</span>';
			this.tags.select.addEventListener('change', function() {
				obj.defaults.selectFn.call(this, this.selectedIndex);
				obj.tags.button.innerHTML = '<span>' + obj.tags.select.options[obj.tags.select.selectedIndex].text + '</span>';
				obj.defaults.changeTitle.call(obj.tags.button, this.textContent, this.value);
			});

		},

		eventsDesktop: function() {

			var obj = this;

			this.tags.button.addEventListener('click', function(e) {
				e.stopPropagation();
				this.parentNode.classList.toggle('show');
			});

			this.each(this.tags.items, function(index) {
				this.addEventListener('click', function() {
					obj.each(obj.tags.items, function() {
						this.classList.remove('selected');
					});
					this.classList.add('selected');
					obj.tags.select.selectedIndex = index;
					var event = new CustomEvent('change');
					obj.tags.select.dispatchEvent(event);
				});
			});

			document.addEventListener('click', function() {
				obj.tags.button.parentNode.classList.remove('show');
			});

		},

		createList: function() {

			var obj = this;
			this.tags.listWrapper = addEl('div', { class: this.defaults.classMain + '__container' }, '', this.tags.select.parentNode);
			this.tags.list = addEl('ul', { class: this.defaults.classMain + '__list' }, '', this.tags.listWrapper);
			this.tags.items = [];

			this.each(this.tags.select.options, function(index) {

				obj.tags.items.push(addEl('li', { class: obj.defaults.classMain + '__item', 'data-value': this.value }, this.innerHTML, obj.tags.list));

				if(index == obj.tags.select.selectedIndex) {
					obj.tags.items[index].classList.add('selected');
				}

				obj.defaults.eachFn.call(obj.tags.items[index], index, this.text, this.value);

			});

		},

		each: function(array, callback) {

			Array.prototype.forEach.call(array, function(node, index) {
				callback.call(node, index);
			});

		}

	}

	window.SelectBox = SelectBox;

})(window);

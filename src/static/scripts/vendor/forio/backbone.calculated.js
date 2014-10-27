(function (Backbone, _, undefined) {

var Calculated = {};
Backbone.Calculated = Calculated;

// Utility methods
_.extend(Backbone, {

    // Use builtin `isEqual` if it exists, otherwise use underscore
    isEqual: function (a, b) {
        return a && a.isEqual && typeof a.isEqual === 'function' ?
            a.isEqual(b) : _.isEqual(a, b);
    },

    isModel: function (obj) {
        return obj instanceof Backbone.Model;
    },

    isCollection: function (obj) {
        return obj instanceof Backbone.Collection;
    },

    // Returns whether or not an object is a Backbone entity
    isEntity: function (obj) {
        return Backbone.isModel(obj) || Backbone.isCollection(obj);
    }

});

// Backbone.Calculated.Tree
// ------------------------

// Create and build a new dependency tree from a list of nodes.
Backbone.Calculated.Tree = function (data, nodeList) {
    this.nodes = {};
    this._buildTree.apply(this, arguments);

    return this;
};

// Attach all inheritable methods to the `Tree` prototype.
_.extend(Backbone.Calculated.Tree.prototype, {

    // Build the tree from the node list provided.
    _buildTree: function (data, nodeList) {
        nodeList = nodeList || 'dependencies';

        for (var key in data) {
            var dependencies = _.flatten([data[key][nodeList]]),
                a = this.add(key).get(key);

            for (var i = 0, l = dependencies.length; i < l; i++) {
                var dependency = dependencies[i],
                    b = this.add(dependency).get(dependency);

                a.connect(b);
            }
        }
    },

    // Get a node from the tree.
    get: function (id) {
        return this.nodes[id];
    },

    // Adds a node to the tree if it doesn't already exist.
    add: function (id) {
        this.nodes[id] = this.nodes[id] || new Backbone.Calculated.Node(id);

        return this;
    },

    // Search the tree starting at a specific node.
    // Optionally force all the nodes in the branch to be visited.
    searchFrom: function (key, visitor, force) {
        return this.get(key).search(_.bind(visitor, this), force);
    },

    // Check if the node is in a valid
    validTo: function (key) {
        var node = this.get(key),
            edges = node.parents;

        for (var i = 0, l = edges.length; i < l; i++) {
            if (!edges[i].valid) return false;
        }

        return true;
    }

});


// Backbone.Calculated.Node
// ------------------------

// Create a new node with an `id` and a list of parents/children.
Backbone.Calculated.Node = function (id) {
    this.id = id;
    this.children = [];
    this.parents = [];
};

// Attach all inheritable methods to the `Node` prototype.
_.extend(Backbone.Calculated.Node.prototype, {

    // Flag for determining the nodes validity.
    valid: false,

    // Check if the node is a leaf node.
    isLeaf: function () {
        return !this.parents.length;
    },

    // Connect 2 nodes together.
    connect: function (node) {
        this.parents.push(node);
        node.children.push(this);

        return this;
    },

    // Search starting at this node.
    // Optionally force all the nodes in the branch to be visited.
    search: function (visitor, force) {
        var queue = [], visited = {}, node;

        queue.push(this);
        visited[this.id] = true;

        while (queue.length) {
            var el = queue.shift();

            if (visitor(el) !== false) {
                for (var i = 0, l = el.children.length; i < l; i++) {
                    node = el.children[i];

                    if (!visited[node.id]) {
                        queue.push(node);
                        // Only mark the node as visited if it was calculated.
                        visited[node.id] = force || node.valid;
                    }
                }
            }
        }

        return this;
    }

});

// Backbone.Calculated.Model
// -------------------------

// Create a new calculated model, with the defined calculated fields.
Backbone.Calculated.Model = Backbone.Model.extend({

    constructor: function (attributes, options) {
        this.calculated = this.calculated || {};
        this._buildTree();
        this._setupInterdependencies();

        options = _.extend(options || {}, { computeAll: true });

        return Backbone.Model.prototype.constructor.call(this, attributes, options);
    },

    // Custom isEqual method; prevents attempting to crawl the dependency tree
    isEqual: function (other) {
        // If they're the same constructor check attributes only
        if (other && this.constructor === other.constructor) {
            return Backbone.isEqual(this.attibutes, other.attributes);
        }

        return false;
    },

    // Builds a dependency tree from the calculated field hash.
    _buildTree: function () {
        this.dependencies = new Backbone.Calculated.Tree(this.calculated);
    },

    _setupInterdependencies: function () {
        this.interdependencies = {};

        _.each(this.calculated, function (config, dependency) {
            if (!config.recompute) return;

            _.each(config.recompute, function (events, field) {
                this.interdependencies[field] = this.interdependencies[field] || [];

                this.interdependencies[field].push({
                    dependency: dependency,
                    events: events
                });
            }, this);

        }, this);
    },

    _listenToInterdependency: function (attr) {
        var interdependencies = this.interdependencies[attr];
        var entity = this.get(attr);

        _.each(interdependencies, function (interdepency) {
            var callback = _.bind(function () {
                this.recompute(interdepency.dependency);
            }, this);

            this.stopListening(undefined, interdepency.events, callback);
            this.listenTo(entity, interdepency.events, callback);
        }, this);
    },

    // Invalidate all the nodes starting from the specified depednency.
    _invalidate: function (dependency) {
        var model = this;

        this.dependencies.searchFrom(dependency, function (node) {
            if (node.valid) {
                node.valid = false;

                // This breaks change, commenting out for now.
                // if (model.calculated[node.id]) delete model.attributes[node.id];
            } else {
                return false;
            }
        }, true);

        return this;
    },

    // Compute the specified dependency.
    _compute: function (dependency, changes, options) {
        var model = this,
            current = this.attributes,
            prev = this._previousAttributes,
            attr, val;

        this.dependencies.searchFrom(dependency, function (node) {
            attr = node.id;

            // Fixed along with line 224.
            // Validate node.
            node.valid = node.valid || !model.calculated[attr] && _.has(current, attr);

            if (model.calculated[attr] && !node.valid && this.validTo(node.id)) {
                node.valid = true;
                val = model.calculated[attr].getter.call(model);

                model._change(attr, val, changes, options);
            } else {
                /*
                 * If this is a calculated property
                 * we can't calculate it since at least one
                 * of its dependencies is not valid
                 */
                return dependency === attr;
            }
        });

        return this;
    },

    // Compute all the calculated fields and trigger changes.
    _computeCalculated: function (changes, options) {
        var i, l,
            compute = [],
            check = options && options.computeAll ?
                _.keys(this.attributes) : changes;

        for (i = 0, l = check.length; i < l; i++) {
            var attr = check[i];

            if (this.dependencies.get(attr)) {
                this._invalidate(attr);
                compute.push(attr);
            }
        }

        for (i = 0, l = compute.length; i < l; i++) {
            this._compute(compute[i], changes, options);
        }

        return this;
    },

    // Recompute the specified dependency.
    recompute: function (dependency, options) {
        var changes;

        options = options || {};

        // Setup change tracking.
        changes = [];
        changing = this._changing;
        this._changing = true;

        if (!changing) {
            this._previousAttributes = _.clone(this.attributes);
            this.changed = {};
        }

        this._invalidate.apply(this, arguments)
            ._compute.call(this, dependency, changes, options);

        // Trigger all relevant attribute changes.
        this._triggerChanges(changes, changing, options);

        return this;
    },

    // Override `Backbone.Model.set` to also handle calculated fields.
    set: function (key, val, options) {
        var attr, attrs, changes, changing, prev, current;

        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options = options || {};

        // Run validation.
        if (!this._validate(attrs, options)) return false;

        // Setup change tracking.
        changes = [];
        changing = this._changing;
        this._changing = true;

        if (!changing) {
            this._previousAttributes = _.clone(this.attributes);
            this.changed = {};
        }

        // Check for changes of `id`.
        if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

        // For each `set` attribute, update or delete the current value.
        for (attr in attrs) {
            val = attrs[attr];

            this._change(attr, val, changes, options);
        }

        // Handle calculated fields
        this._computeCalculated(changes, options);

        // Bind to interdependencies
        for (attr in attrs) {
            if (this.interdependencies[attr]) {
                this._listenToInterdependency(attr);
            }
        }

        // Trigger all relevant attribute changes.
        this._triggerChanges(changes, changing, options);

        return this;
    },

    // Updates the value and checks if it differs from the current/previous values. 
    _change: function (attr, val, changes, options) {
        var current = this.attributes,
            prev = this._previousAttributes,
            unset = options.unset;

        if (!Backbone.isEqual(current[attr], val)) changes.push(attr);
        if (!Backbone.isEqual(prev[attr], val)) {
            this.changed[attr] = val;
        } else {
            delete this.changed[attr];
        }

        if (unset) {
            delete current[attr];
        } else {
            current[attr] = val;
        }
    },

    // Trigger all relevant attribute changes.
    _triggerChanges: function (changes, changing, options) {
        var current = this.attributes,
            silent = options.silent;

        if (!silent) {
            if (changes.length) this._pending = true;
            for (var i = 0, l = changes.length; i < l; i++) {
                this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
        }

        if (changing) return this;

        if (!silent) {
            while (this._pending) {
                this._pending = false;
                this.trigger('change', this, options);
            }
        }

        this._pending = false;
        this._changing = false;
        return this;
    },

    // Get the index of the model in its collection.
    indexOf: function () {
        if (!this.collection) return -1;

        return this.collection.indexOf(this);
    }

});

})(window.Backbone, window._);
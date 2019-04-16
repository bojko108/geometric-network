/**
 * Class for creating event listeners
 *
 * @export
 * @class EventEmitter
 */
export default class EventEmitter {
  /**
   * Creates an instance of EventEmitter.
   */
  constructor() {}
  /**
   * fires an event - executes all attached callbacks
   * @public
   * @param {!String} name - event name to fire
   * @return {undefined}
   */
  emit(name) {
    let data = [].slice.call(arguments, 1),
      evtArr = ((this.e || (this.e = {}))[name] || []).slice(),
      i = 0,
      len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  }
  /**
   * attach to an event
   * @public
   * @param {!String} name - name of the event to attach to
   * @param {!Function} callback - callback to execute
   * @param {!Object} ctx - context
   * @return {undefined}
   */
  on(name, callback, ctx) {
    let e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  }
  /**
   * attach to an event only once
   * @public
   * @param {!String} name - name of the event to attach to
   * @param {!Function} callback - callback to execute
   * @param {!Object} ctx - context
   * @return {undefined}
   */
  once(name, callback, ctx) {
    let self = this,
      listener = function() {
        self.off(name, listener);
        callback.apply(ctx, arguments);
      };

    listener._ = callback;
    return this.on(name, listener, ctx);
  }
  /**
   * detach from an event
   * @public
   * @param {!String} name - name of the event to detach from
   * @param {!Function} callback - callback to detach
   * @return {undefined}
   */
  off(name, callback) {
    let e = this.e || (this.e = {}),
      evts = e[name],
      liveEvents = [];

    if (evts && callback) {
      for (let i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i]);
      }
    }

    if (liveEvents.length) e[name] = liveEvents;
    else delete e[name];

    return this;
  }
}

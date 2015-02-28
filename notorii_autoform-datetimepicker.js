//variables to store / access across all functions (not sure how to do so otherwise? would have to put these on the element data itself?). BUT must store as instances to keep these separate so multiple instances on the same page do not overwrite each other!
var VAL ={};
var OPTS ={};

var afDatetimepicker ={
  setup: function(instid, ele, template, params) {
    var self =this;

    var sessKeyDateOnly ='afDatetimepicker'+instid+'dateOnly';
    //default - so it is defined
    Session.set(sessKeyDateOnly, false);

    VAL[instid] =ele.value;

    var optsDefault ={
      formatValue: 'YYYY-MM-DD HH:mm:ssZ',
      pikaday: {
        format: 'MMM D, YYYY h:mmA',
        reposition: false
      }
    };
    OPTS[instid] =EJSON.clone(template.data.atts.opts);
    if(OPTS[instid] ===undefined) {
      OPTS[instid] ={};
    }
    //@todo - use a 3rd party extend function (standalone / very lightweight - not full underscore or lodash)
    var xx;
    if(OPTS[instid].pikaday ===undefined) {
      OPTS[instid].pikaday ={};
    }
    for(xx in optsDefault.pikaday) {
      if(OPTS[instid].pikaday[xx] ===undefined) {
        OPTS[instid].pikaday[xx] =optsDefault.pikaday[xx];
      }
    }
    for(xx in optsDefault) {
      if(OPTS[instid][xx] ===undefined) {
        OPTS[instid][xx] =optsDefault[xx];
      }
    }

    if(!Meteor.isCordova) {
      OPTS[instid].pikaday.field =ele;
      OPTS[instid].pikaday.onSelect =function() {
        VAL[instid] =this.getMoment().format(OPTS[instid].pikaday.format);
      };

      var picker = new Pikaday(OPTS[instid].pikaday);

      if(VAL[instid]) {
        //convert from non-display value to display value
        VAL[instid] =moment(VAL[instid], OPTS[instid].formatValue).format(OPTS[instid].pikaday.format);

        self.setVal(instid, picker, {});
      }
    }
    else {
      var dateOnly =self.checkForDateOnly(OPTS[instid], {});
      Session.set(sessKeyDateOnly, dateOnly);
    }
  },

  setVal: function(instid, picker, params) {
    picker.setMoment(moment(VAL[instid], OPTS[instid].pikaday.format));
  },

  checkForDateOnly: function(opts, params) {
    var dateOnly =true;
    if(opts.formatValue.indexOf('h') >-1 || opts.formatValue.indexOf('H') >-1) {
      return false;
    }
    return dateOnly;
  }
};

AutoForm.addInputType("datetimepicker", {
  template: "afDatetimepicker",
  valueIn: function(val) {
    //will convert to display value later after set / extend opts and have formats
    // VAL =val;
    return val;
  },
  valueOut: function() {
    var instid =this.attr('data-schema-key');
    var returnVal;
    //convert to non-display value
    if(OPTS[instid].formatValue !==undefined) {
      returnVal =moment(VAL[instid], OPTS[instid].pikaday.format).format(OPTS[instid].formatValue);
    }
    else {
      returnVal =VAL[instid];
    }
    return returnVal;
  }
});

Template.afDatetimepicker.helpers({
  //fix to avoid error for passed in object
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/issues/3
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/commit/3977aa69b61152cf8c0f731a11676b087d2ec9df
  atts: function() {
    var atts =EJSON.clone(this.atts);
    // atts.instid ='afDatetimepicker'+Math.random().toString(36).substring(7);
    delete atts.opts;
    return atts;
  },
  cordova: function() {
    return Meteor.isCordova;
  },
  dateOnly: function() {
    var instid =Template.instance().data.atts['data-schema-key'];
    var sessKeyDateOnly ='afDatetimepicker'+instid+'dateOnly';
    return Session.get(sessKeyDateOnly);
  }
});

Template.afDatetimepicker.rendered =function() {
  var ele =this.find('input');
  var key =this.data.atts['data-schema-key'];
  afDatetimepicker.setup(key, ele, this, {});
};
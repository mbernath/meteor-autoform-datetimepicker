//variables to store / access across all functions (not sure how to do so otherwise? would have to put these on the element data itself?). BUT must store as instances to keep these separate so multiple instances on the same page do not overwrite each other!
var VAL ={};
var OPTS ={};

var DEBUG ='';
Session.set('afDatetimepickerDebug', DEBUG);

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
    //@todo2 - use a 3rd party extend function (standalone / very lightweight - not full underscore or lodash)
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

    var picker =false;
    if(!Meteor.isCordova) {
      OPTS[instid].pikaday.field =ele;
      OPTS[instid].pikaday.onSelect =function() {
        VAL[instid] =this.getMoment().format(OPTS[instid].pikaday.format);
      };

      picker = new Pikaday(OPTS[instid].pikaday);
    }
    else {
      var dateOnly =self.checkForDateOnly(OPTS[instid], {});
      Session.set(sessKeyDateOnly, dateOnly);
    }

    if(VAL[instid]) {
      //convert from non-display value to display value
      VAL[instid] =moment(VAL[instid], OPTS[instid].formatValue).format(OPTS[instid].pikaday.format);

      self.setVal(instid, picker, {});
    }
  },

  setVal: function(instid, picker, params) {
    if(Meteor.isCordova) {
      //@todo
    }
    else {
      picker.setMoment(moment(VAL[instid], OPTS[instid].pikaday.format));
    }
  },

  checkForDateOnly: function(opts, params) {
    var dateOnly =true;
    if(opts.formatValue.indexOf('h') >-1 || opts.formatValue.indexOf('H') >-1) {
      return false;
    }
    return dateOnly;
  },

  /**
  NOTE: non '00' minute timezone offsets apparently do NOT work with moment.js dates... i.e. moment('2013-06-21 10:25:00 -07:30',  'YYYY-MM-DD HH:mm:ssZ') gives GMT-0700 NOT GMT-0730 as it should. So currently this function does NOT support tzToMinutes timezones that have minutes..
  
  moment.js apparently does not yet have a function / way to convert a date to a different timezone (other than 'local' and 'UTC'). As of 2013.06.21, see here:
  http://stackoverflow.com/questions/15347589/moment-js-format-date-in-a-specific-timezone (this says it can be done but it's not working for me - maybe it's only on non-stable branches of the code..)
  https://github.com/timrwood/moment/issues/482
  UPDATE: as of 2013.07.10 / moment v2.1 there IS timezone support but it's much bigger than this simple function here so sticking with this to avoid code bloat.
  
  @param {Object} dateMoment moment.js date object
  @param {Number} [tzFromMinutes] Timezone minutes offset from UTC to be converted FROM. If not supplied, the timezone offset will be pulled from the dateMoment object. I.e. 420 for -07:00 (Pacific Time)
  @param {Number} [tzToMinutes] Timzeone minutes offset from UTC to be converted TO. If not supplied, the timezone of the current user's computer / browser will be used (using moment().zone() with no arguments).
  @param {Object} [params]
    @param {String} [format] moment.js format string for what to output
  @return {Object}
    @param {Object} date moment.js date object in the tzToMinutes timzeone
    @param {String} [dateFormatted] Date in formatted specified by params.format (if supplied)
  */
  convertTimezone: function(dateMoment, tzFromMinutes, tzToMinutes, params) {
    var ret ={date: false, dateFormatted:false};
    if(tzFromMinutes ===undefined || (!tzFromMinutes && tzFromMinutes !==0)) {
      tzFromMinutes =dateMoment.zone();
    }
    if(tzToMinutes ===undefined || (!tzToMinutes && tzToMinutes !==0)) {
      tzToMinutes =moment().zone();   //get user timezone
    }
    
    //use moment function to convert (doesn't work..)
    // dateMoment =dateMoment.zone(tzOffsetMinutes);
    // dateFormatted =dateMoment.format('YYYY-MM-DD HH:mm:ssZ');
    
    var tzDiffMinutes =tzToMinutes -tzFromMinutes;
    if(tzDiffMinutes >-1) {
      dateMoment =dateMoment.subtract('minutes', tzDiffMinutes);
    }
    else {
      dateMoment =dateMoment.add('minutes', tzDiffMinutes);
    }
    
    //manually add timezone offset
    var dateFormatted =dateMoment.format('YYYY-MM-DD HH:mm:ss');    //temporary string that will be used to form the final moment date object AFTER timezone conversion is done (since doesn't seem to be a way to change the timezone on an existing moment date object.. - if there was, we wouldn't need this entire function at all!)
    var tzToMinutesAbsVal =tzToMinutes;
    if(tzToMinutesAbsVal <0) {
      tzToMinutesAbsVal =tzToMinutesAbsVal *-1;
    }
    var hrOffset =Math.floor(tzToMinutesAbsVal /60).toString();
    if(hrOffset.length ==1) {
      hrOffset ='0'+hrOffset;
    }
    var minutesOffset =(tzToMinutesAbsVal %60).toString();
    if(minutesOffset.length ==1) {
      minutesOffset ='0'+minutesOffset;
    }
    var plusMinus ='+';
    if(tzToMinutes >=0) {
      plusMinus ='-';
    }
    var tzOffsetString =plusMinus+hrOffset+':'+minutesOffset;
    dateFormatted+=''+tzOffsetString;
    
    ret.date =moment(dateFormatted, 'YYYY-MM-DD HH:mm:ssZ');
    if(params.format !==undefined) {
      ret.dateFormatted =ret.date.format(params.format);
    }
    
    return ret;
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
    DEBUG +=instid+' '+VAL[instid]+' '+OPTS[instid].formatValue+' '+OPTS[instid].pikaday.format+'<br />';   //TESTING
    Session.set('afDatetimepickerDebug', DEBUG);
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

Template.afDatetimepicker.rendered =function() {
  var ele =this.find('input');
  var key =this.data.atts['data-schema-key'];
  afDatetimepicker.setup(key, ele, this, {});
};

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
  },
  debug: function() {
    return Session.get('afDatetimepickerDebug');
  }
});

Template.afDatetimepicker.events({
  'change .autoform-datetimepicker-input': function(evt, template) {
    if(Meteor.isCordova) {
      var instid =template.data.atts['data-schema-key'];
      //convert from input value format to the format we want (display for consistency with Pikaday, even though we will NOT actually change the display value the user sees)
      // DEBUG +=JSON.stringify(template)+' '+JSON.stringify(this)+'<br />';   //TESTING
      // DEBUG +=template.value+' '+JSON.stringify(template)+' '+JSON.stringify(this)+'<br />';    //TESTING
      DEBUG +=evt.target.value+'<br />';    //TESTING
      Session.set('afDatetimepickerDebug', DEBUG);

      //@todo - handle date (without time?)
      
      var inputFormatString ='YYYY-MM-DDTHH:mm:ss';   //datetime-local now so no timezone (including it will not properly set the input (default) value)
      var date =evt.target.value;
      var dateMoment;
      var tzFromMinutes =false;
      if(typeof(date) =='object') {   //assume javascript date object
        dateMoment =moment(date);
      }
      else if(typeof(date) =='string') {    //assume Android, which apparently gives YYYY-MM-DDTHH:mmZ format..
        dateMoment =moment(date, 'YYYY-MM-DD HH:mm');
        if(date.indexOf('Z') >-1) {
          tzFromMinutes =0;
        }
      }

      //convert to local timezone (so it matches what the user actually selected)
      var format1 ='YYYY-MM-DD HH:mm:ssZ';
      var dtInfo =afDatetimepicker.convertTimezone(dateMoment, tzFromMinutes, false, {'format':format1});
      // var formattedModelVal =moment(dtInfo.dateFormatted, format1).format(scope.opts.formatModel);

      //update input value with non UTC value
      var inputFormat =dtInfo.date.format(inputFormatString);
      evt.target.value =inputFormat;

      VAL[instid] =dtInfo.date.format(OPTS[instid].pikaday.format);

      DEBUG +=evt.target.value+' '+VAL[instid]+'<br />';    //TESTING
      Session.set('afDatetimepickerDebug', DEBUG);
    }
  }
});
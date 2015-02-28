# notorii:autoform-datetimepicker

An add-on Meteor package for aldeed:autoform. Provides a single custom input type, "datetimepicker", which renders an input that allows selecting datetime (or just date) across ALL platforms (mobile, desktop, wrapped inside a Cordova app). Specifically:
- Cordova (Android, iOS) wrapped apps just use the `datetime-local` (or `date`) input type, which will bring up the native date(time) input on mobile.
- non-Cordova (web) interfaces use Pikaday datetimepicker functionality.
  - https://github.com/owenmead/Pikaday (forked timepicker version of: https://github.com/dbushell/Pikaday)


## Demo

[Demo](http://lukemadera-packages.meteor.com/af-datetimepicker-basic)

[Source](https://github.com/lukemadera/meteor-packages/tree/master/autoform-datetimepicker/basic)


## Dependencies

- aldeed:autoform
- pikaday-time - [Pikaday Owenmead time picker fork](http://bower.io/search/?q=pikaday-time) (recommended to use `bower` with `mquandalle:bower` package to install, which will auto-include the necessary `pikaday.js` and `pikaday.css` files)
- momentjs:moment


## Installation

In a Meteor app directory:
```bash
meteor add notorii:autoform-datetimepicker
```
Add Pikaday javascript and css files, e.g.: add `"pikaday-time": "latest"` to your `bower.json` file.


## Usage

Specify "datetimepicker" for the `type` attribute of any input and set teh SimpleSchema to be an object:

```html
{{> afQuickField name="dueDate" type="datetimepicker" opts="optsDatetimepicker"}}
```

In the schema, which will then work with a `quickForm` or `afQuickFields`:

```js
AFDatetimepickerSchema =new SimpleSchema({
  dueDate: {
    type: String,
    optional: true
  }
});
```

Specify options, including Pikaday options, with a template helper.

@param {String} [formatValue ='YYYY-MM-DD HH:mm:ssZ'] The input and output value format (NOT what is displayed to the user by the Pikaday date time picker per se)

@param {Object} [pikaday] The normal Pikaday date/time picker options, see: https://github.com/dbushell/Pikaday#configuration AND https://github.com/owenmead/Pikaday for time picker options, which are enabled by default

  @param {String} [format ='YYYY-MM-DD h:mmA'] The Pikaday / input value format that is displayed

To disable the time picker and just have a date select, change the `formatValue` and/or `pikaday.format` options to specify the display and stored values you want and then set the `pikaday.showTime` option to false.

```js
if(Meteor.isClient) {
  Template.autoformDatetimepickerBasic.helpers({
    optsDatetimepicker: function() {
      return {
        //WHAT IS STORED (i.e in the database)
        // formatValue: 'YYYY-MM-DD'
        pikaday: {
          //what is DISPLAYED (to the user)
          // format: 'MMM D, YYYY',
          // showTime: false,
        }
      }
    }
  });
}
```

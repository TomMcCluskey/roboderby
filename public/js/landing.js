function go() {
  // watcher for newGame password use checkbox
  $('#locked').click(function() {
    if ( $('#locked').prop( "checked" ) ) {
      $(password).removeAttr('disabled');
    } else {
      $(password).attr('disabled', true);
    }
  });

  // watcher for newGame create button
  $('#create').click(function() {
    // submit board build request
  });
  WebFontConfig = {
    google: { families: [ 'Audiowide::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();
}

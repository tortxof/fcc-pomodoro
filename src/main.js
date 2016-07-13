var sound = new Howl({
  urls: [
    'https://s3.amazonaws.com/djones-assets/pomodoro.mp3',
    'https://s3.amazonaws.com/djones-assets/pomodoro.ogg'
  ],
  sprite: {
    end_break: [0, 3000],
    begin_break: [3000, 12000]
  }
});

function nowSeconds() {
  return Date.now() / 1000;
}

function Timer() {
  this.session_m = 25;
  this.break_m = 5;
  this.running = false;
  this.break_time = false;
  this.start_time_s = 0;

  this.start = function() {
    this.start_time_s = nowSeconds();
    this.running = true;
    this.break_time = false;
  };

  this.stop = function() {
    this.running = false;
    this.break_time = false;
  };

  this.sessionPlus = function() {
    if (this.session_m < 240) this.session_m++;
  };

  this.sessionMinus = function() {
    if (this.session_m > 0) this.session_m--;
  };

  this.breakPlus = function() {
    if (this.break_m < 60) this.break_m++;
  };

  this.breakMinus = function() {
    if (this.break_m > 0) this.break_m--;
  };

  this.getTimeLeft = function() {
    var time_left_s;
    if (this.running) {
      time_left_s = (this.session_m + this.break_m) * 60 - (nowSeconds() - this.start_time_s);
    } else {
      time_left_s = (this.session_m + this.break_m) * 60;
    }
    time_left_s = Math.ceil(time_left_s);
    var time_left_m = Math.floor(time_left_s / 60);
    var prev_break_time = this.break_time;
    this.break_time = (time_left_s < this.break_m * 60);
    if ((!prev_break_time) && this.break_time) {
      sound.play('begin_break');
    }
    if (time_left_s <= 0) {
      sound.play('end_break');
      this.start();
    }
    return {
      'string': time_left_m.toString() + ':' + ('0' + (time_left_s % 60).toString()).slice(-2),
      'seconds': time_left_s,
      'break_time': this.break_time
    };
  };

}

function UpdateDisplay() {
  var time_left = my_timer.getTimeLeft();
  $('#time-display').text(time_left.string);
  $('.session span').text(my_timer.session_m);
  $('.break span').text(my_timer.break_m);
  $('#progress-fg').css(
    'right',
    (time_left.seconds / ((my_timer.session_m + my_timer.break_m) * 60) * 100).toString() + '%'
  );
  if (time_left.break_time) {
    $('#message-display').text('Break Time');
    $('#progress-fg').addClass('break-color');
  } else {
    $('#message-display').text('');
    $('#progress-fg').removeClass('break-color');
  }
  if (my_timer.running) {
    $('#start').text('Stop');
    requestAnimationFrame(UpdateDisplay);
  } else {
    $('#start').text('Start');
    cancelAnimationFrame(animation_id);
  }
}

var my_timer = new Timer();
var animation_id;
UpdateDisplay();

$('#session-minus').click(function() {
  my_timer.sessionMinus();
  UpdateDisplay();
});

$('#session-plus').click(function() {
  my_timer.sessionPlus();
  UpdateDisplay();
});

$('#break-minus').click(function() {
  my_timer.breakMinus();
  UpdateDisplay();
});

$('#break-plus').click(function() {
  my_timer.breakPlus();
  UpdateDisplay();
});

$('#start').click(function() {
  if (my_timer.running) {
    cancelAnimationFrame(animation_id);
    my_timer.stop();
    UpdateDisplay();
  } else {
    my_timer.start();
    animation_id = requestAnimationFrame(UpdateDisplay);
  }
});

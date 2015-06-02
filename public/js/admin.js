$.ajaxSetup({
  xhrFilds: {withCredentials: true},
  error: function(xhr, status, error){
    $('.error').removeClass('hidden').html('status: ' + status + ', error: ' + error);
  }
});

var findTr = function(event){
  var target = event.srcElemt || event.target;
  var $target = $(target);
  return $target.parents('tr');
}

var remove = function(event){
  var $tr = findTr(event);
  var id = $tr.data('id');
  $.ajax({
    url: '/api/articles/' + id,
    type: 'DELETE',
    success: function(data, status, xhr){
      $('.alert').addClass('hidden');
      $tr.remove();
    }
  })
};

var update = function(event){
  var $tr = findTr(event);
  $tr.find('button').attr('disabled', 'disabled');
  var data = {
    published: $tr.hasClass('unpublished')
  };
  var id = $tr.attr('data-id');
  $.ajax({
    url: '/api/articles/' + id,
    type: 'PUT',
    contextType: 'application/json',
    data: {article: data},
    success: function(res, status, xhr){
      $tr.find('button').removeAttr('disabled');
      $('.alert').addClass('hidden');
      if (data.published){
        $tr.removeClass('unpublished').find('.glyphicon-play').removeClass('glyphicon-play').addClass('glyphicon-pause');
      }else{
        $tr.addClass('unpublished').find('.glyphicon-pause').removeClass('glyphicon-pause').addClass('glyphicon-play');
      }
    }
  });

};

$(document).ready(function(){
  var $element = $('.admin tbody');
  $element.on('click', 'button.remove', remove);
  $element.on('click', 'button', update)
});
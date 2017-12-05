
/* toggle checkbox when list group item is clicked */
$('.list-group a').click(function(e){
  e.stopPropagation();
  var $a = $(this)
    , $this = $a.find("[type=checkbox]");
  if($this.is(":checked")) {
    $a.removeClass('checked');
    $this.prop("checked",false);
  } else {
    $a.addClass('checked');
    $this.prop("checked",true);
  }
});

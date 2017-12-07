
/* toggle checkbox when list group item is clicked */
$('.list-group a').on('click touch', function(e){
  var input = e.target.tagName.toLowerCase() === 'input';
  e.stopPropagation();
  var $a = $(this)
    , $this = $a.find("[type=checkbox]");
  if (input) {
    if($this.is(":checked")) {
      if (countChecked() > 3) {
        $this.prop("checked",false);
        return;
      }
      $a.addClass('checked');
    } else {
      $a.removeClass('checked');
    }
    return;
  }
  if($this.is(":checked")) {
    $a.removeClass('checked');
    $this.prop("checked",false);
  } else {
    if (countChecked() >= 3) return;
    $a.addClass('checked');
    $this.prop("checked",true);
  }
});

function countChecked() {
  var checked = 0;
  $('.list-group a input[type=checkbox]').each((i,e)=>{
    if ($(e).prop("checked")) checked ++;
  });
  return checked;
}

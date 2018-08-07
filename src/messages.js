function message(type, text, extra, hide){
  if($('body > #messages').length == 0){
    $('body').prepend("<div class='messages mt-2'/>")
  }
  
  let el = $(`<div class='alert alert-${type} ${extra}'>${text}</div>`)
  $('.messages').append(el)
  if (hide) {
    setTimeout(() => { $('.alert').remove() }, 5000)
  }
}

export function showError(text){
  message('danger', text, null, true)
}

export function showInfo(text){
  message('info', text, null, true)
}

export function showSuccess(text){
  message('success', text, null, true)
}

export function loading(){
  if($('#messages > .loading').length == 0){
    message('info', 'Loading', 'loading')
  }
}

export function notLoading(){
  $('#messages').find('.loading').remove()
}

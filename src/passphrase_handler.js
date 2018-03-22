function modal(callback){
  return {
    id: 'passphrase_handler',
    class: 'modal',

    $init(){
      $(this).modal({backdrop: 'static', keyboard: false})
      this.input = $(this).find('input')
      this.input.focus()
    },

    $done(){
      callback(null, this.input.val())
      $(this).find('input').val('')
      $(this).modal('hide').remove()
    },

    $components: [{
      class: 'modal-dialog',
      $components: [{
        $type: 'form',
        class: 'modal-content form form-vertical',
        onsubmit: function(e){
          e.preventDefault()
          $("#passphrase_handler")[0].$done()
        },
        $components: [
          {
            class: 'modal-body',
            $components: [{ 
              $type: 'input',
              type: 'password',
              class: 'form-control',
            }]
          },
          {
            class: 'modal-footer',
            $components: [{
              $type: 'button',
              class: 'btn-block btn btn-success',
              type: 'submit',
              $text: 'Enter',
            }]
          }
        ]
      }]
    }]
  }
}

export function passphraseHandler(c){
  $('body')[0].$build(modal(c))
}

export function blankPassphraseHandler(c){
  c(null, '')
}

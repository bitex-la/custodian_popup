function build_button(number){
  return {
    class: 'col',
    onclick(e) {
      this._pin += number.toString()
    },
    $components: [
      { 
        $type: 'button',
        class: 'btn-block btn-primary btn',
        key: number,
        type: 'button',
        $html: '&#8226',
      },
      { $type: 'br' }
    ]
  }
}

function build_row(){
  return {
    class: 'row',
    $components: Array.from(arguments).map( build_button )
  }
}

function build_preview(){
  return {
    class: 'preview row',
    $components: [
      {
        class: 'col col-9',
        $components: [{
          $type: 'input',
          class: 'form-control',
          type: 'text',
          disabled: 'disabled',
        }]
      },
      {
        class: 'col col-3',
        $components: [{
          $type: 'button',
          class: 'btn-block btn-primary btn',
          $text: '<',
          onclick: function(){
            $('#pin_handler')[0].$remove()
          }
        }]
      }
    ]
  }
}

function modal(callback){
  return {
    id: 'pin_handler',
    class: 'modal',
    _pin: '',

    $init(){
      window.addEventListener('keydown', this.$keyboard_handler)
      $(this).modal({backdrop: 'static', keyboard: false})
      this._pin = ''
    },

    $keyboard_handler(e){
      e.preventDefault()
      let k = e.keyCode
      if(k == 8)
        this.$remove()
      else if(k == 13)
        this.$done()
      else if(k > 48 && k < 58)
        this.$add(k - 48)
      else if(k > 96 && k < 106)
        this.$add(k - 96)
    },

    $done(){
      window.removeEventListener('keydown', this.$keyboard_handler)
      callback(null, this._pin)
      $(this).modal('hide').remove()
    },

    $update(){
      $(this).find('.preview input').val('*'.repeat(this._pin.length))
    },

    $add(digit){ this._pin += digit },

    $remove(){ this._pin = this._pin.slice(0, -1) },

    $components: [{
      class: 'modal-dialog',
      $components: [{
        class: 'modal-content',
        $components: [
          {
            class: 'modal-body',
            $components: [
              { 
                class: 'grid',
                $components: [
                  build_row(7,8,9),
                  build_row(4,5,6),
                  build_row(1,2,3)
                ]
              },
              build_preview()
            ]
          },
          {
            class: 'modal-footer',
            $components: [{
              $type: 'button',
              class: 'btn-block btn btn-success',
              type: 'button',
              $text: 'Enter',
              onclick: function(){ $("#pin_handler")[0].$done() }
            }]
          }
        ]
      }]
    }]
  }
}

export function pinHandler(t,c){
  $('body')[0].$build(modal(c))
}

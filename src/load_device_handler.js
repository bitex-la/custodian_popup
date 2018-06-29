import * as device from './device.js'
import {showSuccess, loading, notLoading} from './messages.js'
import {formCheckism, formGroupism} from './lib/bootstrapism.js'

export function loadDeviceHandler(){
  return {
    $tag: 'form#load_device',
    $$: [
      { $tag: 'input#load_device_label',
        $virus: formGroupism('Label'),
        type: 'text',
        name: 'label',
      },
      { $tag: 'input#load_device_pin',
        $virus: formGroupism('PIN'),
        type: 'text',
        name: 'pin',
      },
      { $tag: 'textarea#load_device_mnemonic',
        $virus: formGroupism('Mnemonic'),
        name: 'mnemonic',
        rows: 5
      },
      { $virus: formCheckism('Use Passphrase'),
        name: 'passphrase_protection',
        id: 'load_device_passphrase_protection',
      },
      { $virus: formCheckism('Skip Checksum'),
        name: 'skip_checksum',
        id: 'load_device_skip_checksum',
      },
      { $tag: 'button.btn.btn-primary.btn-block',
        type: 'submit',
        $text: 'Load Device'
      }
    ],
    onsubmit(e){
      e.preventDefault()
      loading()
      device.run((d) => {
        d.session.wipeDevice().then(() => (
          d.session.loadDevice({
            mnemonic: this.mnemonic.value,
            skip_checksum: this.skip_checksum.checked,
            pin: this.pin.value,
            label: this.label.value,
            passphrase_protection: this.passphrase_protection.checked
          })
        )).then(() => {
          notLoading()
          showSuccess("Done setting up device")
          this.reset()
        })
      })
    }
  }
}

import * as device from './device.js'
import {showSuccess, loading, notLoading} from './messages.js'

export function loadDeviceHandler(id){
  return {
    $type: 'form',
    id: id,
    $components: [
      { class: 'form-group',
        $components: [
          { $type: 'label', for: 'load_device_pin', $text: 'Label' },
          { $type: 'input',
            type: 'text',
            class: 'form-control',
            name: 'label',
            id: 'load_device_label',
          }
        ]
      },
      { class: 'form-group',
        $components: [
          { $type: 'label', for: 'load_device_pin', $text: 'PIN' },
          { $type: 'input',
            type: 'text',
            class: 'form-control',
            name: 'pin',
            id: 'load_device_pin',
          }
        ]
      },
      { class: 'form-group',
        $components: [
          { $type: 'label', for: 'load_device_mnemonic', $text: 'Mnemonic' },
          { $type: 'textarea',
            class: 'form-control',
            name: 'mnemonic',
            id: 'load_device_mnemonic',
            rows: 5
          }
        ]
      },
      { class: 'form-check',
        $components: [
          { $type: 'label',
            for: 'load_device_passphrase_protection',
            class: 'form-check-label',
            $components: [
              { $type: 'input',
                type: 'checkbox',
                name: 'passphrase_protection',
                id: 'load_device_passphrase_protection',
                class: 'form-check-input'
              },
              { $type: 'span', $text: 'Use Passphrase'}
            ]
          }
        ]
      },
      { class: 'form-check',
        $components: [
          { $type: 'label',
            for: 'load_device_skip_checksum',
            class: 'form-check-label',
            $components: [
              { $type: 'input',
                type: 'checkbox',
                name: 'skip_checksum',
                id: 'load_device_skip_checksum',
                class: 'form-check-input'
              },
              { $type: 'span', $text: 'Skip Checksum'}
            ]
          }
        ]
      },
      { $type: 'button',
        type: 'submit',
        class: 'btn btn-primary btn-block',
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

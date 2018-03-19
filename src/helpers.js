export function tabs(items){
  return { $components: [nav(items), tab_contents(items)] }
}

export function show_tab(tab){
  $(`.nav-pills a[href="#tab_${tab}"]`).tab('show')
}

function nav(items) {
  return {
    $type: 'ul',
    class: 'nav nav-pills',
    role: 'tablist',
    $components: Object.entries(items).map( ([label, content]) => (
      { $type: 'li',
        class: 'nav-item',
        $init(){
          $(this).on('shown.bs.tab', function (e) {
            $(`#tab_${content.id}`).find("input:first").focus() 
          })
        },
        $components: [{
          $type: 'a',
          class: 'nav-link',
          "data-toggle": 'tab',
          href: `#tab_${content.id}`,
          role: 'tab',
          $text: label
        }]
      }
    ))
  }
}

function tab_contents(tabs) {
  return {
    class: 'tab-content',
    $components: Object.entries(tabs).map(([label, content]) => (
      { class: 'tab-pane',
        id: `tab_${content.id}`,
        role: 'tabpanel',
        $components: [content]
      }
    ))
  }
}

export function text_input_group(label, name, prefix, extra){
  let id = `${prefix}_${name}`
  return _.merge(extra, {
    class: 'form-group',
    $components: [
      { $type: 'label', for: id, $text: label },
      { name, id, $type: 'input', type: 'text', class: 'form-control' }
    ]
  })
}

export function select_group(label, name, prefix, options, selected, extra){
  let id = `${prefix}_${name}`
  return _.merge(extra, {
    class: 'form-group',
    $components: [
      { $type: 'label', for: id, $text: label },
      { name, id, $type: 'select', class: 'form-control',
        $components: _.map(options, (name) => {
          return {$type: 'option', $text: name, value: name}
        })
      }
    ]
  })
}

export function button(label, extra){
  return _.merge(extra, {
    $type: 'button',
    class: 'btn btn-primary',
    $text: label
  })
}

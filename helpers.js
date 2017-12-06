export function tabs(items){
  Object.entries(items).map(function([label, content]){
    if(!content.id){ throw 'Tab panels need id' }
  })
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

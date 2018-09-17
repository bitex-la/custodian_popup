import { hamlism } from './hamlism'
import Cell from '../types/cell'

export function formGroupism (label: string) {
  return function (component: Cell) {
    delete component.$virus
    component.class = 'form-control'

    var $$ = [
      { $tag: 'span.input-group-addon', $text: label },
      component
    ]

    if (component.$help) {
      $$.push(<any>{
        $init () { (<any> window).$(this).popover({ trigger: 'focus' }) },
        $tag: 'span.input-group-btn a.btn.btn-secondary',
        $text: '?',
        role: 'button',
        tabindex: 0,
        'data-toggle': 'popover',
        'data-trigger': 'focus',
        'title': component.$helpTitle || "What's this?",
        'data-content': component.$help
      })
    }

    return hamlism({ class: 'form-group input-group', $$ })
  }
}

export function formCheckism (label: string) {
  return function (component: Cell) {
    delete component.$virus
    Object.assign(component, {
      $type: 'input',
      type: 'checkbox',
      class: 'form-check-input'
    })

    return hamlism({
      class: 'form-check',
      $components: [
        { $type: 'label',
          for: component.id,
          class: 'form-check-label',
          $components: [ component, { $type: 'span', $text: label } ]
        }
      ]
    })
  }
}

export function selectGroupism (label: string, options: string[]) {
  return function (component: Cell) {
    let select = Object.assign(component, {
      $type: 'select',
      class: 'form-control',
      $components: (<any> window)._.map(options, (name: string) => {
        return {$type: 'option', $text: name, value: name}
      })
    })

    return hamlism({
      class: 'form-group input-group',
      $$: [{
        $tag: 'span.input-group-addon',
        $text: label
      }, select]
    })
  }
}

interface Option {
  text: string;
  id: string;
  selected?: string;
}

export function selectObjectGroupism (label: string, options: Option[], selected: string) {
  return function (component: Cell) {
    let select = Object.assign(component, {
      $type: 'select',
      class: 'form-control',
      $components: (<any> window)._.map(options, (obj: Option) => {
        let option: Cell = {$type: 'option', $text: obj.text, value: typeof (obj.id) === 'string' ? obj.id : JSON.stringify(obj.id)}
        if (obj.text === selected) {
          option['selected'] = ''
        }
        return option
      })
    })

    return hamlism({
      class: 'form-group input-group',
      $$: [{
        $tag: 'span.input-group-addon',
        $text: label
      },
      select]
    })
  }
}

export function buttonism (label: string, kind: string = 'primary') {
  return function (component: Cell) {
    return hamlism((<any> window)._.merge(component, {
      $tag: `button.btn.btn-block.btn-${kind}`,
      $text: label
    }))
  }
}

export function buttonismWithSize (label: string, kind: string = 'primary', size: string = 'block') {
  return function (component: Cell) {
    return hamlism((<any> window)._.merge(component, {
      $tag: `button.btn.btn-${size}.btn-${kind}`,
      $text: label
    }))
  }
}

export function cardism (header: string) {
  return function (component: Cell) {
    return hamlism({
      $tag: '.card.my-3',
      $$: [
        { $tag: '.card-header', $text: header },
        { $tag: '.card-body', $$: [component] }
      ]
    })
  }
}

export function tabbism (component: Cell) {
  let navs = (<any> window)._.map(component.$components, (tab: {id: string}) => {
    return hamlism({
      $tag: 'li.nav-item',
      $init () {
        (<any> window).$(this).on('shown.bs.tab', function (e: EventTarget) {
          (<any> window).$(`#tab_${tab.id}`).find('input:first').focus()
        })
      },
      $$: [{
        $tag: 'a.nav-link',
        'data-toggle': 'tab',
        href: `#tab_${tab.id}`,
        role: 'tab',
        $text: (<any> window)._.upperFirst((<any> window)._.lowerCase(tab.id))
      }]
    })
  })

  let tabs = (<any> window)._.map(component.$components, (tab: {id: string}) => {
    return {
      class: 'tab-pane',
      id: `tab_${tab.id}`,
      role: 'tabpanel',
      $components: [tab]
    }
  })

  let initial = component.$components[0].id
  component.$init = function () {
    (<any> window).$(`.nav-pills a[href="#tab_${initial}"]`).tab('show')
  }
  component.$components = [
    { $type: 'ul', class: 'nav nav-pills', role: 'tablist', $components: navs },
    { class: 'tab-content', $components: tabs }
  ]

  return component
}

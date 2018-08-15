import { hamlism } from './hamlism.js'
import $ from 'jquery'
import _ from 'lodash'

export function formGroupism (label) {
  return function (component) {
    delete component.$virus
    component.class = 'form-control'

    var $$ = [
      { $tag: 'span.input-group-addon', $text: label },
      component
    ]

    if (component.$help) {
      $$.push({
        $init () { $(this).popover({ trigger: 'focus' }) },
        $tag: 'span.input-group-btn a.btn.btn-secondary',
        $text: '?',
        role: 'button',
        tabindex: 0,
        'data-toggle': 'popover',
        'data-trigger': 'focus',
        'title': component.$help_title || "What's this?",
        'data-content': component.$help
      })
    }

    return hamlism({ class: 'form-group input-group', $$ })
  }
}

export function formCheckism (label) {
  return function (component) {
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

export function selectGroupism (label, options, selected) {
  return function (component) {
    let select = Object.assign(component, {
      $type: 'select',
      class: 'form-control',
      $components: _.map(options, (name) => {
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

export function selectObjectGroupism (label, options, selected) {
  return function (component) {
    let select = Object.assign(component, {
      $type: 'select',
      class: 'form-control',
      $components: _.map(options, (obj) => {
        let option = {$type: 'option', $text: obj.text, value: typeof (obj.id) === 'string' ? obj.id : JSON.stringify(obj.id)}
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

export function buttonism (label, kind = 'primary') {
  return function (component) {
    return hamlism(_.merge(component, {
      $tag: `button.btn.btn-block.btn-${kind}`,
      $text: label
    }))
  }
}

export function buttonismWithSize (label, kind = 'primary', size = 'block') {
  return function (component) {
    return hamlism(_.merge(component, {
      $tag: `button.btn.btn-${size}.btn-${kind}`,
      $text: label
    }))
  }
}

export function cardism (header) {
  return function (component) {
    return hamlism({
      $tag: '.card.my-3',
      $$: [
        { $tag: '.card-header', $text: header },
        { $tag: '.card-body', $$: [component] }
      ]
    })
  }
}

export function tabbism (component) {
  let navs = _.map(component.$components, (tab) => {
    return hamlism({
      $tag: 'li.nav-item',
      $init () {
        $(this).on('shown.bs.tab', function (e) {
          $(`#tab_${tab.id}`).find('input:first').focus()
        })
      },
      $$: [{
        $tag: 'a.nav-link',
        'data-toggle': 'tab',
        href: `#tab_${tab.id}`,
        role: 'tab',
        $text: _.upperFirst(_.lowerCase(tab.id))
      }]
    })
  })

  let tabs = _.map(component.$components, (tab) => {
    return {
      class: 'tab-pane',
      id: `tab_${tab.id}`,
      role: 'tabpanel',
      $components: [tab]
    }
  })

  let initial = component.$components[0].id
  component.$init = function () {
    $(`.nav-pills a[href="#tab_${initial}"]`).tab('show')
  }
  component.$components = [
    { $type: 'ul', class: 'nav nav-pills', role: 'tablist', $components: navs },
    { class: 'tab-content', $components: tabs }
  ]

  return component
}

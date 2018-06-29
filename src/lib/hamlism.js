export function hamlism(component){
  if(component.$$){
    component.$components = component.$$;
    delete component.$$
  }

  if(component.$components){
    component.$components = component.$components.map(hamlism)
  }

  let tag = component.$tag
  if(!tag) return component

  let selectors = tag.split(' ')
  expandSelector(component, selectors.pop())

  return selectors.reduceRight(function(child, selector){
    return expandSelector({$components: [child]}, selector)
  }, component)
}

function expandSelector(component, selector){
  let parts = selector.match(/([a-zA-Z0-9]*)([#a-zA-Z0-9-_]*)([.a-zA-Z0-9-_]*)/)
  if (parts[1]) component.$type = parts[1]
  if (parts[2]) component.id = parts[2].substring(1)
  if (parts[3]) component['class'] = parts[3].split('.').join(' ').trim()
  return component
}

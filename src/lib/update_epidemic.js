export function updateEpidemic (component) {
  let recursiveUpdate = (node) => {
    for (let n of node.children) {
      n.$update && n.$update()
      recursiveUpdate(n)
    }
  }

  let oldUpdate = component.$update

  component.$update = function () {
    oldUpdate && oldUpdate.call(this)
    recursiveUpdate(this)
  }

  return component
}

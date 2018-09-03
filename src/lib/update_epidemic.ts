import Cell from '../types/cell';

export function updateEpidemic (component: Cell) {
  let recursiveUpdate = (node: ParentNode) => {
    for (let n of <IterableIterator<Element>> Array.prototype[Symbol.iterator].call(node.children)) {
      (<Cell> n).$update && (<Cell> n).$update()
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

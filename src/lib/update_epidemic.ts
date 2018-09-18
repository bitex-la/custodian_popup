import Cell from '../types/cell';

export function updateEpidemic (component: Cell) {
  let recursiveChildrenUpdate = (node: ParentNode) => {
    for (let n of <IterableIterator<Element>> Array.prototype[Symbol.iterator].call(node.children)) {
      (<Cell> n).$update && (<Cell> n).$update();
      recursiveChildrenUpdate(n);
    }
  }

  let recursiveParentUpdate = (node: Node) => {
    (<Cell> node).$update && (<Cell> node).$update();
    recursiveParentUpdate(node.parentNode);
  }

  let oldUpdate = component.$update;

  component.$update = function () {
    oldUpdate && oldUpdate.call(this);
    recursiveChildrenUpdate(this);
    recursiveParentUpdate(this);
  }

  return component;
}

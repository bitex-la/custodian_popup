export default interface Cell {
  $$?: Cell[];
  $components?: Cell[];
  $tag?: string;
  $type?: string;
  id?: string;
  class?: string;
}

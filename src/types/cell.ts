interface Cell {
  $$?: any[];
  $components?: Cell[];
  $help?: boolean;
  $helpTitle?: string;
  $init?: () => void;
  $tag?: string;
  $text?: string;
  $type?: string;
  $virus?: Cell[];
  for?: string;
  id?: string;
  class?: string;
  href?: string;
  role?: string;
  selected?: string;
  tabindex?: number;
  value?: string;
  $update?(): void;
}
abstract class Cell { }
export default Cell

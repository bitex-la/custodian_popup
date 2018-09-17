export default interface Cell {
  $$?: any[];
  $components?: Cell[];
  $help?: boolean;
  $helpTitle?: string;
  $init?: () => void;
  $tag?: string;
  $text?: string;
  $type?: string;
  $update?: () => void;
  $virus?: Cell[];
  for?: string;
  id?: string;
  class?: string;
  href?: string;
  role?: string;
  selected?: string;
  tabindex?: number;
  value?: string;
}

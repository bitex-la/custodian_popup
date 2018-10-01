export function derivationPath(id: string, title: string, derivationPath: string) {
  return {
    id: id,
    $$: [
      {
        class: "form-group input-group",
        $$: [
          {
            $tag: "span.input-group-addon.col-sm-2",
            $text: title
          },
          {
            $tag: "input",
            name: "purpose-path",
            id: "purpose-path",
            class: "form-control col-sm-2",
            type: "number",
            $update () { this.value = this[derivationPath][0]; },
            onchange (e: Event) {
              this[derivationPath][0] = parseInt((<HTMLInputElement> e.target).value);
            }
          },
          {
            $tag: "input",
            name: "coin-type-path",
            id: "coin-type-path",
            class: "form-control col-sm-2",
            type: "number",
            $update () { this.value = this[derivationPath][1]; },
            onchange (e: Event) {
              this[derivationPath][1] = parseInt((<HTMLInputElement> e.target).value);
            }
          },
          {
            $tag: "input",
            name: "account-path",
            id: "account-path",
            class: "form-control col-sm-2",
            type: "number",
            $update () { this.value = this[derivationPath][2]; },
            onchange (e: Event) {
              this[derivationPath][2] = parseInt((<HTMLInputElement> e.target).value);
            }
          },
          {
            $tag: "input",
            name: "change-path",
            id: "change-path",
            class: "form-control col-sm-2",
            type: "number",
            $update () { this.value = this[derivationPath][3]; },
            onchange (e: Event) {
              this[derivationPath][3] = parseInt((<HTMLInputElement> e.target).value);
            }
          },
          {
            $tag: "input",
            name: "address-index-path",
            id: "address-index-path",
            class: "form-control col-sm-2",
            type: "number",
            $update () { this.value = this[derivationPath][4]; },
            onchange (e: Event) {
              this[derivationPath][4] = parseInt((<HTMLInputElement> e.target).value);
            }
          }
        ]
      }
    ]
  };
}

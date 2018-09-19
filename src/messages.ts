
class Message {

  constructor(type: string, text: string, extra: string, hide: boolean) {
    if ((<any> window).$('body > #messages').length == 0) {
      (<any> window).$('body').prepend("<div class='messages mt-2'/>");
    }
    
    let el: HTMLElement = (<any> window).$(`<div class='alert alert-${type} ${extra}'>${text}</div>`);
    (<any> window).$('.messages').append(el);
    if (hide) {
      setTimeout(() => { (<any> window).$('.alert').remove() }, 5000);
    }
  }

}

export function showError (text: string) {
  new Message('danger', text, null, true);
}

export function showInfo (text: string) {
  new Message('info', text, null, true);
}

export function showSuccess (text: string) {
  new Message('success', text, null, true);
}

export function loading () {
  if ((<any>window).$('#messages > .loading').length == 0) {
    new Message('info', 'Loading', 'loading', true);
  }
}

export function notLoading () {
  (<any>window).$('#messages').find('.loading').remove();
}

export function showPermanentMessage (text: string) {
  new Message('success', text, null, false);
}
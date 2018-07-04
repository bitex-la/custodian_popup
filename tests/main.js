//var casper = require('casper').create();
//
//casper.start('http://localhost:9966/', function () {
//  //Array.from(document.getElementsByTagName('a')).forEach(function(item) {
//  //  console.log(item); 
//  //});
//  //this.waitForSelector('a[href="#tab_wallets"]');
//  //this.click('a[href="#tab_wallets"]');
//  console.log(document);
//});
//
//casper.start('http://google.fr/', function() {
//   // Wait for the page to be loaded
//   this.waitForSelector('form[action="/search"]');
//});
//
//casper.run();


var page = require('webpage').create();

page.open('http://localhost:9966/', function() {
    setTimeout(function() {
        phantom.exit();
    }, 200);
});

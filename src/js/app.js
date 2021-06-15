import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initBooking: function(){
    const thisApp = this;
    thisApp.booking = document.querySelector(select.containerOf.booking);
    new Booking(thisApp.booking);
  },
  initPages: function(){
    const thisApp = this; 

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/','');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    } 
    //thisApp.activatePage(thisApp.pages[0].id);
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();

          /* get page id from href attribute  */
          const id = clickedElement.getAttribute('href').replace('#','');

          /* run activatePage with argument = page id */
          thisApp.activatePage(id);

          /* change url hash*/
          window.location.hash = '#/' + id;
        });
    }  
  },
  activatePage: function(pageId){
    const thisApp = this; 

    /* add class active to matching pages, remove from no-matching */
    for(let page of thisApp.pages){
        //if(page.id == pageId){
          //page.classList.add(classNames.pages.active);
        //} else {
         // page.classList.add(classNames.pages.active);
       // }
       page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for(let link of thisApp.navLinks){
     link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
  }

    /* add class active to matching pages, remove from no-matching */

  },
  initMenu: function(){

  const thisApp = this; 
    for(let productData in thisApp.data.products){
      new Product( thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function(){
  const thisApp = this;

  thisApp.data = {}; 

  const url = settings.db.url + '/' + settings.db.products;

  fetch(url).then(function(rawResponse){ 
      return rawResponse.json();
  })
      .then(function(prasedResponse){
  console.log('prasedResponse',prasedResponse);

  thisApp.data.products = prasedResponse;
    thisApp.initMenu();
  });

  console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function(){
  const thisApp = this;

  thisApp.cart = new Cart(document.querySelector(select.containerOf.cart)); 

  console.log('thisApp.cart',thisApp.cart);

  thisApp.prodctList = document.querySelector(select.containerOf.menu);

  thisApp.prodctList.addEventListener('add-to-cart', function(event){
    app.cart.add(event.detail.product.prepareCartProduct());
    });
  },
  init: function(){
  const thisApp = this;
  console.log('*** App starting ***');
  console.log('thisApp:', thisApp);
  console.log('classNames:', classNames);
  console.log('settings:', settings);
  console.log('templates:', templates);
  thisApp.initPages();

  thisApp.initData();
  thisApp.initCart();

  thisApp.initBooking();
  }
};

  app.init();
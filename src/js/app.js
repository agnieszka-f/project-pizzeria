	import {settings, select, classNames, templates} from './settings.js';
	import Product from './components/Product.js';
	import Cart from './components/Cart.js';
	
	const app = {
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
			thisApp.initData();
			thisApp.initCart();
			}
		};

		app.init();
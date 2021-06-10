/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';

  const select = {
    templateOf: {
		menuProduct: '#template-menu-product',
		cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
		linkDecrease: 'a[href="#less"]',
		linkIncrease: 'a[href="#more"]',
      },
    },
// CODE ADDED START
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
	// CODE ADDED START
	cart: {
		wrapperActive: 'active',
  },
  // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
     }, // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
  },
  db: {
	url: '//localhost:3131',
	products: 'products',
	orders: 'orders',
},
  // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
	// CODE ADDED START
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
  };

  class Product{
	constructor(id, data){
		const thisProduct = this;

		thisProduct.id = id;
		thisProduct.data = data;
			
		thisProduct.renderInMenu();
		thisProduct.getElements();
		thisProduct.initAccordion();
		thisProduct.initOrderForm();
		thisProduct.initAmountWidget();
		thisProduct.processOrder();
		
		console.log('thisProduct', thisProduct);
	}
			
		renderInMenu(){
			const thisProduct = this;

			// wygenerować kod HTML pojedynczego produktu,
			const generateHTML = templates.menuProduct(thisProduct.data);		 

			// stworzyć element DOM na podstawie tego kodu produktu,
			thisProduct.element = utils.createDOMFromHTML(generateHTML);                     

			// znaleźć na stronie kontener menu,
			const menuContainer = document.querySelector(select.containerOf.menu);

			// wstawić stworzony element DOM do znalezionego kontenera menu
			menuContainer.appendChild(thisProduct.element);
		}
		
		getElements(){
			const thisProduct = this;

			thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); 
			thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); 					
			thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);				
			thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);		
			thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
			thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); 
			thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
}
		
		initAccordion(){
			const thisProduct = this; 																  
			
			thisProduct.accordionTrigger.addEventListener('click', function(event){
				event.preventDefault();
				
				const activeProduct = document.querySelector(select.all.menuProductsActive);
				
				// znaleźć aktywny produkt i (o ile istnieje) zabrać mu klasę active 
				if(activeProduct && activeProduct !== thisProduct.element){ 
					activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
				} 
				//nadawać lub odbierać (toggle) klasę zdefiniowaną w active na elemencie bieżącego produktu 
				thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
			});
		}
		
		initOrderForm(){
			//metoda odpowiedzialna za dodanie listenerów eventów do formularza, jego kontrolek, oraz guzika dodania do koszyka
			const thisProduct = this; 									
			
			thisProduct.form.addEventListener('submit', function(event){
				event.preventDefault();
				thisProduct.processOrder();
			}
			);
			for(let input of thisProduct.formInputs){
				input.addEventListener('change', function(){
					thisProduct.processOrder();           
				}
				);								
			}
			thisProduct.cartButton.addEventListener('click', function(event){
				event.preventDefault();
				thisProduct.processOrder();
				thisProduct.addToCart();
			}
			);
		}
		
		processOrder(){
			const thisProduct = this;										
			
			const fromData = utils.serializeFormToObject(thisProduct.form);

			let price = thisProduct.data.price; 									
			
			for(let paramId in thisProduct.data.params){
				const param = thisProduct.data.params[paramId]; 		 												
				
				for(let optionId in param.options){
					const option = param.options[optionId]; 			
					
					const optionSelected = fromData[paramId].includes(optionId);
					
					const optionImg = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId); 
					
					if(optionSelected){					
						if(!option.hasOwnProperty('default')){
							price = price + option.price;
						}
						if(optionImg) {
							optionImg.classList.add(classNames.menuProduct.imageVisible);
						}
					} else {
						if(option.hasOwnProperty('default')){
							price = price - option.price;
						}
						if(optionImg) {
							optionImg.classList.remove(classNames.menuProduct.imageVisible);
						}
					}
				}
			}
			thisProduct.priceSingle = price; 
			price *=thisProduct.amountWidget.value;
			thisProduct.priceElem.innerHTML = price;
		}
		initAmountWidget(){
			const thisProduct = this;
			
			thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
			
			thisProduct.amountWidgetElem.addEventListener('updated', function(){
				thisProduct.processOrder();
			});
		}
		addToCart(){
			const thisProduct = this;
			
			app.cart.add(thisProduct.prepareCartProduct());
		}
		prepareCartProduct(){
			const thisProduct = this;
			
			const productSummary = {
				id: thisProduct.id,
				name: thisProduct.data.name,
				amount: thisProduct.amountWidget.value,
				priceSingle: thisProduct.priceSingle,
				price: thisProduct.priceSingle * thisProduct.amountWidget.value,
				params: {},
			}; 
			productSummary.params = thisProduct.prepareCartProductParams(); 
			return productSummary;
		}
		prepareCartProductParams(){
			const thisProduct = this;										
			
			const fromData = utils.serializeFormToObject(thisProduct.form);		

			const objParams = {};
			
			for(let paramId in thisProduct.data.params){
				const param = thisProduct.data.params[paramId];
				
				objParams[paramId] = {label: param.label, options:{}};
				
				for(let optionId in param.options){
					const option = param.options[optionId]; 
					
					const optionSelected = fromData[paramId].includes(optionId);
					if(optionSelected){
						objParams[paramId].options[optionId] = option.label;
					}
				}
			} 
			return objParams;
		}
}
	class AmountWidget{
		constructor(element){
			const thisWidget = this;
			
			thisWidget.getElements(element);
			
			thisWidget.setValue(thisWidget.input.value); 
			thisWidget.initActions();
			
			console.log('thisWidget',thisWidget);
		}
		getElements(element){
			const thisWidget = this;
			thisWidget.element = element;
			
			thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); 
			thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
			thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
		}
		setValue(value){  
			const thisWidget = this;
			
			const newValue = parseInt(value);
			
			if(!isNaN(newValue) && newValue !== thisWidget.value && newValue <= settings.amountWidget.defaultMax + 1 && newValue >= settings.amountWidget.defaultMin -1){
				thisWidget.value = newValue;
				thisWidget.announce();
			} 
			if(thisWidget.value === undefined){
				thisWidget.value = settings.amountWidget.defaultValue;
			}
			thisWidget.input.value = thisWidget.value; 
		}
		initActions(){
			const thisWidget = this;
			
			thisWidget.input.addEventListener('change', function(){
				thisWidget.setValue(thisWidget.input.value);
			});
			thisWidget.linkDecrease.addEventListener('click', function(){

					thisWidget.setValue(thisWidget.value - 1);
			});
			thisWidget.linkIncrease.addEventListener('click', function(){ 
				
					thisWidget.setValue(thisWidget.value + 1);
			});
		}
		announce(){ 
			const thisWidget = this;
			//const event = new Event('updated');
			const event = new CustomEvent('updated', {bubbles: true}
			);
			
			thisWidget.element.dispatchEvent(event);
		}
	}
	class Cart{
		constructor(element){
			const thisCart = this;
			
			//tablica w której będziemy przechowywać produkty dodane do koszyka
			thisCart.products = [];
			
			thisCart.getElements(element);
			
			thisCart.initActions();
			
			console.log('new Cart', thisCart);
		}
		
		getElements(element){
			const thisCart = this;
			
			//referencja do elemtów DOM
			thisCart.dom ={};
			
			thisCart.dom.wrapper = element; 
			
			//znajduje div o klasie .cart__summary
			thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
			
			thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); 
			
			thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
			thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
			thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
			thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
			thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
			thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
			thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
		}
		initActions() {
			const thisCart = this;

			thisCart.dom.toggleTrigger.addEventListener('click', function(){
				thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
			});

			thisCart.dom.productList.addEventListener('updated', function(){
				thisCart.update();
			});

			thisCart.dom.productList.addEventListener('removed', function(event){ 
				thisCart.remove(event.detail.cartProduct); 
			});
			
			thisCart.dom.form.addEventListener('submit',function(event){ 
				event.preventDefault();
				thisCart.sendOrder();
			});
		}
		add(menuProduct){
			const thisCart = this;

			const generateHTML = templates.cartProduct(menuProduct); 

			thisCart.generatedDOM = utils.createDOMFromHTML(generateHTML); 

			thisCart.dom.productList.appendChild(thisCart.generatedDOM);
			
			thisCart.products.push(new CartProduct(menuProduct,thisCart.generatedDOM)); 
			
			thisCart.update();
			
			console.log('koszyk po aktualizacji: ', thisCart);
		}
		update(){
			const thisCart = this;
			
			const deliveryFee = settings.cart.defaultDeliveryFee;
			
			let totalNumber = 0; //całościowa liczba sztuk
			
			let subTotalPrice = 0; //zsumowana cena za wszystko (bez kosztu dostawy)
			
			for(let product of thisCart.products){
				totalNumber = totalNumber + product.amount;
				subTotalPrice = subTotalPrice + product.price;
			}
			if(totalNumber!==0){
				thisCart.totalPrice = subTotalPrice + deliveryFee;
				thisCart.dom.deliveryFee.innerHTML = deliveryFee;
			} else {
				thisCart.totalPrice = 0;
				thisCart.dom.deliveryFee.innerHTML = 0;
			}
			
			thisCart.dom.subTotalPrice.innerHTML = subTotalPrice;
			thisCart.dom.totalNumber.innerHTML = totalNumber;
			for(let total of thisCart.dom.totalPrice){
				total.innerHTML = thisCart.totalPrice;
			}
		}
		remove(product){
			const thisCart = this;
			//Usunięcie reprezentacji produktu z HTML-a
			product.dom.wrapper.remove();
			//Usunięcie informacji o danym produkcie z tablicy thisCart.product
			const index = thisCart.products.indexOf(product);
			thisCart.products.splice(index,1);
			//Wywołać metodę update w celu przeliczenia sum po usunięciu produktu
			thisCart.update();
		}
		sendOrder(){
			const thisCart = this;
			
			const url = 'http:' + settings.db.url + '/' + settings.db.orders; console.log(url);
			
			const payload = {
				address: thisCart.dom.address.value,
				phone: thisCart.dom.phone.value,
				subTotalPrice: thisCart.dom.subTotalPrice.innerText,
				totalPrice: thisCart.totalPrice,
				deliveryFee: thisCart.dom.deliveryFee.innerText,
				totalNumber: thisCart.dom.totalNumber.innerText,
				products: [],
			};  
			for(let prod of thisCart.products){
				payload.products.push(prod.getData());
			}
			console.log(payload);
			
			const options = {
				method: 'POST', 
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload)
			}
			
			fetch(url, options)
				.then(function(response){
					return response.json();
				}).then(function(prasedResponse){
					console.log('odpowiedź: ',prasedResponse);
			});
		}
	}
	class CartProduct{
		//menuProduct - referencja do obiektu podsumowania, referencja do utworzonego dla tego produktu elementu html - generatedDOM
		constructor(menuProduct, element){
			const thisCartProduct = this;
			
			thisCartProduct.id = menuProduct.id;
			thisCartProduct.name = menuProduct.name;
			thisCartProduct.amount = menuProduct.amount;
			thisCartProduct.price = menuProduct.price;
			thisCartProduct.priceSingle = menuProduct.priceSingle;
			thisCartProduct.params = menuProduct.params;
			
			thisCartProduct.getElements(element);
			thisCartProduct.initAmountWidget();
			thisCartProduct.initAction();
			
			console.log('new CartProduct: ',thisCartProduct);
		}
		getElements(element){
			const thisCartProduct = this;
			
			thisCartProduct.dom = {};
			
			thisCartProduct.dom.wrapper = element;
			thisCartProduct.dom.amount = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
			thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
			thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
			thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
		}
		initAmountWidget(){
			const thisCartProduct = this;

			thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amount);
			
			thisCartProduct.dom.amount.addEventListener('updated', function(){

				thisCartProduct.amount = thisCartProduct.amountWidget.value;
				thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
				thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
			});
		}
		remove(){ 
			const thisCartProduct = this;
			
			const event = new CustomEvent('removed', {
				bubbles: true,
				detail: {
					cartProduct: thisCartProduct,
				},
			}); 
			thisCartProduct.dom.wrapper.dispatchEvent(event);
		}
		initAction(){
			const thisCartProduct = this;
			
			thisCartProduct.dom.edit.addEventListener('click',function(event){
				event.preventDefault();
			});
			thisCartProduct.dom.remove.addEventListener('click',function(event){
				event.preventDefault();
				thisCartProduct.remove();
			});
		}
		getData(){
			const thisCartProduct = this;
			const dataCartProduct = {
				id: thisCartProduct.id, 
				amount: thisCartProduct.amount, 
				price: thisCartProduct.price, 
				priceSingle: thisCartProduct.priceSingle, 
				name: thisCartProduct.name,
				params: thisCartProduct.params,
			}; 
			return dataCartProduct;
		}
	}
	
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
}
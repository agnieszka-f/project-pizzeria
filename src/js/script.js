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
}
	class AmountWidget{
		constructor(element){
			const thisWidget = this;
			
			thisWidget.getElements(element);
			thisWidget.setValue(thisWidget.input.value); 
			thisWidget.initActions();
			
			console.log('thisWidget',thisWidget);
			console.log('element',element);
		}
		getElements(element){
			const thisWidget = this;
			thisWidget.element = element;
			
			thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
			thisWidget.input.value = settings.amountWidget.defaultValue; 
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
			const event = new Event('updated');
			
			thisWidget.element.dispatchEvent(event);
		}
	}
	const app = {
		initMenu: function(){

			const thisApp = this; 
			for(let productData in thisApp.data.products){
				new Product(productData, thisApp.data.products[productData]);
			}
		},
		initData: function(){
			const thisApp = this;

			thisApp.data = dataSource; 
		},
		init: function(){
			const thisApp = this;
			console.log('*** App starting ***');
			console.log('thisApp:', thisApp);
			console.log('classNames:', classNames);
			console.log('settings:', settings);
			console.log('templates:', templates);
			thisApp.initData();
			thisApp.initMenu();
			}
		};

		app.init();
}
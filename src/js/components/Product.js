import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
			
			//app.cart.add(thisProduct.prepareCartProduct());
			const event = new CustomEvent('add-to-cart', {
				bubbles: true,
				detail: {
					product: thisProduct,
				},
			});
			thisProduct.element.dispatchEvent(event);
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

export default Product;
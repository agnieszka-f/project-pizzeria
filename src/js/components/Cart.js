import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

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
			
			const options = {
				method: 'POST', 
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload)
			};
			
			fetch(url, options)
				.then(function(response){
					return response.json();
				}).then(function(prasedResponse){
					console.log('odpowiedź: ',prasedResponse);
			});
		}
	}
	export default Cart;
	
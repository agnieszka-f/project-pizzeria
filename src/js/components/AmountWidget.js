import {settings, select} from '../settings.js';

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
	export default AmountWidget;
import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
//import { utils } from '../utils.js';

class Booking{
    constructor(container){
        const thisBooking = this;
        thisBooking.render(container);
        thisBooking.initWidgets();
    }
    render(container){ 
        const thisBooking = this;

        const generateHTML = templates.bookingWidget(); 
        
        //thisBooking.element = utils.createDOMFromHTML(generateHTML); 
        //container.appendChild(thisBooking.element);
        
        thisBooking.dom = {};
        thisBooking.dom.wrapper = container;
        thisBooking.dom.wrapper.innerHTML = generateHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    }
    initWidgets(){
        const thisBooking = this;
        
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount); 
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount); 
    }
}

export default Booking;
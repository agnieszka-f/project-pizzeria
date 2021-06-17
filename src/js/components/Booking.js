import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
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
    
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }
    initWidgets(){
        const thisBooking = this;
        
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount); 
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount); 

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    }
}

export default Booking;
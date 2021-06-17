import { templates, select, settings } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
//import { utils } from '../utils.js';

class Booking{
    constructor(container){
        const thisBooking = this;
        thisBooking.render(container);
        thisBooking.initWidgets();
        thisBooking.getData(); 
    }
    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
               startDateParam,
               endDateParam,
            ],
            eventCurrent: [
               settings.db.notRepeatParam,
               startDateParam,
               endDateParam,
            ],
            eventRepeat: [
              settings.db.repeatParam,
              endDateParam,
            ],
        };
        const urls = {
            booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
            eventCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventCurrent.join('&'),
            eventRepeat: settings.db.url + '/' + settings.db.event+ '?' + params.eventRepeat.join('&'),
        };

        Promise.all([fetch(urls.booking), fetch(urls.eventCurrent), fetch(urls.eventRepeat)])
        .then(function(allResonses){
            const bookingResonse = allResonses[0];
            const eventCurrentResponse = allResonses[1];
            const eventRepeatResponse = allResonses[2];

            return Promise.all([ bookingResonse.json(), eventCurrentResponse.json(), eventRepeatResponse.json()]);
        })
        .then(function([bookings, eventCurrent, eventRepeat]){
            console.log('bookings:',bookings);
            console.log('eventCurrent:',eventCurrent);
            console.log('eventRepeat:',eventRepeat);
        });
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
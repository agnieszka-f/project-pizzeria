import { templates, select, settings, classNames } from '../settings.js';
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
            //console.log('bookings:',bookings);
            //console.log('eventCurrent:',eventCurrent);
            //console.log('eventRepeat:',eventRepeat);
            thisBooking.parseData(bookings, eventCurrent, eventRepeat);
        });
    }
    parseData(bookings, eventCurrent, eventRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of eventCurrent){
            //dla każdego sotlika zawartego w item zapisujemy jego zajętość w obiekcie booked
            thisBooking.makeBooked(item.date, item.hour, item.table, item.duration);
        }
        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.table, item.duration);
        }
        for(let item of eventRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = thisBooking.datePicker.minDate; loopDate <= thisBooking.datePicker.maxDate; loopDate = utils.addDays(loopDate,1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.table, item.duration);
                }
            }
        }
        console.log('thisBooking.booked',thisBooking.booked);

        thisBooking.updateDOM();
    }
    makeBooked(date, hour, table, duration){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }
        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock +=0.5){
            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }
    
            thisBooking.booked[date][hourBlock].push(table);
        }
    }
    updateDOM(){ 
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }
        //iterowanie po wszytskich stolikach
        for(let table of thisBooking.dom.tables){ //console.log('table',table);
            //pobranie id wybranego stolika
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            //console.log('tableId',tableId);
            //konwertujemy pobrane id na liczbę 
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
           // console.log('!allAvailable',!allAvailable);
            if( //czy nie wszytsie stoliki są dostępne
                !allAvailable
                && //czy tego dnia o tej godzinie zajety jest stolik o tym id
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){  
                table.classList.add(classNames.booking.tableBooked); //console.log('add class',table);
            } else { 
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
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
        console.log('thisBooking.dom.hourPicker ',thisBooking.dom.hourPicker );
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    }
    initWidgets(){
        const thisBooking = this;
        
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount); 
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount); 

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
        console.log('thisBooking.hourPicker',thisBooking.hourPicker);
       thisBooking.dom.wrapper.addEventListener('updated',function(){
            thisBooking.updateDOM();
        });
    }

}

export default Booking;
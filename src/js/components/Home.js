import {app} from '../app.js';

class Home{
    constructor(container){
        const thisHome = this;

        thisHome.render(container);
        thisHome.initLinks();
        thisHome.initCarousel();
    }
    render(container) {
        const thisHome = this;

        thisHome.dom = {};
        thisHome.dom.links = container.querySelector('.home-page-img');
        thisHome.dom.carousel = container.querySelector('.main-carousel');
    }
    initLinks(){
        const thisHome = this;

        thisHome.dom.links.addEventListener('click', function(event){
            const clickedLink = event.target.getAttribute('id');

           if(clickedLink === 'order' || clickedLink === 'booking'){
            app.activatePage(clickedLink);
           }
        });
    }
    initCarousel(){
        const thisHome = this;

        // eslint-disable-next-line no-undef
        thisHome.flickity = new Flickity( thisHome.dom.carousel, {
            autoPlay: 6000,
            prevNextButtons: false,
          });
        
    }
}
export default Home;
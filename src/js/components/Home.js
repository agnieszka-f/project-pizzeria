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
 
            if(event.target.getAttribute('link') != null){
                app.activatePage(event.target.getAttribute('link')); 
            } else if (event.target.offsetParent.getAttribute('link') != null){
                app.activatePage(event.target.offsetParent.getAttribute('link'));
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
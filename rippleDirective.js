/***********************************************************************
 * Ripple Directive
 * Author: Brenton Klik
 * 
 * Prerequisites:
 *  - AngularJS
 *  - styleSheetFactory (https://github.com/bklik/styleSheetFactory)
 * 
 * Description:
 * Creates the expanding/fading material design circle effect, that
 * radiates from a click/touch's origin. Any element where this
 * directive is used, should have the following CSS properties:
 *  - position: relative;
 *  - overflow: hidden; (recommended)
/**********************************************************************/
angular.module('rippleDirective', ['styleSheetFactory'])

.directive('ripple', ['$timeout', 'styleSheetFactory', function($timeout, styleSheetFactory) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            // Tracks when a touch event fires before a mouse event.
            var isTouch = false;

            // The amount of time (in miliseconds) you want the animation to last.
            var animationLength = 600;

            // Fuse for removeing the style.
            var removeTime = 0;

            // The document's stylesheet.
            var styleSheet = styleSheetFactory.getStyleSheet();

            // The prefix used by the browser for non-standard properties.
            var prefix = styleSheetFactory.getPrefix();

            // Sets the default color for the ripple.
            var rippleColor = $attrs.ripplecolor || '#ccc';

            // Add this directive's styles to the document's stylesheet.
            styleSheetFactory.addCSSRule(styleSheet, '.ripple-effect',
                'border-radius: 50%;' +
                'pointer-events: none;' +
                'position: absolute;'
            , 1);

            // Add the animation used to the directove to the document's stylesheet.
            styleSheetFactory.addCSSKeyframes(styleSheet, 'ripple-effect',
                '0% {' +
                    'opacity: .75;' +
                    '-'+prefix+'-transform: scale(0);' +
                    'transform: scale(0);' +
                '}' +
                '100% {' +
                    'opacity: 0;' +
                    '-'+prefix+'-transform: scale(1);' +
                    'transform: scale(1);' +
                '}'
            , 1);

            // Add the element that will be animated to the element using this directive.
            $element.append(angular.element('<div class="ripple-effect"></div>'));

            // A method for removing the directive's style and animation.
            var removeStyle = function() {
                $element[0].querySelector('.ripple-effect').setAttribute('style', '');
            };

            // Causes the ripple effect to happen from the event's point of origin.
            var makeRipple = function(event, isTouch) {
                // If the fuse is lit, reset the length of the fuse, otherwise, light the fuse
                if(removeTime <= 0) {
                    removeTime = animationLength;
                    delayRemove();
                } else {
                    removeTime = animationLength;
                    removeStyle();
                }

                var root = $element[0];
                var effect = root.querySelector('.ripple-effect');
                var rootRect = root.getBoundingClientRect();
                var size = (rootRect.width > rootRect.height) ? rootRect.width : rootRect.height;
                var animation = 'ripple-effect ease-out ' + animationLength + 'ms forwards;';
                var eventX = 0;
                var eventY = 0;

                // Make sure effect visible on top of all other elements.
                $element.append(effect);

                if(isTouch) {
                    eventX = event.touches[0].clientX;
                    eventY = event.touches[0].clientY;
                } else {
                    eventX = event.clientX;
                    eventY = event.clientY;
                }
                
                effect.setAttribute('style',
                    'background-color:' + rippleColor + ';' + 
                    'width: ' + size + 'px;' +
                    'height: ' + size + 'px;' +
                    'top:' + ((eventY - rootRect.top) - (size / 2)) + 'px;' +
                    'left:' + ((eventX - rootRect.left) - (size / 2)) + 'px;' +
                    '-'+prefix+'-animation: ' + animation +
                    'animation: ' + animation
                );
            };

            // Fuse function to remove the animation
            var delayRemove = function() {
                if(removeTime > 0) {
                    removeTime -= 10;
                    $timeout(delayRemove, 10);
                } else {
                    removeStyle();
                }
            };

            // Creates a touchstart event handler which triggers a ripple.
            $element.bind('touchstart', function(event) {
                isTouch = true;
                makeRipple(event, true);
            });

            // Creates a mousedown event handler, which triggers a ripple if
            // the element wasn't 'touched' first.
            $element.bind('mousedown', function(event) {
                if(!isTouch) {
                    makeRipple(event, false);
                }
                isTouch = false;
            });
        }
    }
}]);
